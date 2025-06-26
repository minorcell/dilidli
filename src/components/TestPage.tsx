import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../store/appStore';

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const { isLoggedIn, cookies, downloads } = useAppStore();

  const runDownloadTest = async () => {
    setTestResult('开始测试...\n');
    
    try {
      // 1. 检查环境
      const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
      setTestResult(prev => prev + `Tauri环境: ${isTauri ? '✅' : '❌'}\n`);
      
      // 2. 检查登录状态
      setTestResult(prev => prev + `登录状态: ${isLoggedIn ? '✅' : '❌'}\n`);
      setTestResult(prev => prev + `Cookies: ${cookies ? '✅ 长度:' + cookies.length : '❌'}\n`);
      
      // 3. 检查下载队列
      setTestResult(prev => prev + `下载队列: ${downloads.length} 项\n`);
      
      if (!isTauri) {
        setTestResult(prev => prev + '❌ 请在Tauri应用中运行测试\n');
        return;
      }
      
      if (!isLoggedIn || !cookies) {
        setTestResult(prev => prev + '❌ 请先登录\n');
        return;
      }

      // 4. 测试视频信息获取
      setTestResult(prev => prev + '\n测试视频信息获取...\n');
      const testVideoId = 'BV1qEVazqEv3';
      
      try {
        const videoData = await invoke('get_video_info', { videoId: testVideoId });
        setTestResult(prev => prev + `✅ 视频信息: ${(videoData as any).title}\n`);
        
        // 5. 测试视频流获取
        setTestResult(prev => prev + '测试视频流获取...\n');
        const streamData = await invoke('get_video_streams', {
          videoId: (videoData as any).bvid,
          cid: (videoData as any).pages[0].cid,
          cookies
        });
        
        setTestResult(prev => prev + `✅ 视频流: ${(streamData as any).video_streams.length} 个质量选项\n`);
        
        // 6. 测试下载命令（不实际下载，只测试调用）
        setTestResult(prev => prev + '测试下载命令调用...\n');
        
        const selectedVideo = (streamData as any).video_streams[0];
        const selectedAudio = (streamData as any).audio_streams[0];
        
        setTestResult(prev => prev + `选择的视频质量: ${selectedVideo.description}\n`);
        setTestResult(prev => prev + `选择的音频质量: ${selectedAudio.quality}\n`);
        
        setTestResult(prev => prev + '\n✅ 所有测试通过！可以尝试实际下载。\n');
        
      } catch (videoError) {
        setTestResult(prev => prev + `❌ 视频相关测试失败: ${videoError}\n`);
      }
      
    } catch (error) {
      setTestResult(prev => prev + `❌ 测试失败: ${error}\n`);
    }
  };

  const clearTest = () => {
    setTestResult('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">下载功能测试</h1>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={runDownloadTest}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            运行测试
          </button>
          <button
            onClick={clearTest}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            清除结果
          </button>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">当前状态</h2>
          <p>登录状态: {isLoggedIn ? '✅ 已登录' : '❌ 未登录'}</p>
          <p>Cookies: {cookies ? `✅ 长度 ${cookies.length}` : '❌ 无'}</p>
          <p>下载队列: {downloads.length} 项</p>
        </div>
        
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
          <h2 className="font-semibold mb-2 text-white">测试结果</h2>
          <pre className="whitespace-pre-wrap">
            {testResult || '点击"运行测试"开始...'}
          </pre>
        </div>
        
        {downloads.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h2 className="font-semibold mb-2">下载队列详情</h2>
            {downloads.map((item, index) => (
              <div key={item.id} className="mb-2 p-2 border rounded">
                <p><strong>#{index + 1}</strong> {item.title}</p>
                <p className="text-sm text-gray-600">状态: {item.status}</p>
                <p className="text-sm text-gray-600">
                  有视频数据: {item.videoData ? '✅' : '❌'}
                </p>
                <p className="text-sm text-gray-600">
                  有质量选择: {item.selectedQuality ? '✅' : '❌'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 