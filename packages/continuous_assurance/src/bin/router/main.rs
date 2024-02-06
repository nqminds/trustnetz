use std::error::Error;
use std::fs::read;
use std::sync::Arc;
use std::time::Duration;
use openssl::hash::MessageDigest;
use openssl::pkey::PKey;
use openssl::sign::Verifier;
use openssl::x509::X509;
use serde_json::{from_str, json, Value};
use tokio::io::{AsyncReadExt, AsyncWriteExt, split};
use tokio::net::TcpStream;
use tokio::spawn;
use tokio::sync::Mutex;
use tokio::time::sleep;
use tokio_rustls::rustls::pki_types::{CertificateDer, DnsName, PrivateKeyDer, PrivatePkcs8KeyDer, ServerName};
use tokio_rustls::rustls::{ClientConfig, RootCertStore};
use tokio_rustls::TlsConnector;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = std::env::args().collect();
    let binding = String::from("router1");
    let file_name = args.get(1).unwrap_or(&binding);
    let binding = String::from(".");
    let key_path = args.get(2).unwrap_or(&binding);

    let mut root_store = RootCertStore::empty();
    root_store.add(CertificateDer::from(
        X509::from_pem(read(format!("{}/ca.crt", key_path))?.as_slice())?.to_der()?
    ))?;
    let config = ClientConfig::builder()
        .with_root_certificates(root_store)
        .with_client_auth_cert(
            vec![CertificateDer::from(
                X509::from_pem(read(format!("{}/{}.crt", key_path, file_name))?.as_slice())?.to_der()?
            )],
            PrivateKeyDer::from(PrivatePkcs8KeyDer::from(
                PKey::private_key_from_pem(read(format!("{}/{}.key", key_path, file_name))?.as_slice())?.private_key_to_pkcs8()?
            ))
        )?;

    let address;
    let port;
    'outer: loop {
        let output = std::process::Command::new("avahi-browse").args(["-r", "_brski._tcp", "-t", "-p"]).output()?;
        let output = String::from_utf8(output.stdout)?;
        for line in output.split('\n') {
            let service: Vec<&str> = line.split(';').collect();
            if service[0] == "=" && service[2] == "IPv4" && service[3] == "brski-multi-router-test" {
                address = String::from(service[7]);
                port = String::from(service[8]);
                break 'outer;
            }
        }
        println!("Service not found, retrying in 10 seconds");
        sleep(Duration::from_secs(10)).await;
    }

    let server_name = ServerName::DnsName(DnsName::try_from("registrar")?);
    let connector = TlsConnector::from(Arc::new(config.clone()));
    let stream = TcpStream::connect(format!("{}:{}", address, port)).await?;
    let stream = connector.connect(server_name, stream).await?;
    println!("Connected to {}:{}", address, port);

    let (mut reader, mut writer) = split(stream);
    let responses: Arc<Mutex<Vec<Value>>> = Arc::new(Mutex::new(Vec::new()));
    let responses_clone = responses.clone();

    spawn(async move {
        let mut received = Vec::new();
        loop {
            let mut buf = [0u8; 64];
            let length = reader.read(&mut buf).await.unwrap();
            received.append(&mut buf[..length].to_vec());
            while let Some(position) = received.iter().position(|x| x == &b'\0') {
                let vc = from_str::<Value>(std::str::from_utf8(&received[..position]).unwrap()).unwrap();
                // TODO should search list of trusted certificates/public keys
                let public_key = X509::from_pem(read("registrar.crt").unwrap().as_slice()).unwrap().public_key().unwrap();

                let mut verifier = Verifier::new(MessageDigest::sha256(), &public_key).unwrap();
                verifier.update(vc["payload"].to_string().as_bytes()).unwrap();
                match verifier.verify(hex::decode(vc["signature"].as_str().unwrap()).unwrap().as_slice()).unwrap() {
                    true => {
                        // Revoke
                        let message = json!({"Command": vc, "Status": "Success"});
                        println!("{}", message);
                        responses_clone.lock().await.push(message);
                    }
                    false => {
                        let message = json!({"Command": vc, "Status": "Denied"});
                        println!("{}", message);
                        responses_clone.lock().await.push(message);
                    }
                }
                received = received[position+1..received.len()].to_vec();
            }
        }
    });

    loop {
        if let Some(response) = responses.lock().await.pop() {
            writer.write_all([response.to_string().as_bytes(), [b'\0'].as_slice()].concat().as_slice()).await?;
        }
        sleep(Duration::from_millis(100)).await;
    }
}