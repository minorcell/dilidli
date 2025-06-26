/**
 * 检查是否在 Tauri 环境中
 */
export const isTauriAvailable = (): boolean => {
    return typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
};

/**
 * 安全调用 Tauri API
 * @param fn Tauri API 函数
 * @param fallback 非 Tauri 环境下的回调
 */
export const safeTauriCall = async <T>(
    fn: () => Promise<T>,
    fallback?: () => void | Promise<void>
): Promise<T | null> => {
    if (!isTauriAvailable()) {
        if (fallback) {
            await fallback();
        }
        return null;
    }

    try {
        return await fn();
    } catch (error) {
        console.error('Tauri API call failed:', error);
        throw error;
    }
}; 