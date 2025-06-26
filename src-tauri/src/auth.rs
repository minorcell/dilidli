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

// 获取用户信息
#[tauri::command]
pub async fn get_user_info(cookies: String) -> Result<UserProfile, String> {
    println!("获取用户信息，cookies长度: {}", cookies.len());
    
    let client = reqwest::Client::new();
    let url = "https://api.bilibili.com/x/web-interface/nav";
    
    let res = client.get(url)
        .header("User-Agent", USER_AGENT)
        .header("Cookie", cookies)
        .header("Referer", "https://www.bilibili.com/")
        .send()
        .await
        .map_err(|e| {
            println!("请求失败: {}", e);
            e.to_string()
        })?;

    println!("响应状态: {}", res.status());

    if res.status().is_success() {
        let body_text = res.text().await.map_err(|e| e.to_string())?;
        println!("API响应: {}", body_text);
        
        let body: UserInfoResponse = serde_json::from_str(&body_text)
            .map_err(|e| {
                println!("JSON解析失败: {}", e);
                e.to_string()
            })?;
        
        if body.code == 0 {
            // vip_status: 0=非大会员, 1=大会员
            let vip_status = body.data.vip_status;
            println!("VIP状态: vip_status={}, vip_type={}", vip_status, body.data.vip_type);
            
            let user_profile = UserProfile {
                name: body.data.uname,
                avatar: body.data.face,
                mid: body.data.mid,
                vip_type: vip_status, // 使用vip_status而不是vip.vip_type
            };
            println!("用户信息获取成功: {:?}", user_profile);
            Ok(user_profile)
        } else {
            println!("API返回错误: code={}, message={}", body.code, body.message);
            Err(format!("Failed to get user info: {}", body.message))
        }
    } else {
        println!("HTTP请求失败: {}", res.status());
        Err(format!("Failed to get user info: {}", res.status()))
    }
}