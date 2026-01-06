'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '@/stores/app-store';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
    children: React.ReactNode;
}

const ThemeContext = createContext<{
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}>({
    theme: 'system',
    setTheme: () => { },
    resolvedTheme: 'dark',
});

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { theme, setTheme } = useAppStore();
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
    const [mounted, setMounted] = useState(false);

    // Mark as mounted to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Get the resolved theme
        const getResolvedTheme = (): 'light' | 'dark' => {
            if (theme === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return theme;
        };

        const resolved = getResolvedTheme();
        setResolvedTheme(resolved);

        // Apply to document
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);

        // Update body classes for color scheme
        document.body.classList.remove('bg-gray-950', 'bg-white', 'text-gray-100', 'text-gray-900');
        if (resolved === 'dark') {
            document.body.classList.add('bg-gray-950', 'text-gray-100');
        } else {
            document.body.classList.add('bg-white', 'text-gray-900');
        }

        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                const newResolved = mediaQuery.matches ? 'dark' : 'light';
                setResolvedTheme(newResolved);
                root.classList.remove('light', 'dark');
                root.classList.add(newResolved);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, mounted]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);

