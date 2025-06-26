use serde::{Deserialize, Serialize};

// API 返回的二维码数据结构
#[derive(Debug, Serialize, Deserialize)]
pub struct QrCodeData {
    pub url: String,
    pub qrcode_key: String,
}

// API 返回的二维码数据结构
#[derive(Debug, Serialize, Deserialize)]
pub struct QrCodeResponse {
    pub data: QrCodeData,
}

// API 返回的轮询数据结构
#[derive(Debug, Serialize, Deserialize)]
pub struct PollData {
    pub code: i32,
    pub message: String,
    pub url: Option<String>,
    pub refresh_token: Option<String>,
    pub timestamp: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PollResponse {
    pub data: PollData,
}

// 登录成功后返回给前端的结构
#[derive(Debug, Serialize, Deserialize)]
pub struct LoginSuccessData {
    pub poll_data: PollData,
    pub cookies: String,
}

// 视频信息相关结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct VideoPage {
    pub cid: u64,
    pub page: u32,
    pub part: String,
    pub duration: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoData {
    pub bvid: String,
    pub aid: u64,
    pub title: String,
    pub desc: String,
    pub pic: String,
    #[serde(rename = "owner")]
    pub owner_info: VideoOwner,
    pub duration: u32,
    pub pages: Vec<VideoPage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoOwner {
    pub name: String,
    pub face: Option<String>,
    pub mid: u64,
}

impl VideoData {
    pub fn author(&self) -> String {
        self.owner_info.name.clone()
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoInfoResponse {
    pub code: i32,
    pub message: String,
    pub data: Option<VideoData>,
}

// 视频流信息
#[derive(Debug, Serialize, Deserialize)]
pub struct VideoStream {
    pub quality: u32,
    pub format: String,
    pub description: String,
    pub url: Option<String>,
    pub filesize: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AudioStream {
    pub quality: u32,
    pub format: String,
    pub url: Option<String>,
    pub filesize: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlayUrlData {
    pub video_streams: Vec<VideoStream>,
    pub audio_streams: Vec<AudioStream>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlayUrlResponse {
    pub code: i32,
    pub message: String,
    pub data: Option<PlayUrlData>,
}

// 存储的登录信息
#[derive(Debug, Serialize, Deserialize)]
pub struct StoredLoginData {
    pub cookies: String,
    pub user_profile: Option<UserProfile>,
    pub login_time: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserProfile {
    pub name: String,
    pub avatar: String,
    pub mid: u64,
    pub vip_type: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub progress: f64,
    pub message: String,
} 