use std::error::Error;
use std::fs::{read, read_to_string};
use std::process::Stdio;
use std::sync::Arc;
use std::time::Duration;
use openssl::pkey::PKey;
use openssl::x509::X509;
use serde_json::json;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::time::sleep;
use tokio_rustls::rustls::pki_types::{CertificateDer, PrivateKeyDer, PrivatePkcs8KeyDer};
use tokio_rustls::rustls::{RootCertStore, ServerConfig};
use tokio_rustls::rustls::server::WebPkiClientVerifier;
use tokio_rustls::TlsAcceptor;

const TRUST_DB_PATH: &str = "/home/registrar/Documents/nist-brski/packages/nist_registrar_server/MyLocalDatabase.sqlite";
const KEY_PATH: &str = "/etc/brski/continuous_assurance/";

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn Error>> {
    let mut root_store = RootCertStore::empty();
    root_store.add(CertificateDer::from(
        X509::from_pem(read(format!("{}/ca.crt", KEY_PATH))?.as_slice())?.to_der()?
    ))?;

    let config = ServerConfig::builder()
        .with_client_cert_verifier(
            WebPkiClientVerifier::builder(root_store.into()).build()?
        )
        .with_single_cert(
            vec![CertificateDer::from(
                X509::from_pem(read(format!("{}/registrar.crt", KEY_PATH))?.as_slice())?.to_der()?
            )],
            PrivateKeyDer::from(PrivatePkcs8KeyDer::from(
                PKey::private_key_from_pem(read(format!("{}/registrar.key", KEY_PATH))?.as_slice())?.private_key_to_pkcs8()?
            ))
        )?;

    let acceptor = TlsAcceptor::from(Arc::new(config));
    let listener = TcpListener::bind("0.0.0.0:3030").await?;

    std::process::Command::new("avahi-publish")
        .args(["-s", "brski-registrar-CA-monitor", "_brski._tcp", "3030"]).stdout(Stdio::null()).spawn()?;

    let (stream, _peer_addr) = listener.accept().await?;
    let mut stream = acceptor.accept(stream).await?;

    let mut buf = [0u8; 2048];
    loop {
        let logs = read_to_string("/var/log/brski-registrar.log").expect("Cannot read brski-registrar.log");
        let mut lines: Vec<&str> = logs.split("\n").collect();
        if !lines.is_empty() && lines.last().unwrap().is_empty() {
            lines.pop();
        }
        let mut revoke = Vec::new();
        for line in lines {
            let parts: Vec<&str> = line.split(" ").collect();
            let idevid = nist_policy::generate_x509_certificate(parts[1], "manufacturer")
                .expect("Error generating certificate from serial number");
            if !nist_policy::check_device_trusted(&idevid, TRUST_DB_PATH).expect("Error checking device trust") ||
                !nist_policy::check_manufacturer_trusted(&idevid, TRUST_DB_PATH).expect("Error checking manufacturer trust") ||
                nist_policy::check_device_vulnerable(&idevid, TRUST_DB_PATH).expect("Error checking device vulnerability") {
                revoke.push(parts[3]);
                revoke.push(parts[4]);
            }
        }
        if !revoke.is_empty() {
            stream.write_all(json!({"Revoke": revoke}).to_string().as_bytes()).await.expect("Error sending message to router");
            let length = stream.read(&mut buf).await.expect("Error receiving message from router");
            println!("{}", std::str::from_utf8(&buf[..length]).expect("Unexpected character"));
        }
        sleep(Duration::from_secs(30)).await;
    }
}