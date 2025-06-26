import { useState, useEffect } from 'react';
import './App.css';
import Downloader from './components/Downloader';
import Login from './components/Login';
import TestPage from './components/TestPage';
import UserProfile from './components/UserProfile';
import { useAppStore } from './store/appStore';

function App() {
  const { isLoggedIn, userProfile, logout, loadLoginData } = useAppStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showTestPage, setShowTestPage] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // 应用启动时自动加载登录状态
  useEffect(() => {
    loadLoginData();
  }, [loadLoginData]);

  const handleLogin = () => {
    setShowLogin(true);
  };

  // VIP类型显示
  const getVipBadge = (vipType: number) => {
    if (vipType === 1) return { text: '月度大会员', color: 'from-pink-500 to-red-500' };
    if (vipType === 2) return { text: '年度大会员', color: 'from-purple-500 to-pink-500' };
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo区域 */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">🎬</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                  CiliCili
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  哔哩哔哩视频下载器
                </p>
              </div>
            </div>
            
            {/* 右侧用户区域 */}
            <div className="flex items-center space-x-4">
              {/* 测试模式按钮 */}
              <button
                onClick={() => setShowTestPage(!showTestPage)}
                className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                  showTestPage 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {showTestPage ? '🔧 退出测试' : '🧪 测试模式'}
              </button>
              
              {isLoggedIn ? (
                <div className="relative">
                  {/* 用户信息显示 */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <div className="relative">
                      {userProfile?.avatar ? (
                        <img
                          src={userProfile.avatar}
                          alt="头像"
                          className="w-10 h-10 rounded-full ring-2 ring-pink-500/30"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">👤</span>
                        </div>
                      )}
                      {/* VIP标识 */}
                      {userProfile?.vip_type && userProfile.vip_type > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">👑</span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {userProfile?.name || '用户'}
                      </p>
                      {userProfile?.vip_type && getVipBadge(userProfile.vip_type) && (
                        <p className={`text-xs font-medium bg-gradient-to-r ${getVipBadge(userProfile.vip_type)?.color} bg-clip-text text-transparent`}>
                          {getVipBadge(userProfile.vip_type)?.text}
                        </p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 用户菜单下拉 */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      {/* 用户信息卡片 */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          {userProfile?.avatar ? (
                            <img
                              src={userProfile.avatar}
                              alt="头像"
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">👤</span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {userProfile?.name || '用户'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              UID: {userProfile?.mid || 'Unknown'}
                            </p>
                            {userProfile?.vip_type && getVipBadge(userProfile.vip_type) && (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 bg-gradient-to-r ${getVipBadge(userProfile.vip_type)?.color} text-white`}>
                                👑 {getVipBadge(userProfile.vip_type)?.text}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 菜单项 */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowUserProfile(true);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <span>👤</span>
                          <span>个人信息</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            // 这里可以添加设置的逻辑
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <span>⚙️</span>
                          <span>设置</span>
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                        >
                          <span>🚪</span>
                          <span>退出登录</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-xl hover:from-pink-600 hover:to-blue-600 text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  🔑 立即登录
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {showTestPage ? (
          <TestPage />
        ) : isLoggedIn ? (
          <Downloader />
        ) : (
          /* 欢迎页面 */
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">
              {/* 主要图标 */}
              <div className="mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-6xl">🎬</span>
                </div>
                <div className="w-24 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full mx-auto"></div>
              </div>

              {/* 标题和描述 */}
              <h2 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent mb-4">
                CiliCili 下载器
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                高质量下载你喜欢的哔哩哔哩视频
              </p>
              <p className="text-gray-500 dark:text-gray-500 mb-8">
                支持多种清晰度选择，快速稳定的下载体验
              </p>

              {/* 特性展示 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">高清下载</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">支持4K、1080P等多种清晰度</p>
                </div>
                <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">快速稳定</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">高速下载，断点续传</p>
                </div>
                <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">安全可靠</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">本地运行，隐私保护</p>
                </div>
              </div>

              {/* 登录按钮 */}
              <button
                onClick={handleLogin}
                className="px-12 py-4 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-2xl hover:from-pink-600 hover:to-blue-600 font-bold text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
              >
                🔑 立即登录开始使用
              </button>
              
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                需要哔哩哔哩账号授权以获取视频下载权限
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} />
      )}

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile onClose={() => setShowUserProfile(false)} />
      )}

      {/* 点击外部关闭用户菜单 */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  );
}

export default App;
