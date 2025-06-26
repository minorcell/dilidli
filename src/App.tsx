import { useState, useEffect } from 'react';
import './App.css';
import Downloader from './components/Downloader';
import Login from './components/Login';
import TestPage from './components/TestPage';
import { useAppStore } from './store/appStore';

function App() {
  const { isLoggedIn, userProfile, logout, loadLoginData } = useAppStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showTestPage, setShowTestPage] = useState(false);

  // 应用启动时自动加载登录状态
  useEffect(() => {
    loadLoginData();
  }, [loadLoginData]);

  const handleLogin = () => {
    setShowLogin(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                CiliCili
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                哔哩哔哩视频下载器
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 测试页面切换按钮 */}
              <button
                onClick={() => setShowTestPage(!showTestPage)}
                className={`px-3 py-1 text-sm rounded ${
                  showTestPage 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showTestPage ? '退出测试' : '测试模式'}
              </button>
              
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {userProfile?.avatar && (
                      <img
                        src={userProfile.avatar}
                        alt="头像"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {userProfile?.name || '用户'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {showTestPage ? (
          <TestPage />
        ) : isLoggedIn ? (
          <Downloader />
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              欢迎使用 CiliCili
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              请先登录哔哩哔哩账号以开始下载视频
            </p>
            <button
              onClick={handleLogin}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              立即登录
            </button>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
}

export default App;
