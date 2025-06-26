import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../store/appStore';
import { VideoData, PlayUrlData } from '../types/bilibili';

export default function Downloader() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentVideoData, setCurrentVideoData] = useState<VideoData | null>(null);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [streamData, setStreamData] = useState<PlayUrlData | null>(null);
  
  const { downloads: downloadQueue, addDownloadItem, isLoggedIn, cookies } = useAppStore();
  
  // 组件加载时的调试信息
  console.log('Downloader 组件已加载');
  console.log('当前状态:', { videoUrl, isAnalyzing, downloadQueue: downloadQueue.length });

  // 检查是否在 Tauri 环境中
  const isTauriAvailable = () => {
    return typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
  };

  // 提取视频 ID 的函数
  const extractVideoId = (url: string): string | null => {
    // 支持多种 B站 URL 格式
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/,
      /(?:https?:\/\/)?(?:www\.)?bilibili\.com\/video\/av(\d+)/,
      /(?:https?:\/\/)?b23\.tv\/([a-zA-Z0-9]+)/,
      /^(BV[a-zA-Z0-9]+)$/,
      /^av(\d+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  // 简单的测试函数
  const simpleTest = () => {
    console.log('简单测试被调用了');
    alert('按钮点击正常！');
  };

  // 测试 Tauri 连接的函数
  const testTauriConnection = async () => {
    console.log('=== 测试 Tauri 连接 ===');
    alert('开始测试 Tauri 连接...');
    try {
      const result = await invoke('greet', { name: 'Test' });
      console.log('Tauri 连接正常:', result);
      alert(`Tauri 连接正常: ${result}`);
    } catch (error) {
      console.error('Tauri 连接失败:', error);
      alert(`Tauri 连接失败: ${error}`);
    }
  };

  // 处理视频 URL 分析
  const handleAnalyzeVideo = async () => {
    console.log('=== 开始分析视频 ===');
    console.log('Tauri 环境可用:', isTauriAvailable());
    console.log('输入的 URL:', videoUrl);
    
    if (!isTauriAvailable()) {
      console.error('Tauri 环境不可用');
      alert('请在 Tauri 应用中使用此功能');
      return;
    }

    if (!videoUrl.trim()) {
      console.error('URL 为空');
      alert('请输入视频链接或 BV 号');
      return;
    }

    const videoId = extractVideoId(videoUrl.trim());
    console.log('提取的视频 ID:', videoId);
    
    if (!videoId) {
      console.error('无法提取视频 ID');
      alert('无效的视频链接格式\n支持格式：\n- https://www.bilibili.com/video/BV...\n- https://www.bilibili.com/video/av...\n- https://b23.tv/...\n- BV...\n- av...');
      return;
    }

    setIsAnalyzing(true);
    console.log('开始设置 analyzing 状态为 true');

    try {
      console.log('调用 get_video_info，参数:', { videoId });
      
      // 调用后端获取视频信息
      const videoData: VideoData = await invoke('get_video_info', { videoId });
      console.log('获取到视频信息:', videoData);
      
      setCurrentVideoData(videoData);
      console.log('设置视频数据完成');
      
      // 如果用户已登录，获取视频流信息
      if (isLoggedIn && cookies) {
        console.log('用户已登录，获取视频流信息');
        console.log('登录状态:', isLoggedIn);
        console.log('Cookies 长度:', cookies?.length);
        
        try {
          const streamData: PlayUrlData = await invoke('get_video_streams', {
            videoId: videoData.bvid,
            cid: videoData.pages[0].cid,
            cookies
          });
          console.log('获取到视频流信息:', streamData);
          setStreamData(streamData);
          setShowQualitySelector(true);
          console.log('显示质量选择器');
        } catch (streamError) {
          console.error('获取视频流失败:', streamError);
          // 即使获取流失败，也先显示视频信息
          addDownloadItem({
            id: Date.now().toString(),
            url: videoUrl,
            title: videoData.title,
            progress: 0,
            status: 'pending'
          });
          setVideoUrl('');
          alert(`获取视频流失败：${streamError}`);
        }
      } else {
        console.log('用户未登录，添加到下载队列');
        console.log('登录状态:', isLoggedIn);
        console.log('Cookies:', cookies ? '有' : '无');
        
        // 未登录时提示用户登录
        alert('请先登录以获取视频下载链接');
        addDownloadItem({
          id: Date.now().toString(),
          url: videoUrl,
          title: videoData.title,
          progress: 0,
          status: 'pending'
        });
        setVideoUrl('');
      }
    } catch (error) {
      console.error('=== 分析视频失败 ===');
      console.error('错误类型:', typeof error);
      console.error('错误内容:', error);
      console.error('错误字符串:', String(error));
      alert(`分析视频失败：${error}`);
    } finally {
      console.log('设置 analyzing 状态为 false');
      setIsAnalyzing(false);
    }
  };

  // 处理质量选择
  const handleQualitySelect = (videoStream: any, audioStream: any) => {
    // 添加到下载队列
    addDownloadItem({
      id: Date.now().toString(),
      url: videoUrl,
      title: currentVideoData?.title || '未知视频',
      progress: 0,
      status: 'pending'
    });

    // 重置状态
    setVideoUrl('');
    setCurrentVideoData(null);
    setStreamData(null);
    setShowQualitySelector(false);
  };

  // 处理 Enter 键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyzeVideo();
    }
  };

  return (
    <div className="space-y-6">
      {/* 视频链接输入区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          添加下载任务
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              视频链接或 BV 号
            </label>
            <div className="flex space-x-2">
              <input
                id="video-url"
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://www.bilibili.com/video/BV... 或直接输入 BV 号"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isAnalyzing}
              />
              <button
                onClick={handleAnalyzeVideo}
                disabled={isAnalyzing || !videoUrl.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isAnalyzing ? '分析中...' : '解析'}
              </button>
            </div>
            
            {/* 调试按钮区域 */}
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => {
                  console.log('内联按钮被点击');
                  alert('内联按钮正常工作！');
                }}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                内联测试
              </button>
              <button
                onClick={simpleTest}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                函数测试
              </button>
              <button
                onClick={testTauriConnection}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Tauri测试
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>支持的格式：</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>完整链接：https://www.bilibili.com/video/BV1qEVazqEv3</li>
              <li>短链接：https://b23.tv/xxx</li>
              <li>直接输入：BV1qEVazqEv3</li>
              <li>AV 号：av123456</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 质量选择器 */}
      {showQualitySelector && currentVideoData && streamData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            选择下载质量
          </h2>
          
          {/* 视频信息预览 */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex space-x-4">
              <img
                src={currentVideoData.pic}
                alt={currentVideoData.title}
                className="w-32 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {currentVideoData.title}
                </h3>
                                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                   UP主: {currentVideoData.owner_info?.name || '未知'}
                 </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  时长: {Math.floor(currentVideoData.duration / 60)}分{currentVideoData.duration % 60}秒
                </p>
              </div>
            </div>
          </div>

          {/* 质量选项 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">可用质量：</h4>
            {streamData.video_streams.map((videoStream, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {videoStream.description}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({videoStream.format})
                    </span>
                    {videoStream.filesize && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        - {(videoStream.filesize / 1024 / 1024).toFixed(1)} MB
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleQualitySelect(videoStream, streamData.audio_streams[0])}
                    className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    选择
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setShowQualitySelector(false);
                setCurrentVideoData(null);
                setStreamData(null);
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 下载队列 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          下载队列 ({downloadQueue.length})
        </h2>
        
        {downloadQueue.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <p>暂无下载任务</p>
            <p className="text-sm mt-1">添加视频链接开始下载</p>
          </div>
        ) : (
          <div className="space-y-3">
            {downloadQueue.map((item) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate flex-1">
                    {item.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    item.status === 'downloading' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    item.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {item.status === 'pending' ? '等待中' :
                     item.status === 'downloading' ? '下载中' :
                     item.status === 'completed' ? '已完成' :
                     item.status === 'failed' ? '失败' : item.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">
                  {item.url}
                </p>
                
                {item.status === 'downloading' ? (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                ) : null}
                
                {item.progress > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    进度: {item.progress}%
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 