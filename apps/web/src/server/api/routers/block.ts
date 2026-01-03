import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

// Block content schema
const blockContentSchema = z.record(z.unknown());

export const blockRouter = createTRPCRouter({
    // Get all blocks for a page
    listByPage: publicProcedure
        .input(z.object({ pageId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.block.findMany({
                where: {
                    pageId: input.pageId,
                    parentBlockId: null,
                },
                orderBy: { order: 'asc' },
                include: {
                    childBlocks: {
                        orderBy: { order: 'asc' },
                    },
                },
            });
        }),

    // Create a new block
    create: publicProcedure
        .input(
            z.object({
                pageId: z.string(),
                type: z.string(),
                content: blockContentSchema,
                order: z.number(),
                parentBlockId: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.block.create({
                data: {
                    pageId: input.pageId,
                    type: input.type,
                    content: input.content,
                    order: input.order,
                    parentBlockId: input.parentBlockId,
                },
            });
        }),

    // Update a block
    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                type: z.string().optional(),
                content: blockContentSchema.optional(),
                order: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.block.update({
                where: { id },
                data,
            });
        }),

    // Delete a block
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.block.delete({
                where: { id: input.id },
            });
        }),

    // Batch update blocks (for reordering)
    batchUpdate: publicProcedure
        .input(
            z.array(
                z.object({
                    id: z.string(),
                    order: z.number(),
                    parentBlockId: z.string().optional().nullable(),
                })
            )
        )
        .mutation(async ({ ctx, input }) => {
            const updates = input.map((block) =>
                ctx.prisma.block.update({
                    where: { id: block.id },
                    data: {
                        order: block.order,
                        parentBlockId: block.parentBlockId,
                    },
                })
            );
            return ctx.prisma.$transaction(updates);
        }),

    // Save all blocks for a page (replace all)
    savePageBlocks: publicProcedure
        .input(
            z.object({
                pageId: z.string(),
                blocks: z.array(
                    z.object({
                        id: z.string().optional(),
                        type: z.string(),
                        content: blockContentSchema,
                        order: z.number(),
                        parentBlockId: z.string().optional().nullable(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Delete existing blocks
            await ctx.prisma.block.deleteMany({
                where: { pageId: input.pageId },
            });

            // Create new blocks
            const createdBlocks = await ctx.prisma.block.createMany({
                data: input.blocks.map((block) => ({
                    pageId: input.pageId,
                    type: block.type,
                    content: block.content,
                    order: block.order,
                    parentBlockId: block.parentBlockId,
                })),
            });

            // Update page timestamp
            await ctx.prisma.page.update({
                where: { id: input.pageId },
                data: { updatedAt: new Date() },
            });

            return createdBlocks;
        }),
});
