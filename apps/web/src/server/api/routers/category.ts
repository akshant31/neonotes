import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const categoryRouter = createTRPCRouter({
    // Get all categories for a workspace
    list: publicProcedure
        .input(z.object({ workspaceId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.category.findMany({
                where: { workspaceId: input.workspaceId },
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: {
                            pages: { where: { isArchived: false } }
                        }
                    },
                },
            });
        }),

    // Create a new category
    create: publicProcedure
        .input(
            z.object({
                workspaceId: z.string(),
                name: z.string().min(1),
                color: z.string().optional(),
                icon: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.category.create({
                data: {
                    name: input.name,
                    color: input.color ?? '#6366f1',
                    icon: input.icon,
                    workspaceId: input.workspaceId,
                },
            });
        }),

    // Update a category
    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
                color: z.string().optional(),
                icon: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.category.update({
                where: { id },
                data,
            });
        }),

    // Delete a category
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.category.delete({
                where: { id: input.id },
            });
        }),
});
