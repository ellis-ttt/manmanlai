use axum::{
	body::Bytes,
	extract::Query,
	http::{HeaderMap, Method, StatusCode},
	response::{IntoResponse, Response},
	routing::any,
	Router,
};
use tower_http::cors::{CorsLayer, Any as CorsAny};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
	let app = Router::new()
		.route("/", any(proxy))
		.layer(
			CorsLayer::new()
				.allow_origin(CorsAny)
				.allow_methods(CorsAny)
				.allow_headers(CorsAny)
		);

	let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
		.await
		.unwrap();

	println!("Proxy server running on http://127.0.0.1:8080");
	axum::serve(listener, app).await.unwrap();
}

async fn proxy(
	Query(params): Query<HashMap<String, String>>,
	method: Method,
	headers: HeaderMap,
	body: Bytes,
) -> Result<Response, StatusCode> {
	let Some(url) = params.get("url") else {
		return Err(StatusCode::BAD_REQUEST);
	};

	let client = reqwest::Client::builder()
		.danger_accept_invalid_certs(true)
		.timeout(std::time::Duration::from_secs(30))
		.build()
		.unwrap();

	let mut request = client.request(method, url);

	for (key, value) in headers.iter() {
		if key != "host" && key != "content-length" && key != "accept-encoding" {
			request = request.header(key, value);
		}
	}

	if !body.is_empty() {
		request = request.body(body.to_vec());
	}

	match request.send().await {
		Ok(response) => {
			let status = response.status();

			let text = response.text().await.map_err(|e| {
				eprintln!("Error reading response: {}", e);
				StatusCode::INTERNAL_SERVER_ERROR
			})?;

			let mut resp = (status, text).into_response();
			resp.headers_mut().insert(
				axum::http::header::CONTENT_TYPE,
				"application/json".parse().unwrap()
			);

			Ok(resp)
		}
		Err(e) => {
			eprintln!("Error making request: {}", e);
			Err(StatusCode::BAD_GATEWAY)
		}
	}
}