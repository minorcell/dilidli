import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 简单测试
  const simpleTest = () => {
    console.log('简单测试被调用');
    setResult('简单测试正常工作！时间: ' + new Date().toLocaleTimeString());
  };

  // 测试 Tauri 连接
  const testTauri = async () => {
    console.log('开始测试 Tauri');
    setLoading(true);
    setResult('正在测试 Tauri 连接...');
    
    try {
      const response = await invoke('greet', { name: 'TestUser' });
      console.log('Tauri 响应:', response);
      setResult(`Tauri 连接成功: ${response}`);
    } catch (error) {
      console.error('Tauri 错误:', error);
      setResult(`Tauri 连接失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试视频 API
  const testVideoAPI = async () => {
    console.log('开始测试视频 API');
    setLoading(true);
    setResult('正在测试视频 API...');
    
    try {
      const videoData = await invoke('get_video_info', { videoId: 'BV1qEVazqEv3' });
      console.log('视频数据:', videoData);
      setResult(`视频 API 成功: ${JSON.stringify(videoData, null, 2)}`);
    } catch (error) {
      console.error('视频 API 错误:', error);
      setResult(`视频 API 失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">功能测试页面</h1>
      
      {/* 测试按钮 */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={simpleTest}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            简单测试
          </button>
          
          <button
            onClick={testTauri}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '测试中...' : 'Tauri 连接测试'}
          </button>
          
          <button
            onClick={testVideoAPI}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? '测试中...' : '视频 API 测试'}
          </button>
        </div>
        
        {/* 内联按钮测试 */}
        <div className="flex space-x-4">
          <button
            onClick={() => {
              console.log('内联按钮 1');
              setResult('内联按钮 1 被点击: ' + new Date().toLocaleTimeString());
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            内联测试 1
          </button>
          
          <button
            onClick={() => {
              console.log('内联按钮 2');
              setResult('内联按钮 2 被点击: ' + new Date().toLocaleTimeString());
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            内联测试 2
          </button>
        </div>
      </div>
      
      {/* 结果显示 */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">测试结果:</h3>
        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {result || '点击按钮开始测试...'}
        </pre>
      </div>
      
      {/* 状态信息 */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>当前时间: {new Date().toLocaleString()}</p>
        <p>加载状态: {loading ? '测试中' : '空闲'}</p>
        <p>Tauri 环境: {typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ ? '可用' : '不可用'}</p>
      </div>
    </div>
  );
} 