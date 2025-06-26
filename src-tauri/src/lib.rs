mod types;
mod auth;
mod video;
mod download;
mod storage;
mod ffmpeg;
mod export;

use auth::*;
use video::*;
use download::*;
use storage::*;
use ffmpeg::*;
use export::*;

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
            get_user_info,
            get_video_info,
            get_video_streams,
            download_video,
            test_stream_url,
            save_login_data,
            load_login_data,
            clear_login_data,
            merge_video_audio,
            convert_video_format,
            extract_audio,
            get_local_video_info,
            select_export_folder,
            export_file_to_folder,
            batch_export_files,
            open_folder,
            get_file_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 