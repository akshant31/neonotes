// Type definitions for NeoNotes

// Page types
export interface Page {
    id: string;
    title: string;
    icon?: string | null;
    coverImage?: string | null;
    isArchived: boolean;
    isFavorite: boolean;
    createdAt: Date;
    updatedAt: Date;
    parentId?: string | null;
    workspaceId: string;
    children?: Page[];
    blocks?: Block[];
}

// Block types
export type BlockType =
    | 'paragraph'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'bulletList'
    | 'numberedList'
    | 'todo'
    | 'code'
    | 'quote'
    | 'callout'
    | 'divider'
    | 'image'
    | 'table'
    | 'database';

export interface Block {
    id: string;
    type: BlockType;
    content: Record<string, unknown>;
    order: number;
    pageId: string;
    parentBlockId?: string | null;
    childBlocks?: Block[];
    createdAt: Date;
    updatedAt: Date;
}

// Database types
export interface Database {
    id: string;
    name: string;
    description?: string | null;
    pageId: string;
    columns: DatabaseColumn[];
    rows: DatabaseRow[];
    views: DatabaseView[];
    createdAt: Date;
    updatedAt: Date;
}

export type ColumnType =
    | 'text'
    | 'number'
    | 'date'
    | 'select'
    | 'multiSelect'
    | 'checkbox'
    | 'url'
    | 'email'
    | 'phone'
    | 'person'
    | 'files'
    | 'relation'
    | 'rollup'
    | 'formula';

export interface SelectOption {
    id: string;
    name: string;
    color: string;
}

export interface DatabaseColumn {
    id: string;
    name: string;
    type: ColumnType;
    options?: { options: SelectOption[] } | null;
    order: number;
    width: number;
    isVisible: boolean;
    databaseId: string;
}

export interface DatabaseRow {
    id: string;
    databaseId: string;
    cells: DatabaseCell[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DatabaseCell {
    id: string;
    value: unknown;
    columnId: string;
    rowId: string;
}

export type ViewType = 'table' | 'board' | 'calendar' | 'gallery' | 'timeline' | 'list';

export interface DatabaseView {
    id: string;
    name: string;
    type: ViewType;
    config: ViewConfig;
    isDefault: boolean;
    databaseId: string;
}

export interface ViewConfig {
    filters?: Filter[];
    sorts?: Sort[];
    groupBy?: string;
    hiddenColumns?: string[];
}

export interface Filter {
    columnId: string;
    operator: string;
    value: unknown;
}

export interface Sort {
    columnId: string;
    direction: 'asc' | 'desc';
}

// Dashboard types
export interface Dashboard {
    id: string;
    name: string;
    description?: string | null;
    layout: DashboardLayout;
    widgets: DashboardWidget[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DashboardLayout {
    columns: number;
    rowHeight: number;
}

export type WidgetType = 'chart' | 'stat' | 'recentPages' | 'quickCapture';

export interface DashboardWidget {
    id: string;
    type: WidgetType;
    title?: string | null;
    config: WidgetConfig;
    position: WidgetPosition;
    dashboardId: string;
}

export interface WidgetPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface WidgetConfig {
    chartType?: string;
    dataSource?: string;
    // Chart-specific options
    [key: string]: unknown;
}

// Workspace
export interface Workspace {
    id: string;
    name: string;
    icon?: string | null;
    pages: Page[];
    createdAt: Date;
    updatedAt: Date;
}
