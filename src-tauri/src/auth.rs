use crate::types::*;
use reqwest::cookie::{Jar, CookieStore};
use std::sync::Arc;
use url;

// 用户代理
const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

// 获取登录二维码
#[tauri::command]
pub async fn get_login_qr_code() -> Result<QrCodeData, String> {
    let client = reqwest::Client::new();
    let url = "https://passport.bilibili.com/x/passport-login/web/qrcode/generate";
    
    let res = client.get(url)
        .header("User-Agent", USER_AGENT)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let body = res.json::<QrCodeResponse>().await.map_err(|e| e.to_string())?;
        Ok(body.data)
    } else {
        Err(format!("Failed to get QR code: {}", res.status()))
    }
}

// 轮询登录状态
#[tauri::command]
pub async fn poll_login_status(qrcode_key: String) -> Result<LoginSuccessData, String> {
    let cookie_jar = Arc::new(Jar::default());
    let client = reqwest::Client::builder()
        .cookie_provider(cookie_jar.clone())
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key={}", qrcode_key);
    let request_url = url::Url::parse(&url).map_err(|e| e.to_string())?;

    let res = client.get(&url)
        .header("User-Agent", USER_AGENT)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let mut cookies_str = String::new();
        if let Some(cookie_header) = cookie_jar.cookies(&request_url) {
            cookies_str = cookie_header.to_str().unwrap_or("").to_string();
        }
        
        let poll_resp = res.json::<PollResponse>().await.map_err(|e| e.to_string())?;

        Ok(LoginSuccessData {
            poll_data: poll_resp.data,
            cookies: cookies_str,
        })
    } else {
        Err(format!("Polling failed: {}", res.status()))
    }
}