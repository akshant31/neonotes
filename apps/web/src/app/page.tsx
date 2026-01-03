'use client';

import { useState } from 'react';
import { Sidebar, SearchModal } from '@/components/layout';
import { BlockEditor } from '@/components/editor';
import { Chart, chartPresets, StatCard, StatGrid, DashboardWidget, DashboardGrid } from '@/components/visualization';
import { useAppStore } from '@/stores/app-store';
import {
  Plus,
  FileText,
  BarChart3,
  Calendar,
  CheckSquare,
  Star,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
} from 'lucide-react';

// Sample data for demo
const sampleChartData = {
  line: { x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], y: [120, 200, 150, 80, 70, 110, 130], name: 'Page Views' },
  bar: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], values: [42, 68, 89, 74, 95], name: 'Notes Created' },
  pie: [
    { name: 'Personal', value: 35 },
    { name: 'Work', value: 45 },
    { name: 'Ideas', value: 20 },
  ],
};

export default function Home() {
  const { currentPage, isSidebarOpen } = useAppStore();
  const [showDashboard, setShowDashboard] = useState(true);
  const [editorContent, setEditorContent] = useState<Record<string, unknown> | undefined>(undefined);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <SearchModal />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {showDashboard ? 'Dashboard' : currentPage?.title || 'Welcome to NeoNotes'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showDashboard
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
            >
              {showDashboard ? 'View Editor' : 'View Dashboard'}
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showDashboard ? (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
              {/* Stats */}
              <StatGrid columns={4}>
                <StatCard
                  title="Total Pages"
                  value="42"
                  change={12}
                  changeLabel="this week"
                  icon={<FileText className="w-5 h-5" />}
                />
                <StatCard
                  title="Tasks Completed"
                  value="128"
                  change={8}
                  changeLabel="this week"
                  icon={<CheckSquare className="w-5 h-5" />}
                />
                <StatCard
                  title="Favorites"
                  value="15"
                  change={-2}
                  changeLabel="this week"
                  icon={<Star className="w-5 h-5" />}
                />
                <StatCard
                  title="This Month"
                  value="Jan 2026"
                  icon={<Calendar className="w-5 h-5" />}
                />
              </StatGrid>

              {/* Charts */}
              <DashboardGrid>
                <DashboardWidget title="Weekly Activity" className="md:col-span-2">
                  <Chart option={chartPresets.line(sampleChartData.line)} style={{ height: '300px' }} />
                </DashboardWidget>

                <DashboardWidget title="Notes by Category">
                  <Chart option={chartPresets.pie(sampleChartData.pie)} style={{ height: '300px' }} />
                </DashboardWidget>

                <DashboardWidget title="Monthly Overview" className="md:col-span-2">
                  <Chart option={chartPresets.bar(sampleChartData.bar)} style={{ height: '300px' }} />
                </DashboardWidget>

                <DashboardWidget title="Quick Stats">
                  <Chart option={chartPresets.gauge(75, 100, 'Productivity')} style={{ height: '200px' }} />
                </DashboardWidget>
              </DashboardGrid>

              {/* Recent Pages */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Pages</h2>
                  <button className="text-sm text-blue-500 hover:text-blue-600">View all</button>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'Project Roadmap 2026', icon: '🗺️', updated: '2 hours ago' },
                    { title: 'Meeting Notes - Q1 Planning', icon: '📝', updated: '5 hours ago' },
                    { title: 'Research: New Technologies', icon: '🔬', updated: '1 day ago' },
                    { title: 'Personal Goals', icon: '🎯', updated: '2 days ago' },
                  ].map((page, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <span className="text-2xl">{page.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white">{page.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{page.updated}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-8">
              {/* Page header */}
              <div className="px-16 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <button className="p-2 text-2xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    📄
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <Smile className="w-4 h-4" />
                    Add icon
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <ImageIcon className="w-4 h-4" />
                    Add cover
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Untitled"
                  className="w-full text-4xl font-bold bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  defaultValue=""
                />
              </div>

              {/* Editor */}
              <div className="px-12">
                <BlockEditor
                  content={editorContent}
                  onChange={setEditorContent}
                  placeholder="Type '/' for commands, or just start writing..."
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
