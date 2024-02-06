use std::collections::HashMap;
use std::error::Error;
use std::fs::{File, read};
use std::io::{BufRead, BufReader};
use std::process::Stdio;
use std::sync::Arc;
use std::time::Duration;
use openssl::hash::MessageDigest;
use openssl::pkey::PKey;
use openssl::sign::Signer;
use openssl::x509::X509;
use serde_json::{from_str, json, Value};
use tokio::io::{AsyncReadExt, AsyncWriteExt, split};
use tokio::net::TcpListener;
use tokio::spawn;
use tokio::sync::Mutex;
use tokio::time::sleep;
use tokio_rustls::rustls::pki_types::{CertificateDer, PrivateKeyDer, PrivatePkcs8KeyDer};
use tokio_rustls::rustls::{RootCertStore, ServerConfig};
use tokio_rustls::rustls::server::WebPkiClientVerifier;
use tokio_rustls::TlsAcceptor;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = std::env::args().collect();
    let binding = String::from(".");
    let key_path = args.get(2).unwrap_or(&binding);

    let private_key = PKey::private_key_from_pem(read(format!("{}/registrar.key", key_path))?.as_slice())?;
    let mut root_store = RootCertStore::empty();
    root_store.add(CertificateDer::from(
        X509::from_pem(read(format!("{}/ca.crt", key_path))?.as_slice())?.to_der()?
    ))?;
    let config = ServerConfig::builder()
        .with_client_cert_verifier(
            WebPkiClientVerifier::builder(root_store.into()).build()?
        )
        .with_single_cert(
            vec![CertificateDer::from(
                X509::from_pem(read(format!("{}/registrar.crt", key_path))?.as_slice())?.to_der()?
            )],
            PrivateKeyDer::from(PrivatePkcs8KeyDer::from(private_key.private_key_to_pkcs8()?))
        )?;

    let acceptor = TlsAcceptor::from(Arc::new(config));
    let listener = TcpListener::bind("0.0.0.0:3030").await?;

    std::process::Command::new("avahi-publish")
        .args(["-s", "brski-multi-router-test", "_brski._tcp", "3030"]).stdout(Stdio::null()).spawn()?;

    let queue: Arc<Mutex<HashMap<Arc<Vec<u8>>, Vec<Value>>>> = Arc::new(Mutex::new(HashMap::new()));

    let queue_clone = queue.clone();
    spawn(async move {
        let mut counter = 0;
        loop {
            let mut reader = BufReader::new(File::open("trust.txt").unwrap());
            let mut buffer = String::new();
            let mut i = 0;
            let mut lock = queue_clone.lock().await;
            while reader.read_line(&mut buffer).unwrap() != 0 {
                if i >= counter {
                    let split: Vec<&str> = buffer.trim().split(' ').collect();
                    if split[1] == "N" {
                        for (_, v) in lock.iter_mut() {
                            let mut vc = json!({
                                "header" : {
                                    "alg": "RS256",
                                    "typ": "JWT"
                                },
                                "payload": {
                                    "command": {"Revoke": split[0]}
                                }
                            });
                            let mut signer = Signer::new(MessageDigest::sha256(), &private_key).unwrap();
                            signer.update(vc["payload"].to_string().as_bytes()).unwrap();
                            vc["signature"] = json!(hex::encode(signer.sign_to_vec().unwrap()));
                            v.push(vc);
                        }
                    }
                }
                buffer.clear();
                i += 1;
            }
            counter = i;
            sleep(Duration::from_millis(100)).await;
        }
    });

    loop {
        let (stream, peer_addr) = listener.accept().await?;
        let stream = acceptor.accept(stream).await?;
        println!("{} connected", peer_addr);
        let peer_cert = Arc::new(X509::from_der(stream.get_ref().1.peer_certificates().unwrap()[0].as_ref())?.to_pem()?);
        let write_peer_cert = peer_cert.clone();
        let read_peer_cert = peer_cert.clone();

        queue.lock().await.entry(peer_cert).or_insert_with(Vec::new);
        let (mut reader, mut writer) = split(stream);

        let queue_clone = queue.clone();
        let write_task = spawn(async move {
            loop {
                for command in queue_clone.lock().await.get_mut(&write_peer_cert).unwrap() {
                    writer.write_all([command.to_string().as_bytes(), [b'\0'].as_slice()].concat().as_slice()).await.unwrap();
                }
                sleep(Duration::from_millis(100)).await;
            }
        });

        let queue_clone = queue.clone();
        spawn(async move {
            let mut received = Vec::new();
            loop {
                let mut buf = [0u8; 64];
                if let Ok(length) = reader.read(&mut buf).await {
                    received.append(&mut buf[..length].to_vec());
                    while let Some(position) = received.iter().position(|x| x == &b'\0') {
                        let json = from_str::<Value>(std::str::from_utf8(&received[..position]).unwrap()).unwrap();
                        if json["Status"].as_str().unwrap().eq("Success") {
                            println!("{:?}", json);
                            queue_clone.lock().await.get_mut(&read_peer_cert).unwrap().retain(|x| x != &json["Command"]);
                        }
                        received = received[position+1..received.len()].to_vec();
                    }
                } else {
                    eprintln!("{} disconnected", peer_addr);
                    write_task.abort();
                    break;
                }
            }
        });
    }
}