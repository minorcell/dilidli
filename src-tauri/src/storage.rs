use crate::types::*;

// 保存登录数据
#[tauri::command]
pub async fn save_login_data(app_handle: tauri::AppHandle, login_data: StoredLoginData) -> Result<(), String> {
    use tauri_plugin_store::StoreExt;
    
    let store = app_handle.store("login.json").map_err(|e| e.to_string())?;
    store.set("login_data", serde_json::to_value(&login_data).map_err(|e| e.to_string())?);
    store.save().map_err(|e| e.to_string())?;
    
    Ok(())
}

// 加载登录数据
#[tauri::command]
pub async fn load_login_data(app_handle: tauri::AppHandle) -> Result<Option<StoredLoginData>, String> {
    use tauri_plugin_store::StoreExt;
    
    let store = app_handle.store("login.json").map_err(|e| e.to_string())?;
    
    if let Some(value) = store.get("login_data") {
        let login_data: StoredLoginData = serde_json::from_value(value.clone()).map_err(|e| e.to_string())?;
        Ok(Some(login_data))
    } else {
        Ok(None)
    }
}

// 清除登录数据
#[tauri::command]
pub async fn clear_login_data(app_handle: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_store::StoreExt;
    
    let store = app_handle.store("login.json").map_err(|e| e.to_string())?;
    store.delete("login_data");
    store.save().map_err(|e| e.to_string())?;
    
    Ok(())
} 