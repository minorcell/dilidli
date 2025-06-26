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
        console.log('设置登录状态:', { isLoggedIn, userProfile, cookiesLength: cookies?.length });
        set({ isLoggedIn, userProfile, cookies: cookies || '' });

        // 如果登录成功，自动保存登录数据
        if (isLoggedIn && userProfile && cookies) {
            console.log('保存登录数据到本地');
            const { saveLoginData } = get();
            await saveLoginData();
        }
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
        } catch (error) {
        }
    },
    loadLoginData: async () => {
        try {
            console.log('尝试加载本地登录数据');
            const loginData = await invoke<StoredLoginData | null>('load_login_data');
            console.log('本地登录数据:', loginData);

            if (loginData) {
                const isExpired = Date.now() - loginData.login_time > 7 * 24 * 60 * 60 * 1000;
                console.log('登录数据是否过期:', isExpired);

                if (!isExpired) {
                    console.log('恢复登录状态:', loginData.user_profile);
                    set({
                        isLoggedIn: true,
                        userProfile: loginData.user_profile || null,
                        cookies: loginData.cookies
                    });
                } else {
                    console.log('登录数据已过期，清除');
                    await invoke('clear_login_data');
                }
            } else {
                console.log('没有找到本地登录数据');
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
            }
        }
    }
})); 