use std::io::{Read, Write};
use std::process::Stdio;
use warp::Filter;
use warp::hyper::body::Bytes;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let args: Vec<_> = std::env::args().collect();
    let default = String::from(".");
    let path = args.get(1).unwrap_or(&default);

    let route = warp::any()
        .and(warp::filters::body::bytes())
        .map(|csr: Bytes| {
            std::fs::write("v3.ext", "basicConstraints=CA:FALSE").unwrap();
            let command = std::process::Command::new("openssl")
                .args(["x509", "-req", "-CA", "mcr.crt", "-CAkey", "mcr.key", "-days", "365", "-sha256", "-extfile", "v3.ext"])
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .spawn()
                .unwrap();
            command.stdin.unwrap().write(csr.as_ref()).unwrap();
            let mut output = String::new();
            command.stdout.unwrap().read_to_string(&mut output).unwrap();
            std::fs::remove_file("v3.ext").unwrap();
            output
        });

    warp::serve(route)
        .tls()
        .cert_path(format!("{}/mcr.crt", path))
        .key_path(format!("{}/mcr.key", path))
        .run(([192, 168, 1, 114], 7000)).await;
}
