use std::io::{Read, Write};
use std::process::Stdio;
use warp::Filter;
use warp::hyper::body::Bytes;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let args: Vec<_> = std::env::args().collect();
    let default = String::from(".");
    let path = args.get(2).unwrap_or(&default);

    let route = warp::any()
        .and(warp::filters::body::bytes())
        .map(|csr: Bytes| {
            let command = std::process::Command::new("openssl")
                .args(["x509", "-req", "-CA", "mcr.crt", "-CAkey", "mcr.key", "-days", "365", "-sha256"])
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .spawn()
                .unwrap();
            command.stdin.unwrap().write(csr.as_ref()).unwrap();
            let mut output = String::new();
            command.stdout.unwrap().read_to_string(&mut output).unwrap();
            output
        });

    warp::serve(route)
        .tls()
        .cert_path(format!("{}/mcr.crt", path))
        .key_path(format!("{}/mcr.key", path))
        .run(([127, 0, 0, 1], 7000)).await;
}