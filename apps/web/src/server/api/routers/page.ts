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
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.page.create({
                data: {
                    title: input.title,
                    icon: input.icon,
                    workspaceId: input.workspaceId,
                    parentId: input.parentId,
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
                isFavorite: z.boolean().optional(),
                isArchived: z.boolean().optional(),
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
});
