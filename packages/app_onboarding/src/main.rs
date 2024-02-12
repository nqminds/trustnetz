use std::fs::OpenOptions;
use std::io::Write;
use warp::Filter;
use warp::hyper::body::Bytes;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let args = std::env::args().collect::<Vec<_>>();
    let path = String::from(".");
    let key_path = args.get(2).unwrap_or(&path);

    let route = warp::any()
        .and(warp::filters::body::bytes())
        .map(|body: Bytes| {
            let mut file = OpenOptions::new()
                .write(true)
                .append(true)
                .create(true)
                .open("log.txt")
                .unwrap();
            writeln!(file, "{}", std::str::from_utf8(body.as_ref()).unwrap()).unwrap();
            warp::http::StatusCode::OK
        });

    warp::serve(route)
        .tls()
        .cert_path(format!("{}/app.crt", key_path))
        .key_path(format!("{}/app.key", key_path))
        .client_auth_required_path(format!("{}/manufacturer.crt", key_path))
        .run(([127, 0, 0, 1], 6789)).await;
}

// curl --cert idevid.crt --key client.key --cacert ca.crt https://127.0.0.1:6789 -d <<< echo "$(date)"