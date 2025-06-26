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
  
  const { downloads: downloadQueue, addDownloadItem, updateDownloadProgress, updateDownloadStatus, isLoggedIn, cookies } = useAppStore();

  // 检查是否在 Tauri 环境中
  const isTauriAvailable = () => {
    return typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
  };

  // 提取视频 ID 的函数
  const extractVideoId = (url: string): string | null => {
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
  
  // 处理视频 URL 分析
  const handleAnalyzeVideo = async () => {
    if (!isTauriAvailable()) {
      alert('请在 Tauri 应用中使用此功能');
      return;
    }

    if (!videoUrl.trim()) {
      alert('请输入视频链接或 BV 号');
      return;
    }

    const videoId = extractVideoId(videoUrl.trim());
    
    if (!videoId) {
      alert('无效的视频链接格式\n支持格式：\n- https://www.bilibili.com/video/BV...\n- https://www.bilibili.com/video/av...\n- https://b23.tv/...\n- BV...\n- av...');
      return;
    }

    setIsAnalyzing(true);

    try {
      const videoData: VideoData = await invoke('get_video_info', { videoId });
      setCurrentVideoData(videoData);
      
      if (isLoggedIn && cookies) {
        try {
          const streamData: PlayUrlData = await invoke('get_video_streams', {
            videoId: videoData.bvid,
            cid: videoData.pages[0].cid,
            cookies
          });
          setStreamData(streamData);
          setShowQualitySelector(true);
        } catch (streamError) {
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
      alert(`分析视频失败：${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 处理质量选择
  const handleQualitySelect = (videoStream: any, audioStream: any) => {
    if (!currentVideoData) return;

    const downloadItem = {
      id: Date.now().toString(),
      url: videoUrl,
      title: currentVideoData.title,
      progress: 0,
      status: 'pending' as const,
      videoData: currentVideoData,
      selectedQuality: {
        video: videoStream,
        audio: audioStream
      }
    };

    addDownloadItem(downloadItem);

    setVideoUrl('');
    setCurrentVideoData(null);
    setStreamData(null);
    setShowQualitySelector(false);
  };

  // 测试流URL的可访问性
  const testStreamUrl = async (url?: string) => {
    if (!url) {
      alert('URL为空');
      return;
    }

    if (!isTauriAvailable()) {
      alert('请在Tauri应用中使用此功能');
      return;
    }

    try {
      const result = await invoke('test_stream_url', { url, cookies });
      alert(`URL测试成功: ${result}`);
    } catch (error) {
      alert(`URL测试失败: ${error}`);
    }
  };

  // 开始下载任务
  const startDownload = async (downloadItem: any) => {
    if (!isTauriAvailable()) {
      updateDownloadStatus(downloadItem.id, 'failed');
      alert('Tauri 环境不可用，请在应用中使用此功能');
      return;
    }

    if (!downloadItem.videoData || !downloadItem.selectedQuality) {
      updateDownloadStatus(downloadItem.id, 'failed');
      alert('下载信息不完整，请重新解析视频');
      return;
    }

    if (!isLoggedIn || !cookies) {
      updateDownloadStatus(downloadItem.id, 'failed');
      alert('请先登录后再下载');
      return;
    }

    try {
      updateDownloadStatus(downloadItem.id, 'downloading');
      updateDownloadProgress(downloadItem.id, 0);

      const result = await invoke('download_video', {
        videoData: downloadItem.videoData,
        videoStream: downloadItem.selectedQuality.video,
        audioStream: downloadItem.selectedQuality.audio,
        cookies: cookies
      });

      updateDownloadStatus(downloadItem.id, 'completed');
      updateDownloadProgress(downloadItem.id, 100);
      alert(`下载完成: ${result}`);
    } catch (error) {
      updateDownloadStatus(downloadItem.id, 'failed');
      alert(`下载失败：${error}`);
    }
  };

  // 处理 Enter 键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyzeVideo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        
        {/* 页面标题 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full mb-4 shadow-lg">
            <span className="text-3xl">🎬</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent mb-2">
            CiliCili 下载器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            高质量下载你喜欢的B站视频
          </p>
        </div>

        {/* 视频链接输入区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-blue-500 p-6">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-white rounded mr-4 opacity-80"></div>
              <h2 className="text-2xl font-bold text-white">
                添加下载任务
              </h2>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div>
              <label htmlFor="video-url" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                视频链接或 BV 号
              </label>
              <div className="flex space-x-3">
                <input
                  id="video-url"
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://www.bilibili.com/video/BV... 或直接输入 BV 号"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  disabled={isAnalyzing}
                />
                <button
                  onClick={handleAnalyzeVideo}
                  disabled={isAnalyzing || !videoUrl.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-xl hover:from-pink-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  {isAnalyzing ? '分析中...' : '🔍 解析'}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">支持的格式：</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div>• 完整链接：https://www.bilibili.com/video/BV...</div>
                <div>• 短链接：https://b23.tv/xxx</div>
                <div>• 直接输入：BV1qEVazqEv3</div>
                <div>• AV 号：av123456</div>
              </div>
            </div>
          </div>
        </div>

        {/* 质量选择器 */}
        {showQualitySelector && currentVideoData && streamData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
              <h2 className="text-2xl font-bold text-white">
                选择下载质量
              </h2>
            </div>
            
            <div className="p-8 space-y-6">
              {/* 视频信息预览 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6">
                <div className="flex space-x-6">
                  <img
                    src={currentVideoData.pic}
                    alt={currentVideoData.title}
                    className="w-40 h-24 object-cover rounded-lg shadow-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {currentVideoData.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        👤 {currentVideoData.owner_info?.name || '未知'}
                      </span>
                      <span className="flex items-center">
                        ⏱️ {Math.floor(currentVideoData.duration / 60)}分{currentVideoData.duration % 60}秒
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 清晰度选择下拉菜单 */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
                  选择清晰度：
                </label>
                <select
                  onChange={(e) => {
                    const selectedIndex = parseInt(e.target.value);
                    const selectedVideo = streamData.video_streams[selectedIndex];
                    const selectedAudio = streamData.audio_streams[0];
                    handleQualitySelect(selectedVideo, selectedAudio);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-white text-lg transition-all"
                  defaultValue=""
                >
                  <option value="" disabled>🎯 请选择视频清晰度</option>
                  {streamData.video_streams.map((videoStream, index) => (
                    <option key={index} value={index}>
                      📺 {videoStream.description}
                      {videoStream.filesize && ` (${(videoStream.filesize / 1024 / 1024).toFixed(1)} MB)`}
                    </option>
                  ))}
                </select>
                
                {/* 测试按钮 */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const firstStream = streamData.video_streams[0];
                      if (firstStream?.url) {
                        testStreamUrl(firstStream.url);
                      }
                    }}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm border border-gray-300 dark:border-gray-600 transition-all"
                  >
                    🔍 测试链接可用性
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowQualitySelector(false);
                    setCurrentVideoData(null);
                    setStreamData(null);
                  }}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg transition-all"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 下载队列 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
            <h2 className="text-2xl font-bold text-white">
              下载队列 ({downloadQueue.length})
            </h2>
          </div>
          
          <div className="p-8">
            {downloadQueue.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-4xl">📥</span>
                </div>
                <p className="text-xl font-medium mb-2">暂无下载任务</p>
                <p className="text-gray-400">添加视频链接开始下载</p>
              </div>
            ) : (
              <div className="space-y-4">
                {downloadQueue.map((item) => (
                  <div key={item.id} className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-6 hover:border-blue-200 dark:hover:border-blue-700 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate flex-1 text-lg">
                        {item.title}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          item.status === 'downloading' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          item.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {item.status === 'pending' ? '⏳ 等待中' :
                           item.status === 'downloading' ? '⬇️ 下载中' :
                           item.status === 'completed' ? '✅ 已完成' :
                           item.status === 'failed' ? '❌ 失败' : item.status}
                        </span>
                        {item.status === 'pending' && (
                          <button
                            onClick={() => startDownload(item)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                          >
                            🚀 开始
                          </button>
                        )}
                        {item.status === 'failed' && (
                          <button
                            onClick={() => {
                              updateDownloadStatus(item.id, 'pending');
                              startDownload(item);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                          >
                            🔄 重试
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
                      🔗 {item.url}
                    </p>
                    
                    {item.status === 'downloading' && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {item.progress > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        📊 进度: {item.progress}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
} 