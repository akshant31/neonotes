import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const pageRouter = createTRPCRouter({
    // Get all pages for a workspace
    list: publicProcedure
        .input(z.object({ workspaceId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.page.findMany({
                where: {
                    workspaceId: input.workspaceId,
                    isArchived: false,
                },
                orderBy: { updatedAt: 'desc' },
                include: {
                    children: {
                        where: { isArchived: false },
                        orderBy: { updatedAt: 'desc' },
                    },
                },
            });
        }),

    // Get a single page with blocks
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.page.findUnique({
                where: { id: input.id },
                include: {
                    blocks: {
                        where: { parentBlockId: null },
                        orderBy: { order: 'asc' },
                        include: {
                            childBlocks: {
                                orderBy: { order: 'asc' },
                            },
                        },
                    },
                    children: {
                        where: { isArchived: false },
                        orderBy: { updatedAt: 'desc' },
                    },
                    databases: true,
                },
            });
        }),

    // Create a new page
    create: publicProcedure
        .input(
            z.object({
                workspaceId: z.string(),
                title: z.string().optional().default('Untitled'),
                icon: z.string().optional(),
                parentId: z.string().optional(),
                categoryId: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.page.create({
                data: {
                    title: input.title,
                    icon: input.icon,
                    workspaceId: input.workspaceId,
                    parentId: input.parentId,
                    categoryId: input.categoryId,
                },
            });
        }),

    // Update a page
    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                title: z.string().optional(),
                icon: z.string().optional(),
                coverImage: z.string().optional(),
                background: z.string().nullable().optional(),
                isFavorite: z.boolean().optional(),
                isArchived: z.boolean().optional(),
                categoryId: z.string().nullable().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.page.update({
                where: { id },
                data,
            });
        }),

    // Delete (archive) a page
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.page.update({
                where: { id: input.id },
                data: { isArchived: true },
            });
        }),

    // Permanently delete a page
    permanentDelete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.page.delete({
                where: { id: input.id },
            });
        }),

    // Move page to different parent
    move: publicProcedure
        .input(
            z.object({
                id: z.string(),
                parentId: z.string().nullable(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.page.update({
                where: { id: input.id },
                data: { parentId: input.parentId },
            });
        }),

    // Get recent pages
    recent: publicProcedure
        .input(z.object({ workspaceId: z.string(), limit: z.number().default(10) }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.page.findMany({
                where: {
                    workspaceId: input.workspaceId,
                    isArchived: false,
                },
                orderBy: { updatedAt: 'desc' },
                take: input.limit,
            });
        }),

    // Get favorite pages
    favorites: publicProcedure
        .input(z.object({ workspaceId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.page.findMany({
                where: {
                    workspaceId: input.workspaceId,
                    isFavorite: true,
                    isArchived: false,
                },
                orderBy: { updatedAt: 'desc' },
            });
        }),

    // Search pages
    search: publicProcedure
        .input(
            z.object({
                workspaceId: z.string(),
                query: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            return ctx.prisma.page.findMany({
                where: {
                    workspaceId: input.workspaceId,
                    isArchived: false,
                    title: {
                        contains: input.query,
                        mode: 'insensitive',
                    },
                },
                orderBy: { updatedAt: 'desc' },
                take: 20,
            });
        }),

    // Get dashboard stats (weekly activity and page categories)
    stats: publicProcedure
        .input(z.object({ workspaceId: z.string() }))
        .query(async ({ ctx, input }) => {
            const now = new Date();
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);

            // Get all pages for this workspace
            const allPages = await ctx.prisma.page.findMany({
                where: {
                    workspaceId: input.workspaceId,
                    isArchived: false,
                },
                select: {
                    id: true,
                    title: true,
                    categoryId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            // Get all categories with page counts
            const categories = await ctx.prisma.category.findMany({
                where: { workspaceId: input.workspaceId },
                include: {
                    _count: { select: { pages: true } },
                },
            });

            // Calculate weekly activity (pages created per day for last 7 days)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const weeklyData: Record<string, number> = {};

            // Initialize all days to 0
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dayName = days[d.getDay()];
                weeklyData[dayName] = 0;
            }

            // Count pages created each day
            allPages.forEach(page => {
                const createdDate = new Date(page.createdAt);
                if (createdDate >= weekAgo) {
                    const dayName = days[createdDate.getDay()];
                    if (weeklyData[dayName] !== undefined) {
                        weeklyData[dayName]++;
                    }
                }
            });

            // Order days starting from today - 6
            const orderedDays: string[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                orderedDays.push(days[d.getDay()]);
            }

            const weeklyActivity = {
                xAxis: orderedDays,
                series: [
                    {
                        name: 'Pages Created',
                        data: orderedDays.map(day => weeklyData[day] || 0),
                    },
                ],
            };

            // Build category data from actual Category model
            let categoryData = categories
                .filter(c => c._count.pages > 0)
                .map(c => ({ name: c.name, value: c._count.pages }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            // Count uncategorized pages
            const uncategorizedCount = allPages.filter(p => !p.categoryId).length;
            if (uncategorizedCount > 0) {
                categoryData.push({ name: 'Uncategorized', value: uncategorizedCount });
            }

            // If no categories, show placeholder
            if (categoryData.length === 0) {
                categoryData = [{ name: 'All Pages', value: allPages.length || 1 }];
            }

            // Calculate additional stats
            const totalPages = allPages.length;
            const pagesThisWeek = allPages.filter(p => new Date(p.createdAt) >= weekAgo).length;

            return {
                weeklyActivity,
                categoryData,
                totalPages,
                pagesThisWeek,
            };
        }),
});
