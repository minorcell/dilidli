import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '../store/appStore';
import { QrCodeData, LoginSuccessData, LoginStatus } from '../types/bilibili';
import { cn } from '../lib/utils';

interface LoginProps {
  onClose?: () => void;
}

// 检查是否在 Tauri 环境中
const isTauriAvailable = () => {
  return typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
};

export default function Login({ onClose }: LoginProps) {
  const [qrData, setQrData] = useState<QrCodeData | null>(null);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'polling' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('点击获取登录二维码');
  const [pollInterval, setPollInterval] = useState<number | null>(null);
  
  const { setLoginStatus: setGlobalLoginStatus } = useAppStore();

  // 检查 Tauri 环境
  useEffect(() => {
    if (!isTauriAvailable()) {
      setLoginStatus('error');
      setStatusMessage('请在 Tauri 应用中使用登录功能（运行 pnpm tauri dev）');
    }
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // 获取二维码
  const getQrCode = async () => {
    if (!isTauriAvailable()) {
      setLoginStatus('error');
      setStatusMessage('Tauri 环境不可用，请运行 pnpm tauri dev');
      return;
    }

    try {
      setLoginStatus('loading');
      setStatusMessage('获取二维码中...');
      
      const qrCodeData: QrCodeData = await invoke('get_login_qr_code');
      
      setQrData(qrCodeData);
      setLoginStatus('polling');
      setStatusMessage('请使用哔哩哔哩App扫码登录');
      
      // 开始轮询登录状态
      startPolling(qrCodeData.qrcode_key);
    } catch (error) {
      setLoginStatus('error');
      setStatusMessage(`获取二维码失败：${error}`);
    }
  };

  // 开始轮询登录状态
  const startPolling = (qrcodeKey: string) => {
    const interval = window.setInterval(async () => {
      try {
        const result: LoginSuccessData = await invoke('poll_login_status', { qrcodeKey });
        const code = result.poll_data.code;
        
        switch (code) {
          case LoginStatus.PENDING:
            setStatusMessage('等待扫码...');
            break;
          case LoginStatus.SCANNED:
            setStatusMessage('已扫码，请在手机上确认登录');
            break;
          case LoginStatus.SUCCESS:
            setStatusMessage('登录成功！');
            setLoginStatus('success');
            clearInterval(interval);
            
            // 设置全局登录状态，但不立即保存
            try {
              setGlobalLoginStatus(true, { name: '用户', avatar: '', mid: 0, vip_type: 0 }, result.cookies);
            } catch (error) {
            }
            
            setTimeout(() => {
              onClose?.();
            }, 1000);
            break;
          case LoginStatus.EXPIRED:
            setStatusMessage('二维码已过期，请重新获取');
            setLoginStatus('error');
            clearInterval(interval);
            break;
          default:
            setStatusMessage(`未知状态: ${result.poll_data.message}`);
            break;
        }
      } catch (error) {
        setStatusMessage('网络错误，请重试');
        setLoginStatus('error');
        clearInterval(interval);
      }
    }, 2000); // 每2秒轮询一次

    setPollInterval(interval);
  };

  // 重置状态
  const resetState = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setQrData(null);
    setLoginStatus('idle');
    setStatusMessage('点击获取登录二维码');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">登录哔哩哔哩</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="text-center space-y-4">
          {/* Tauri 环境检查提示 */}
          {!isTauriAvailable() && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">开发环境提示</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                当前在浏览器环境中，登录功能需要在 Tauri 应用中使用。<br/>
                请运行 <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">pnpm tauri dev</code> 启动完整应用。
              </p>
            </div>
          )}

          {/* 二维码区域 */}
          <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {qrData ? (
              <QRCodeSVG
                value={qrData.url}
                size={200}
                level="M"
                includeMargin={true}
              />
            ) : (
              <div className="text-gray-500 dark:text-gray-400">
                {loginStatus === 'loading' ? '获取中...' : '暂无二维码'}
              </div>
            )}
          </div>

          {/* 状态信息 */}
          <p className={cn(
            "text-sm",
            loginStatus === 'success' && "text-green-600",
            loginStatus === 'error' && "text-red-600",
            loginStatus === 'polling' && "text-blue-600"
          )}>
            {statusMessage}
          </p>

          {/* 操作按钮 */}
          <div className="space-y-2">
            {(loginStatus === 'idle' || loginStatus === 'error') && (
              <button
                onClick={getQrCode}
                disabled={!isTauriAvailable()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                获取登录二维码
              </button>
            )}
            {loginStatus === 'loading' && (
              <button
                disabled
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg opacity-50 cursor-not-allowed"
              >
                获取中...
              </button>
            )}
            {loginStatus === 'polling' && (
              <button
                onClick={resetState}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                重新获取二维码
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 