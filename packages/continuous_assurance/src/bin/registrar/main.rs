use std::error::Error;
use std::fs::{read, read_to_string};
use std::process::Stdio;
use std::sync::Arc;
use std::time::Duration;
use openssl::pkey::PKey;
use openssl::x509::X509;
use serde_json::{from_str, json, Value};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::time::sleep;
use tokio_rustls::rustls::pki_types::{CertificateDer, PrivateKeyDer, PrivatePkcs8KeyDer};
use tokio_rustls::rustls::{RootCertStore, ServerConfig};
use tokio_rustls::rustls::server::WebPkiClientVerifier;
use tokio_rustls::TlsAcceptor;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = std::env::args().collect();
    let default_key_path = String::from(".");
    let key_path = args.get(1).unwrap_or(&default_key_path);
    let default_trust_db_path = String::from("/home/registrar/Documents/nist-brski/packages/nist_registrar_server/testWithMudDb.sqlite");
    let trust_db_path = args.get(2).unwrap_or(&default_trust_db_path);
    let connected_idevids_default_log_path = String::from("/var/log/brski-registrar.log");
    let connected_idevids_log_path = args.get(3).unwrap_or(&connected_idevids_default_log_path);
    let tcpdump_default_log_path = String::from("/home/registrar/log.txt");
    let tcpdump_log_path = args.get(4).unwrap_or(&tcpdump_default_log_path);

    let mut root_store = RootCertStore::empty();
    root_store.add(CertificateDer::from(
        X509::from_pem(read(format!("{}/router.crt", key_path))?.as_slice())?.to_der()?
    ))?;

    let config = ServerConfig::builder()
        .with_client_cert_verifier(
            WebPkiClientVerifier::builder(root_store.into()).build()?
        )
        .with_single_cert(
            vec![CertificateDer::from(
                X509::from_pem(read(format!("{}/registrar.crt", key_path))?.as_slice())?.to_der()?
            )],
            PrivateKeyDer::from(PrivatePkcs8KeyDer::from(
                PKey::private_key_from_pem(read(format!("{}/registrar.key", key_path))?.as_slice())?.private_key_to_pkcs8()?
            ))
        )?;

    let acceptor = TlsAcceptor::from(Arc::new(config));
    let listener = TcpListener::bind("0.0.0.0:8000").await?;

    std::process::Command::new("avahi-publish")
        .args(["-s", "brski-registrar-CA-monitor", "_brski._tcp", "8000"]).stdout(Stdio::null()).spawn()?;

    let (stream, _peer_addr) = listener.accept().await?;
    let mut stream = acceptor.accept(stream).await?;

    let mut revoked: Vec<String> = Vec::new();
    loop {
        let logs = read_to_string(connected_idevids_log_path)?;
        let logs: Vec<&str> = logs.split('\n').collect();
        let mut revoke = Vec::new();
        for line in logs {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() > 4 && !revoked.contains(&parts[3].to_string()) {
                let idevid = nist_policy::generate_x509_certificate(parts[1], "manufacturer")?;
                if !nist_policy::check_device_trusted(&idevid, trust_db_path)? ||
                    !nist_policy::check_manufacturer_trusted(&idevid, trust_db_path)? ||
                    nist_policy::check_device_vulnerable(&idevid, trust_db_path)? ||
                    !nist_policy::demo_get_ips_to_kick(&idevid, trust_db_path, tcpdump_log_path, 5).is_empty() {
                        revoke.append(vec![parts[3], parts[4]].as_mut());
                        revoked.push(parts[3].to_string());
                }
            }
        }
        if !revoke.is_empty() {
            let message = [json!({"Revoke": revoke}).to_string().as_bytes(), [b'\0'].as_slice()].concat();
            stream.write_all(message.as_slice()).await?;
            let mut received = Vec::new();
            loop {
                let mut buf = [0u8; 64];
                let length = stream.read(&mut buf).await?;
                if buf[length-1] == 0u8 {
                    received.append(&mut buf[..length-1].to_vec());
                    break;
                } else {
                    received.append(&mut buf[..length].to_vec());
                }
            }
            let json = from_str::<Value>(String::from_utf8(received)?.as_str())?;
            println!("Stdout:\n{}", json["Stdout"].as_str().unwrap());
            println!("Stderr:\n{}", json["Stderr"].as_str().unwrap());
        }
        sleep(Duration::from_secs(1)).await;
    }
}