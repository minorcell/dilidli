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

// B站实际返回的DASH格式数据结构
#[derive(Debug, Serialize, Deserialize)]
pub struct DashVideo {
    pub id: u32,
    #[serde(rename = "baseUrl")]
    pub base_url: String,
    pub backup_url: Option<Vec<String>>,
    pub bandwidth: Option<u32>,
    pub mime_type: Option<String>,
    pub codecs: Option<String>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub frame_rate: Option<String>,
    pub sar: Option<String>,
    pub start_with_sap: Option<u32>,
    pub segment_base: Option<serde_json::Value>,
    pub codecid: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DashAudio {
    pub id: u32,
    #[serde(rename = "baseUrl")]
    pub base_url: String,
    pub backup_url: Option<Vec<String>>,
    pub bandwidth: Option<u32>,
    pub mime_type: Option<String>,
    pub codecs: Option<String>,
    pub segment_base: Option<serde_json::Value>,
    pub codecid: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DashData {
    pub duration: u32,
    #[serde(rename = "minBufferTime")]
    pub min_buffer_time: f32,
    pub video: Vec<DashVideo>,
    pub audio: Vec<DashAudio>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlayUrlData {
    pub from: String,
    pub result: String,
    pub message: String,
    pub quality: u32,
    pub format: String,
    pub timelength: u64,
    pub accept_format: String,
    pub accept_description: Vec<String>,
    pub accept_quality: Vec<u32>,
    pub video_codecid: u32,
    pub seek_param: String,
    pub seek_type: String,
    pub dash: DashData,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlayUrlResponse {
    pub code: i32,
    pub message: String,
    pub data: Option<PlayUrlData>,
}

// 为了保持前端兼容性，创建转换结构
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

// 用于前端的简化结构
#[derive(Debug, Serialize, Deserialize)]
pub struct SimplifiedPlayUrlData {
    pub video_streams: Vec<VideoStream>,
    pub audio_streams: Vec<AudioStream>,
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