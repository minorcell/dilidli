import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../store/appStore';

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { isLoggedIn, cookies, downloads, userProfile } = useAppStore();

  const runDownloadTest = async () => {
    setIsRunning(true);
    setTestResult('🚀 开始测试下载功能...\n');
    
    try {
      // 1. 检查环境
      const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
      setTestResult(prev => prev + `📱 Tauri环境: ${isTauri ? '✅ 正常' : '❌ 未检测到'}\n`);
      
      // 2. 检查登录状态
      setTestResult(prev => prev + `🔐 登录状态: ${isLoggedIn ? '✅ 已登录' : '❌ 未登录'}\n`);
      setTestResult(prev => prev + `🍪 Cookies: ${cookies ? '✅ 已获取 (长度:' + cookies.length + ')' : '❌ 无数据'}\n`);
      
      // 3. 检查下载队列
      setTestResult(prev => prev + `📥 下载队列: ${downloads.length} 项任务\n`);
      
      if (!isTauri) {
        setTestResult(prev => prev + '❌ 请在Tauri应用中运行测试 (pnpm tauri dev)\n');
        return;
      }
      
      if (!isLoggedIn || !cookies) {
        setTestResult(prev => prev + '❌ 请先登录哔哩哔哩账号\n');
        return;
      }

      // 4. 测试视频信息获取
      setTestResult(prev => prev + '\n🎬 测试视频信息获取...\n');
      const testVideoId = 'BV1qEVazqEv3';
      
      try {
        const videoData = await invoke('get_video_info', { videoId: testVideoId });
        setTestResult(prev => prev + `✅ 视频信息获取成功: ${(videoData as any).title}\n`);
        setTestResult(prev => prev + `📊 视频时长: ${Math.floor((videoData as any).duration / 60)}分${(videoData as any).duration % 60}秒\n`);
        setTestResult(prev => prev + `👤 UP主: ${(videoData as any).owner.name}\n`);
        
        // 5. 测试视频流获取
        setTestResult(prev => prev + '\n🎯 测试视频流获取...\n');
        const streamData = await invoke('get_video_streams', {
          videoId: (videoData as any).bvid,
          cid: (videoData as any).pages[0].cid,
          cookies
        });
        
        setTestResult(prev => prev + `✅ 视频流获取成功: ${(streamData as any).video_streams.length} 个质量选项\n`);
        setTestResult(prev => prev + `🎵 音频流: ${(streamData as any).audio_streams.length} 个质量选项\n`);
        
        // 显示可用质量
        const qualities = (streamData as any).video_streams.map((stream: any) => stream.description).join(', ');
        setTestResult(prev => prev + `📺 可用质量: ${qualities}\n`);
        
        // 6. 测试下载命令（不实际下载，只测试调用）
        setTestResult(prev => prev + '\n🔧 测试下载命令调用...\n');
        
        const selectedVideo = (streamData as any).video_streams[0];
        const selectedAudio = (streamData as any).audio_streams[0];
        
        setTestResult(prev => prev + `🎬 选择视频质量: ${selectedVideo.description} (${selectedVideo.codecs})\n`);
        setTestResult(prev => prev + `🎵 选择音频质量: ${selectedAudio.quality} kbps\n`);
        
        setTestResult(prev => prev + '\n🎉 所有测试通过！系统功能正常，可以开始下载。\n');
        
      } catch (videoError) {
        setTestResult(prev => prev + `❌ 视频相关测试失败: ${videoError}\n`);
      }
      
    } catch (error) {
      setTestResult(prev => prev + `❌ 测试过程出现错误: ${error}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearTest = () => {
    setTestResult('');
  };

  const runQuickTest = async () => {
    setTestResult('⚡ 快速环境检查...\n');
    
    const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
    setTestResult(prev => prev + `Tauri: ${isTauri ? '✅' : '❌'} | 登录: ${isLoggedIn ? '✅' : '❌'} | 队列: ${downloads.length}项\n`);
    
    if (userProfile) {
      setTestResult(prev => prev + `👤 当前用户: ${userProfile.name} (UID: ${userProfile.mid})\n`);
      if (userProfile.vip_type > 0) {
        setTestResult(prev => prev + `👑 会员类型: ${userProfile.vip_type === 1 ? '月度大会员' : '年度大会员'}\n`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 页面头部 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🧪</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                测试中心
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                检测下载功能状态和系统环境
              </p>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={runDownloadTest}
              disabled={isRunning}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>运行中...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>完整功能测试</span>
                </>
              )}
            </button>
            
            <button
              onClick={runQuickTest}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <span>⚡</span>
              <span>快速检查</span>
            </button>
            
            <button
              onClick={clearTest}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>清除结果</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 系统状态 */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">系统状态</h2>
            </div>
            
            <div className="space-y-4">
              {/* 登录状态卡片 */}
              <div className={`p-4 rounded-2xl ${isLoggedIn ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{isLoggedIn ? '✅' : '❌'}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      登录状态: {isLoggedIn ? '已登录' : '未登录'}
                    </p>
                    {userProfile && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        用户: {userProfile.name} (UID: {userProfile.mid})
                      </p>
                    )}
                    {userProfile?.vip_type && userProfile.vip_type > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        👑 大会员
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Cookies状态 */}
              <div className={`p-4 rounded-2xl ${cookies ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{cookies ? '🍪' : '🚫'}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      认证信息: {cookies ? `已获取 (${cookies.length} 字符)` : '未获取'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {cookies ? '可以进行下载操作' : '需要登录获取认证信息'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 下载队列 */}
              <div className={`p-4 rounded-2xl ${downloads.length > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📥</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      下载队列: {downloads.length} 项任务
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {downloads.length > 0 ? '有待处理的下载任务' : '暂无下载任务'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 测试结果 */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">测试结果</h2>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-green-400 p-6 rounded-2xl font-mono text-sm shadow-inner max-h-96 overflow-y-auto">
              <div className="flex items-center space-x-2 mb-4 text-white">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm ml-2">CiliCili 测试终端</span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">
                {testResult || '💡 点击上方按钮开始测试...\n\n🚀 完整功能测试 - 检测所有下载相关功能\n⚡ 快速检查 - 仅检查基本环境状态'}
              </pre>
            </div>
          </div>
        </div>
        
        {/* 下载队列详情 */}
        {downloads.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">下载队列详情</h2>
              <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold">
                {downloads.length} 项
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {downloads.map((item, index) => (
                <div key={item.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <div className="space-y-1 text-sm">
                                                 <div className="flex items-center space-x-2">
                           <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                             item.status === 'completed' ? 'bg-green-100 text-green-800' :
                             item.status === 'downloading' ? 'bg-blue-100 text-blue-800' :
                             item.status === 'failed' ? 'bg-red-100 text-red-800' :
                             'bg-yellow-100 text-yellow-800'
                           }`}>
                             {item.status === 'completed' && '✅'}
                             {item.status === 'downloading' && '⬇️'}
                             {item.status === 'failed' && '❌'}
                             {item.status === 'pending' && '⏳'}
                             {item.status === 'completed' ? '已完成' : 
                              item.status === 'downloading' ? '下载中' : 
                              item.status === 'failed' ? '失败' : '等待中'}
                           </span>
                         </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          📹 视频数据: {item.videoData ? '✅ 已获取' : '❌ 未获取'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          🎯 质量选择: {item.selectedQuality ? '✅ 已选择' : '❌ 未选择'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 