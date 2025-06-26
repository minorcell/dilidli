import { useAppStore } from '../store/appStore';

interface UserProfileProps {
  onClose?: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { userProfile, isLoggedIn } = useAppStore();

  if (!isLoggedIn || !userProfile) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              用户未登录
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              请先登录哔哩哔哩账号
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-xl hover:from-pink-600 hover:to-blue-600 font-semibold"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VIP类型显示
  const getVipInfo = (vipType: number) => {
    if (vipType === 1) return { text: '月度大会员', color: 'from-pink-500 to-red-500', icon: '👑' };
    if (vipType === 2) return { text: '年度大会员', color: 'from-purple-500 to-pink-500', icon: '👑' };
    return null;
  };

  const vipInfo = getVipInfo(userProfile.vip_type);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-blue-500 p-8 text-white relative overflow-hidden">
          {/* 装饰性背景 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex justify-between items-start">
            <div className="flex items-center space-x-6">
              {/* 头像 */}
              <div className="relative">
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt="头像"
                    className="w-20 h-20 rounded-2xl border-4 border-white/30 shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-2xl border-4 border-white/30 flex items-center justify-center">
                    <span className="text-3xl">👤</span>
                  </div>
                )}
                {/* VIP角标 */}
                {vipInfo && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-lg">👑</span>
                  </div>
                )}
              </div>
              
              {/* 用户信息 */}
              <div>
                <h2 className="text-3xl font-bold mb-2">{userProfile.name}</h2>
                <p className="text-white/80 text-lg mb-1">UID: {userProfile.mid}</p>
                {vipInfo && (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${vipInfo.color} bg-white/20 backdrop-blur-sm`}>
                    <span className="mr-1">{vipInfo.icon}</span>
                    <span>{vipInfo.text}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
            >
              <span className="text-white text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          
          {/* 账户信息卡片 */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">账户信息</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">用户名</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{userProfile.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">用户ID</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{userProfile.mid}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">会员状态</label>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {vipInfo ? vipInfo.text : '普通用户'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">登录状态</label>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-semibold text-green-600 dark:text-green-400">已登录</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 会员特权 */}
          {vipInfo && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-800/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">👑</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">会员特权</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🎬</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">高清视频</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">支持1080P+画质</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">下载加速</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">更快的下载速度</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🚫</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">无广告</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">纯净下载体验</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🎯</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">优先支持</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">享受优先服务</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 使用统计 */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">使用统计</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">0</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">今日下载</p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">本月下载</p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">总计下载</p>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      {/* 点击外部关闭 */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      ></div>
    </div>
  );
} 