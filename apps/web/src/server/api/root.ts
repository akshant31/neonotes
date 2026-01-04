import { createTRPCRouter } from './trpc';
import { workspaceRouter } from './routers/workspace';
import { pageRouter } from './routers/page';
import { blockRouter } from './routers/block';
import { databaseRouter } from './routers/database';
import { categoryRouter } from './routers/category';

/**
 * This is the primary router for the app.
 * All routers added here will be available on the client.
 */
export const appRouter = createTRPCRouter({
    workspace: workspaceRouter,
    page: pageRouter,
    block: blockRouter,
    database: databaseRouter,
    category: categoryRouter,
});

// Export type definition for client
export type AppRouter = typeof appRouter;
