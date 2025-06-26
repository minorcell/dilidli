import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { UserProfile, DownloadItem, StoredLoginData } from '../types/bilibili';

interface AppState {
    isLoggedIn: boolean;
    userProfile: UserProfile | null;
    cookies: string;
    downloads: DownloadItem[];
    setLoginStatus: (isLoggedIn: boolean, userProfile?: UserProfile, cookies?: string) => void;
    addDownloadItem: (item: DownloadItem) => void;
    updateDownloadProgress: (id: string, progress: number) => void;
    updateDownloadStatus: (id: string, status: 'pending' | 'downloading' | 'completed' | 'failed') => void;
    logout: () => void;
    loadLoginData: () => Promise<void>;
    saveLoginData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    isLoggedIn: false,
    userProfile: null,
    cookies: '',
    downloads: [],
    setLoginStatus: async (isLoggedIn, userProfile, cookies) => {
        console.log('setLoginStatus 被调用:', { isLoggedIn, userProfile, cookies: cookies ? '有cookies' : '无cookies' });

        set({ isLoggedIn, userProfile, cookies: cookies || '' });

        // 暂时注释掉自动保存功能，避免白屏问题
        /*
        if (isLoggedIn && userProfile && cookies) {
            const loginData: StoredLoginData = {
                cookies,
                user_profile: userProfile,
                login_time: Date.now()
            };

            try {
                await invoke('save_login_data', { loginData });
                console.log('登录数据已保存');
            } catch (error) {
                console.error('保存登录数据失败:', error);
            }
        }
        */
    },
    addDownloadItem: (item) => set((state) => ({
        downloads: [...state.downloads, item]
    })),
    updateDownloadProgress: (id, progress) => set((state) => ({
        downloads: state.downloads.map(item =>
            item.id === id ? { ...item, progress } : item
        )
    })),
    updateDownloadStatus: (id, status) => set((state) => ({
        downloads: state.downloads.map(item =>
            item.id === id ? { ...item, status } : item
        )
    })),
    logout: async () => {
        set({
            isLoggedIn: false,
            userProfile: null,
            cookies: ''
        });

        try {
            await invoke('clear_login_data');
            console.log('登录数据已清除');
        } catch (error) {
            console.error('清除登录数据失败:', error);
        }
    },
    loadLoginData: async () => {
        try {
            const loginData = await invoke<StoredLoginData | null>('load_login_data');

            if (loginData) {
                const isExpired = Date.now() - loginData.login_time > 7 * 24 * 60 * 60 * 1000;

                if (!isExpired) {
                    set({
                        isLoggedIn: true,
                        userProfile: loginData.user_profile || null,
                        cookies: loginData.cookies
                    });
                    console.log('已加载保存的登录状态');
                } else {
                    await invoke('clear_login_data');
                    console.log('登录已过期，已清除数据');
                }
            }
        } catch (error) {
            console.error('加载登录数据失败:', error);
        }
    },
    saveLoginData: async () => {
        const { isLoggedIn, userProfile, cookies } = get();

        if (isLoggedIn && userProfile && cookies) {
            const loginData: StoredLoginData = {
                cookies,
                user_profile: userProfile,
                login_time: Date.now()
            };

            try {
                await invoke('save_login_data', { loginData });
            } catch (error) {
                console.error('保存登录数据失败:', error);
            }
        }
    }
})); 