'use client';

import { useEffect } from 'react';
import { Sidebar, SearchModal } from '@/components/layout';
import { PageEditor } from '@/components/editor';
import { Chart, StatCard, StatGrid } from '@/components/visualization';
import { useAppStore } from '@/stores/app-store';
import { trpc } from '@/utils/trpc';
import { Plus, FileText, BarChart3, Clock, CheckSquare, Loader2 } from 'lucide-react';

function Dashboard() {
  const { setCurrentPage, currentWorkspace, pages } = useAppStore();

  // Create page mutation
  const createPageMutation = trpc.page.create.useMutation({
    onSuccess: (newPage) => {
      // @ts-ignore - Page type matching
      setCurrentPage(newPage);
    },
  });

  // Fetch recent pages
  const { data: recentPages, isLoading: recentLoading } = trpc.page.recent.useQuery(
    { workspaceId: currentWorkspace?.id ?? '', limit: 5 },
    { enabled: !!currentWorkspace?.id }
  );

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = trpc.page.stats.useQuery(
    { workspaceId: currentWorkspace?.id ?? '' },
    { enabled: !!currentWorkspace?.id }
  );

  const handleCreatePage = () => {
    if (currentWorkspace?.id) {
      createPageMutation.mutate({
        workspaceId: currentWorkspace.id,
        title: 'Untitled',
        icon: '📄',
      });
    }
  };

  // Default data for charts when loading
  const defaultWeeklyActivity = {
    xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [{ name: 'Pages Created', data: [0, 0, 0, 0, 0, 0, 0] }],
  };

  const defaultCategoryData = [{ name: 'No Data', value: 1 }];

  const weeklyActivity = stats?.weeklyActivity ?? defaultWeeklyActivity;
  const categoryData = stats?.categoryData ?? defaultCategoryData;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-400">
            Here&apos;s what&apos;s happening with your notes today.
          </p>
        </div>

        {/* Stats */}
        <StatGrid>
          <StatCard
            title="Total Pages"
            value={(stats?.totalPages ?? pages.length).toString()}
            icon={<FileText className="w-5 h-5" />}
            change={stats?.pagesThisWeek ?? 0}
            trend={(stats?.pagesThisWeek ?? 0) > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            title="This Week"
            value={(stats?.pagesThisWeek ?? 0).toString()}
            icon={<CheckSquare className="w-5 h-5" />}
            change={stats?.pagesThisWeek ?? 0}
            trend={(stats?.pagesThisWeek ?? 0) > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            title="Categories"
            value={(stats?.categoryData?.length ?? 0).toString()}
            icon={<BarChart3 className="w-5 h-5" />}
            change={0}
            trend="neutral"
          />
          <StatCard
            title="Recent Activity"
            value={recentPages?.length?.toString() ?? '0'}
            icon={<Clock className="w-5 h-5" />}
            change={0}
            trend="neutral"
          />
        </StatGrid>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
            <Chart
              type="line"
              data={{
                xAxis: weeklyActivity.xAxis,
                series: weeklyActivity.series,
              }}
              height={250}
            />
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Notes by Category</h3>
            <Chart
              type="pie"
              data={{ series: categoryData }}
              height={250}
            />
          </div>
        </div>

        {/* Recent Pages */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Pages</h3>
            <button
              onClick={handleCreatePage}
              disabled={createPageMutation.isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {createPageMutation.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              New Page
            </button>
          </div>

          {recentLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : recentPages && recentPages.length > 0 ? (
            <div className="space-y-2">
              {recentPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page as any)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                >
                  <span className="text-xl">{page.icon || '📄'}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-200">{page.title || 'Untitled'}</p>
                    <p className="text-sm text-gray-500">
                      Updated {new Date(page.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-4">No pages yet. Create your first page to get started!</p>
              <button
                onClick={handleCreatePage}
                disabled={createPageMutation.isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {createPageMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create your first page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { currentPage, setCurrentPage, isSearchOpen, setSearchOpen } = useAppStore();
  const utils = trpc.useUtils();

  // Restore page from URL hash on mount
  useEffect(() => {
    const pageId = window.location.hash.replace('#page=', '');
    if (pageId && !currentPage) {
      // Fetch the page by ID and set it
      utils.page.getById.fetch({ id: pageId }).then((page) => {
        if (page) {
          setCurrentPage(page as any);
        }
      }).catch(() => {
        // Page not found, clear hash
        window.history.replaceState(null, '', window.location.pathname);
      });
    }
  }, []);

  // Sync current page to URL hash
  useEffect(() => {
    if (currentPage) {
      window.history.replaceState(null, '', `#page=${currentPage.id}`);
    } else {
      // Clear hash when going to dashboard
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [currentPage]);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {currentPage ? <PageEditor /> : <Dashboard />}
      </main>

      {/* Search modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

