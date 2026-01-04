import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const pageLinkRouter = createTRPCRouter({
    // Get backlinks - pages that link TO this page
    getBacklinks: publicProcedure
        .input(z.object({ pageId: z.string() }))
        .query(async ({ ctx, input }) => {
            const links = await ctx.prisma.pageLink.findMany({
                where: { targetPageId: input.pageId },
                include: {
                    sourcePage: {
                        select: {
                            id: true,
                            title: true,
                            icon: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            return links.map((l: { sourcePage: { id: string; title: string; icon: string | null } }) => l.sourcePage);
        }),

    // Get outgoing links - pages this page links TO
    getOutgoingLinks: publicProcedure
        .input(z.object({ pageId: z.string() }))
        .query(async ({ ctx, input }) => {
            const links = await ctx.prisma.pageLink.findMany({
                where: { sourcePageId: input.pageId },
                include: {
                    targetPage: {
                        select: {
                            id: true,
                            title: true,
                            icon: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            return links.map((l: { targetPage: { id: string; title: string; icon: string | null } }) => l.targetPage);
        }),

    // Sync links for a page (called when content is saved)
    syncLinks: publicProcedure
        .input(
            z.object({
                sourcePageId: z.string(),
                targetPageIds: z.array(z.string()),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Delete all existing outgoing links from this page
            await ctx.prisma.pageLink.deleteMany({
                where: { sourcePageId: input.sourcePageId },
            });

            // Create new links (filter out self-links and duplicates)
            const uniqueTargets = [...new Set(input.targetPageIds)].filter(
                (id) => id !== input.sourcePageId
            );

            if (uniqueTargets.length > 0) {
                await ctx.prisma.pageLink.createMany({
                    data: uniqueTargets.map((targetPageId) => ({
                        sourcePageId: input.sourcePageId,
                        targetPageId,
                    })),
                    skipDuplicates: true,
                });
            }

            return { synced: uniqueTargets.length };
        }),

    // Get backlink count for a page
    getBacklinkCount: publicProcedure
        .input(z.object({ pageId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.pageLink.count({
                where: { targetPageId: input.pageId },
            });
        }),
});
