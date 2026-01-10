import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, Workspace } from '@/types';

interface AppState {
    // Workspace
    currentWorkspace: Workspace | null;
    setCurrentWorkspace: (workspace: Workspace | null) => void;

    // Pages
    pages: Page[];
    setPages: (pages: Page[]) => void;
    addPage: (page: Page) => void;
    updatePage: (id: string, updates: Partial<Page>) => void;
    deletePage: (id: string) => void;

    // Current page
    currentPage: Page | null;
    setCurrentPage: (page: Page | null) => void;

    // Sidebar
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Theme
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;

    // Display density
    displayDensity: 'compact' | 'default' | 'comfortable';
    setDisplayDensity: (density: 'compact' | 'default' | 'comfortable') => void;

    // Search
    isSearchOpen: boolean;
    setSearchOpen: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Workspace
            currentWorkspace: null,
            setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

            // Pages
            pages: [],
            setPages: (pages) => set({ pages }),
            addPage: (page) => set((state) => ({ pages: [...state.pages, page] })),
            updatePage: (id, updates) => set((state) => ({
                pages: state.pages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
                currentPage: state.currentPage?.id === id
                    ? { ...state.currentPage, ...updates }
                    : state.currentPage,
            })),
            deletePage: (id) => set((state) => ({
                pages: state.pages.filter((p) => p.id !== id),
                currentPage: state.currentPage?.id === id ? null : state.currentPage,
            })),

            // Current page
            currentPage: null,
            setCurrentPage: (page) => set({ currentPage: page }),

            // Sidebar
            isSidebarOpen: true,
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            setSidebarOpen: (open) => set({ isSidebarOpen: open }),

            // Theme
            theme: 'system',
            setTheme: (theme) => set({ theme }),

            // Display density
            displayDensity: 'default',
            setDisplayDensity: (density) => set({ displayDensity: density }),

            // Search
            isSearchOpen: false,
            setSearchOpen: (open) => set({ isSearchOpen: open }),
            searchQuery: '',
            setSearchQuery: (query) => set({ searchQuery: query }),
        }),
        {
            name: 'neonotes-storage',
            partialize: (state) => ({
                theme: state.theme,
                isSidebarOpen: state.isSidebarOpen,
                displayDensity: state.displayDensity,
            }),
        }
    )
);

