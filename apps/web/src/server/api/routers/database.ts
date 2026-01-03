import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const databaseRouter = createTRPCRouter({
    // Get all databases for a page
    listByPage: publicProcedure
        .input(z.object({ pageId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.database.findMany({
                where: { pageId: input.pageId },
                include: {
                    columns: { orderBy: { order: 'asc' } },
                    rows: {
                        include: {
                            cells: true,
                        },
                    },
                    views: true,
                },
            });
        }),

    // Get a single database with all data
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.database.findUnique({
                where: { id: input.id },
                include: {
                    columns: { orderBy: { order: 'asc' } },
                    rows: {
                        include: {
                            cells: true,
                        },
                    },
                    views: true,
                },
            });
        }),

    // Create a new database
    create: publicProcedure
        .input(
            z.object({
                pageId: z.string(),
                name: z.string().optional().default('Untitled Database'),
                description: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Create database with default columns
            return ctx.prisma.database.create({
                data: {
                    name: input.name,
                    description: input.description,
                    pageId: input.pageId,
                    columns: {
                        create: [
                            { name: 'Name', type: 'text', order: 0, width: 300 },
                            { name: 'Tags', type: 'multiSelect', order: 1, width: 200 },
                            { name: 'Created', type: 'date', order: 2, width: 150 },
                        ],
                    },
                    views: {
                        create: {
                            name: 'Table',
                            type: 'table',
                            isDefault: true,
                            config: {},
                        },
                    },
                },
                include: {
                    columns: true,
                    views: true,
                },
            });
        }),

    // Update database
    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
                description: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.database.update({
                where: { id },
                data,
            });
        }),

    // Delete database
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.database.delete({
                where: { id: input.id },
            });
        }),

    // Add a column
    addColumn: publicProcedure
        .input(
            z.object({
                databaseId: z.string(),
                name: z.string(),
                type: z.string(),
                options: z.record(z.unknown()).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Get max order
            const maxOrder = await ctx.prisma.databaseColumn.aggregate({
                where: { databaseId: input.databaseId },
                _max: { order: true },
            });

            return ctx.prisma.databaseColumn.create({
                data: {
                    databaseId: input.databaseId,
                    name: input.name,
                    type: input.type,
                    options: input.options,
                    order: (maxOrder._max.order ?? -1) + 1,
                },
            });
        }),

    // Update a column
    updateColumn: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
                type: z.string().optional(),
                options: z.record(z.unknown()).optional(),
                width: z.number().optional(),
                isVisible: z.boolean().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.databaseColumn.update({
                where: { id },
                data,
            });
        }),

    // Delete a column
    deleteColumn: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.databaseColumn.delete({
                where: { id: input.id },
            });
        }),

    // Add a row
    addRow: publicProcedure
        .input(z.object({ databaseId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Get all columns for this database
            const columns = await ctx.prisma.databaseColumn.findMany({
                where: { databaseId: input.databaseId },
            });

            // Create row with empty cells for each column
            return ctx.prisma.databaseRow.create({
                data: {
                    databaseId: input.databaseId,
                    cells: {
                        create: columns.map((col) => ({
                            columnId: col.id,
                            value: null,
                        })),
                    },
                },
                include: { cells: true },
            });
        }),

    // Update a cell
    updateCell: publicProcedure
        .input(
            z.object({
                rowId: z.string(),
                columnId: z.string(),
                value: z.unknown(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.databaseCell.upsert({
                where: {
                    columnId_rowId: {
                        columnId: input.columnId,
                        rowId: input.rowId,
                    },
                },
                update: { value: input.value as object },
                create: {
                    columnId: input.columnId,
                    rowId: input.rowId,
                    value: input.value as object,
                },
            });
        }),

    // Delete a row
    deleteRow: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.databaseRow.delete({
                where: { id: input.id },
            });
        }),
});
