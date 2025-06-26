mod types;
mod auth;
mod video;
mod download;
mod storage;

use auth::*;
use video::*;
use download::*;
use storage::*;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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
            download_video,
            test_stream_url,
            save_login_data,
            load_login_data,
            clear_login_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 