export const isBrowser = () => typeof window !== 'undefined';

export const safeLocalStorage = {
    getItem: (key: string): string | null => {
        if (!isBrowser()) return null;
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        if (!isBrowser()) return;
        try {
            localStorage.setItem(key, value);
        } catch (e) {}
    },
    removeItem: (key: string): void => {
        if (!isBrowser()) return;
        try {
            localStorage.removeItem(key);
        } catch (e) {}
    },
};

export const safeWindow = {
    location: {
        reload: (): void => {
            if (!isBrowser()) return;
            window.location.reload();
        },
    },
};
