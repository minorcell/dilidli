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
  const [statusMessage, setStatusMessage] = useState('');
  const [pollInterval, setPollInterval] = useState<number | null>(null);
  
  const { setLoginStatus: setGlobalLoginStatus } = useAppStore();

  // 检查 Tauri 环境
  useEffect(() => {
    if (!isTauriAvailable()) {
      setLoginStatus('error');
      setStatusMessage('请在 Tauri 应用中使用登录功能');
    } else {
      // 自动获取二维码
      getQrCode();
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
      setStatusMessage('正在获取登录二维码...');
      
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
            setStatusMessage('等待扫码中...');
            break;
          case LoginStatus.SCANNED:
            setStatusMessage('扫码成功！请在手机上确认登录');
            break;
          case LoginStatus.SUCCESS:
            setStatusMessage('登录成功！正在跳转...');
            setLoginStatus('success');
            clearInterval(interval);
            
            // 设置全局登录状态
            try {
              setGlobalLoginStatus(true, { name: '用户', avatar: '', mid: 0, vip_type: 0 }, result.cookies);
            } catch (error) {
              console.error('设置登录状态失败:', error);
            }
            
            setTimeout(() => {
              onClose?.();
            }, 1500);
            break;
          case LoginStatus.EXPIRED:
            setStatusMessage('二维码已过期');
            setLoginStatus('error');
            clearInterval(interval);
            break;
          default:
            setStatusMessage(`状态: ${result.poll_data.message}`);
            break;
        }
      } catch (error) {
        setStatusMessage('网络连接错误，请检查网络');
        setLoginStatus('error');
        clearInterval(interval);
      }
    }, 2000);

    setPollInterval(interval);
  };

  // 重新获取二维码
  const refreshQrCode = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setQrData(null);
    setLoginStatus('idle');
    setStatusMessage('');
    getQrCode();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 左侧装饰区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 relative overflow-hidden">
        {/* 装饰性几何图形 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-white/15 rounded-2xl rotate-45 blur-lg"></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-1/4 w-20 h-20 bg-white/20 rounded-xl rotate-12 blur-md"></div>
        </div>
        
        {/* 主要内容 */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <span className="text-5xl">🎬</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">CiliCili</h1>
            <p className="text-xl text-white/90 mb-8">哔哩哔哩桌面下载器</p>
          </div>
          
          {/* 特性介绍 */}
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span>🎯</span>
              </div>
              <span>高质量视频下载</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span>⚡</span>
              </div>
              <span>极速下载体验</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span>🛡️</span>
              </div>
              <span>安全隐私保护</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录区域 */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl flex items-center justify-center lg:hidden">
              <span className="text-white text-xl">🎬</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">登录账户</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">使用哔哩哔哩账号登录</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="text-gray-500 dark:text-gray-400 text-lg">✕</span>
          </button>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-12">
          
          {/* Tauri 环境检查 */}
          {!isTauriAvailable() && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">!</span>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    开发环境提示
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    当前在浏览器环境中运行，登录功能需要桌面应用支持。
                    <br />
                    请运行 <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-mono">pnpm tauri dev</code> 启动桌面应用。
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-sm mx-auto w-full space-y-8">
            
            {/* 二维码区域 */}
            <div className="text-center">
              <div className="relative inline-block p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-inner">
                {qrData ? (
                  <div className="relative">
                    <QRCodeSVG
                      value={qrData.url}
                      size={200}
                      level="M"
                      includeMargin={true}
                      className="rounded-2xl shadow-sm"
                    />
                    {/* 状态指示器 */}
                    <div className="absolute -bottom-2 -right-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
                        loginStatus === 'polling' && "bg-blue-500 animate-pulse",
                        loginStatus === 'success' && "bg-green-500",
                        loginStatus === 'error' && "bg-red-500"
                      )}>
                        <span className="text-white text-sm">
                          {loginStatus === 'polling' && '📱'}
                          {loginStatus === 'success' && '✅'}
                          {loginStatus === 'error' && '❌'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center">
                    {loginStatus === 'loading' ? (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">正在生成二维码...</p>
                      </div>
                    ) : loginStatus === 'error' ? (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-2xl">❌</span>
                        </div>
                        <p className="text-red-600 dark:text-red-400 text-sm">二维码获取失败</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-2xl">📱</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">准备获取二维码</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 状态信息 */}
            <div className="text-center space-y-4">
              <div className={cn(
                "inline-flex items-center space-x-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                loginStatus === 'success' && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                loginStatus === 'error' && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                loginStatus === 'polling' && "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                loginStatus === 'loading' && "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                loginStatus === 'idle' && "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              )}>
                <span>
                  {loginStatus === 'success' && '🎉'}
                  {loginStatus === 'error' && '⚠️'}
                  {loginStatus === 'polling' && '📱'}
                  {loginStatus === 'loading' && '⏳'}
                  {loginStatus === 'idle' && '🔄'}
                </span>
                <span>
                  {statusMessage || 
                    (loginStatus === 'idle' ? '准备获取登录二维码' : 
                     loginStatus === 'loading' ? '正在生成二维码...' : 
                     statusMessage)}
                </span>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                {loginStatus === 'error' && (
                  <button
                    onClick={refreshQrCode}
                    disabled={!isTauriAvailable()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-xl hover:from-pink-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>重新获取二维码</span>
                  </button>
                )}
                
                {loginStatus === 'polling' && (
                  <button
                    onClick={refreshQrCode}
                    className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>刷新二维码</span>
                  </button>
                )}
                
                {loginStatus === 'success' && (
                  <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                    <div className="animate-bounce">🎉</div>
                    <span className="font-semibold">登录成功！正在初始化...</span>
                  </div>
                )}
              </div>
            </div>

            {/* 底部说明 */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>💡</span>
                <span>使用哔哩哔哩手机App扫描上方二维码</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>🔒</span>
                <span>登录信息将安全存储在本地</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 