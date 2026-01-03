import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const workspaceRouter = createTRPCRouter({
    // Get the default workspace (create if doesn't exist)
    getDefault: publicProcedure.query(async ({ ctx }) => {
        let workspace = await ctx.prisma.workspace.findFirst();

        if (!workspace) {
            workspace = await ctx.prisma.workspace.create({
                data: {
                    name: 'My Workspace',
                    icon: '📚',
                },
            });
        }

        return workspace;
    }),

    // Get workspace with all pages
    getWithPages: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.workspace.findUnique({
                where: { id: input.id },
                include: {
                    pages: {
                        where: { parentId: null, isArchived: false },
                        orderBy: { updatedAt: 'desc' },
                        include: {
                            children: {
                                where: { isArchived: false },
                                orderBy: { updatedAt: 'desc' },
                            },
                        },
                    },
                },
            });
        }),

    // Update workspace
    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
                icon: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.workspace.update({
                where: { id },
                data,
            });
        }),
});
