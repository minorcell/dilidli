use serde::{Deserialize, Serialize};
use std::sync::Arc;
use reqwest::cookie::{Jar, CookieStore};
use url;

const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

// API 返回的二维码数据结构
#[derive(Debug, Serialize, Deserialize)]
struct QrCodeData {
    url: String,
    qrcode_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct QrCodeResponse {
    data: QrCodeData,
}

// API 返回的轮询数据结构
#[derive(Debug, Serialize, Deserialize)]
pub struct PollData {
    code: i32,
    message: String,
    url: Option<String>,
    refresh_token: Option<String>,
    timestamp: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
struct PollResponse {
    data: PollData,
}

// 登录成功后返回给前端的结构
#[derive(Debug, Serialize, Deserialize)]
pub struct LoginSuccessData {
    poll_data: PollData,
    cookies: String,
}

// 视频信息相关结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct VideoPage {
    cid: u64,
    page: u32,
    part: String,
    duration: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoData {
    bvid: String,
    aid: u64,
    title: String,
    desc: String,
    pic: String,
    #[serde(rename = "owner")]
    owner_info: VideoOwner,
    duration: u32,
    pages: Vec<VideoPage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoOwner {
    name: String,
    face: Option<String>,
    mid: u64,
}

impl VideoData {
    pub fn author(&self) -> String {
        self.owner_info.name.clone()
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct VideoInfoResponse {
    code: i32,
    message: String,
    data: Option<VideoData>,
}

// 视频流信息
#[derive(Debug, Serialize, Deserialize)]
pub struct VideoStream {
    quality: u32,
    format: String,
    description: String,
    url: Option<String>,
    filesize: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AudioStream {
    quality: u32,
    format: String,
    url: Option<String>,
    filesize: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlayUrlData {
    video_streams: Vec<VideoStream>,
    audio_streams: Vec<AudioStream>,
}

#[derive(Debug, Serialize, Deserialize)]
struct PlayUrlResponse {
    code: i32,
    message: String,
    data: Option<PlayUrlData>,
}

// 存储的登录信息
#[derive(Debug, Serialize, Deserialize)]
pub struct StoredLoginData {
    cookies: String,
    user_profile: Option<UserProfile>,
    login_time: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserProfile {
    name: String,
    avatar: String,
    mid: u64,
    vip_type: u32,
}

#[tauri::command]
async fn get_login_qr_code() -> Result<QrCodeData, String> {
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

#[tauri::command]
async fn poll_login_status(qrcode_key: String) -> Result<LoginSuccessData, String> {
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

#[tauri::command]
async fn get_video_info(video_id: String) -> Result<VideoData, String> {
    let client = reqwest::Client::new();
    let url = if video_id.starts_with("BV") {
        format!("https://api.bilibili.com/x/web-interface/view?bvid={}", video_id)
    } else if video_id.starts_with("av") {
        let aid = video_id[2..].parse::<u64>().map_err(|_| "Invalid AV number".to_string())?;
        format!("https://api.bilibili.com/x/web-interface/view?aid={}", aid)
    } else {
        return Err("Invalid video ID format".to_string());
    };

    let res = client.get(&url)
        .header("User-Agent", USER_AGENT)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        // 先获取原始文本看看格式
        let text = res.text().await.map_err(|e| e.to_string())?;
        
        // 安全地截取前500个字符（不是字节）
        let preview = if text.chars().count() > 500 {
            text.chars().take(500).collect::<String>() + "..."
        } else {
            text.clone()
        };
        println!("API 原始响应: {}", preview);
        
        // 尝试解析 JSON
        let response: VideoInfoResponse = serde_json::from_str(&text)
            .map_err(|e| format!("JSON 解析错误: {}", e))?;
        
        if response.code == 0 {
            response.data.ok_or_else(|| "No video data".to_string())
        } else {
            Err(format!("API Error: {} - {}", response.code, response.message))
        }
    } else {
        Err(format!("HTTP Error: {}", res.status()))
    }
}

#[tauri::command]
async fn get_video_streams(video_id: String, cid: u64, cookies: String) -> Result<PlayUrlData, String> {
    let client = reqwest::Client::new();
    
    // B站视频流接口
    let url = format!(
        "https://api.bilibili.com/x/player/playurl?bvid={}&cid={}&qn=127&fourk=1&fnval=4048",
        video_id, cid
    );

    let res = client.get(&url)
        .header("User-Agent", USER_AGENT)
        .header("Cookie", cookies)
        .header("Referer", "https://www.bilibili.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let response: PlayUrlResponse = res.json().await.map_err(|e| e.to_string())?;
        
        if response.code == 0 {
            response.data.ok_or_else(|| "No stream data".to_string())
        } else {
            Err(format!("API Error: {} - {}", response.code, response.message))
        }
    } else {
        Err(format!("HTTP Error: {}", res.status()))
    }
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn save_login_data(app_handle: tauri::AppHandle, login_data: StoredLoginData) -> Result<(), String> {
    use tauri_plugin_store::StoreExt;
    
    let store = app_handle.store("login.json").map_err(|e| e.to_string())?;
    store.set("login_data", serde_json::to_value(&login_data).map_err(|e| e.to_string())?);
    store.save().map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn load_login_data(app_handle: tauri::AppHandle) -> Result<Option<StoredLoginData>, String> {
    use tauri_plugin_store::StoreExt;
    
    let store = app_handle.store("login.json").map_err(|e| e.to_string())?;
    
    if let Some(value) = store.get("login_data") {
        let login_data: StoredLoginData = serde_json::from_value(value.clone()).map_err(|e| e.to_string())?;
        Ok(Some(login_data))
    } else {
        Ok(None)
    }
}

#[tauri::command]
async fn clear_login_data(app_handle: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_store::StoreExt;
    
    let store = app_handle.store("login.json").map_err(|e| e.to_string())?;
    store.delete("login_data");
    store.save().map_err(|e| e.to_string())?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_login_qr_code,
            poll_login_status,
            get_video_info,
            get_video_streams,
            save_login_data,
            load_login_data,
            clear_login_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
