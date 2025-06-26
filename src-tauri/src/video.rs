use crate::types::*;

// 用户代理
const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

// 获取视频信息
#[tauri::command]
pub async fn get_video_info(video_id: String) -> Result<VideoData, String> {
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

// 获取视频流
#[tauri::command]
pub async fn get_video_streams(video_id: String, cid: u64, cookies: String) -> Result<PlayUrlData, String> {
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

// 测试流URL可访问性
#[tauri::command]
pub async fn test_stream_url(url: String, cookies: String) -> Result<String, String> {
    println!("=== 测试流URL可访问性 ===");
    println!("URL: {}", url);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .user_agent(USER_AGENT)
        .build()
        .map_err(|e| e.to_string())?;

    let response = client.head(&url)
        .header("Cookie", &cookies)
        .header("Referer", "https://www.bilibili.com/")
        .header("Origin", "https://www.bilibili.com")
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    let status = response.status();
    let content_length = response.headers().get("content-length").cloned();
    let content_type = response.headers().get("content-type").cloned();

    println!("响应状态: {}", status);
    println!("Content-Length: {:?}", content_length);
    println!("Content-Type: {:?}", content_type);

    if status.is_success() {
        Ok(format!("URL可访问，状态: {}", status))
    } else {
        Err(format!("URL不可访问，状态: {}", status))
    }
} 