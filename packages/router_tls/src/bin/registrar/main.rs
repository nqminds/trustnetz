use std::error::Error;
use std::fs::read;
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
        .args(["-s", "brski-registrar-CA-monitor", "_brski._tcp", "3030"]).stdout(Stdio::null()).spawn().unwrap();

    let (stream, _peer_addr) = listener.accept().await?;
    let mut stream = acceptor.accept(stream).await?;

    loop {
        let idevid_bytes = read("/etc/brski/idevid.crt").expect("Cannot read iDevID.crt"); // TODO read iDevID from database
        let idevid_obj = X509::from_pem(idevid_bytes.as_slice()).expect("Error parsing iDevID");

        if !nist_policy::check_device_trusted(&idevid_obj, TRUST_DB_PATH).expect("Error checking device trust") ||
            !nist_policy::check_manufacturer_trusted(&idevid_obj, TRUST_DB_PATH).expect("Error checking manufacturer trust") ||
            nist_policy::check_device_vulnerable(&idevid_obj, TRUST_DB_PATH).expect("Error checking device vulnerability") {

            stream.write_all(json!({"Revoke": String::from_utf8(idevid_bytes) // TODO should be lDevID
                .expect("Error parsing iDevID")}).to_string().as_bytes()).await
                .expect("Error sending message to router");

            let mut buf = [0u8; 2048];
            let length = stream.read(&mut buf).await.expect("Error receiving message from router");
            println!("{}", std::str::from_utf8(&buf[..length]).expect("Unexpected character"));
        }
        sleep(Duration::from_secs(5)).await;
    }
}