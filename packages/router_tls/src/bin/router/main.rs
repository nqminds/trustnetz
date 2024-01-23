use std::error::Error;
use std::fs::read;
use std::io::ErrorKind;
use std::sync::Arc;
use openssl::pkey::PKey;
use openssl::x509::X509;
use serde_json::{from_str, json, Value};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio_rustls::rustls::pki_types::{CertificateDer, DnsName, PrivateKeyDer, PrivatePkcs8KeyDer, ServerName};
use tokio_rustls::rustls::{ClientConfig, RootCertStore};
use tokio_rustls::TlsConnector;

const KEY_PATH: &str = "/etc/brski/continuous_assurance/";

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn Error>> {
    let mut root_store = RootCertStore::empty();
    root_store.add(CertificateDer::from(
        X509::from_pem(read(format!("{}/ca.crt", KEY_PATH))?.as_slice())?.to_der()?
    ))?;

    let config = ClientConfig::builder()
        .with_root_certificates(root_store)
        .with_client_auth_cert(
            vec![CertificateDer::from(
                X509::from_pem(read(format!("{}/router.crt", KEY_PATH))?.as_slice())?.to_der()?
            )],
            PrivateKeyDer::from(PrivatePkcs8KeyDer::from(
                PKey::private_key_from_pem(read(format!("{}/router.key", KEY_PATH))?.as_slice())?.private_key_to_pkcs8()?
            ))
        )?;

    let output = std::process::Command::new("avahi-browse").args(["-r", "_brski._tcp", "-t", "-p"]).output().unwrap();
    let output = String::from_utf8(output.stdout).unwrap();

    let mut address = "";
    let mut port = "";
    for line in output.split("\n") {
        let service: Vec<&str> = line.split(";").collect();
        if service[0] == "=" && service[2] == "IPv4" && service[3] == "brski-registrar-CA-monitor" {
            address = service[7];
            port = service[8];
            break
        }
    }
    if address == "" || port == "" {
        return Err(Box::new(std::io::Error::new(ErrorKind::NotFound, "Service not found")) as Box<dyn Error>);
    }

    let server_name = ServerName::DnsName(DnsName::try_from("registrar")?);
    let connector = TlsConnector::from(Arc::new(config.clone()));
    let stream = TcpStream::connect(format!("{}:{}", address, port)).await?;
    let mut stream = connector.connect(server_name, stream).await?;

    loop {
        let mut buf = [0u8; 2048];
        let length = stream.read(&mut buf).await.expect("Error receiving message from registrar");
        let message = from_str::<Value>(std::str::from_utf8(&buf[..length])
            .expect("Unexpected error parsing iDevID"))
            .expect("Unexpected error parsing json");

        stream.write_all(json!({"iDevID": message["Revoke"].as_str().expect("Unexpected error parsing iDevID")}).to_string().as_bytes()).await.unwrap(); // TODO temp

        // // TODO get lDevID & call local revoke script
        // let output = std::process::Command::new("LocalRevoke")
        //     .args([message["Revoke"].as_str().expect("Unexpected error parsing lDevID")])
        //     .output().expect("Unexpected error calling LocalRevoke");
        // stream.write_all(json!({
        //     "Stdout": String::from_utf8(output.stdout).expect("Error parsing local revoke output"),
        //     "Stderr": String::from_utf8(output.stderr).expect("Error parsing local revoke output")
        // }).to_string().as_bytes()).await.expect("Error sending message to registrar");
    }
}