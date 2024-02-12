use std::fs::OpenOptions;
use std::io::Write;
use warp::Filter;
use warp::hyper::body::Bytes;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let args: Vec<_> = std::env::args().collect();
    let default = String::from(".");
    let path = args.get(2).unwrap_or(&default);

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
        .cert_path(format!("{}/app.crt", path))
        .key_path(format!("{}/app.key", path))
        .client_auth_required_path(format!("{}/manufacturer.crt", path))
        .run(([127, 0, 0, 1], 6789)).await;
}