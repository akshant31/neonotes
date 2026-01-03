# NeoNotes 📝

A powerful, locally-deployed notes system inspired by Notion, with enhanced visualization capabilities and a multi-database architecture.

![NeoNotes](https://via.placeholder.com/800x400?text=NeoNotes+Dashboard)

## ✨ Features

- **📝 Block-based Editor** - Notion-like editing experience with TipTap
- **🔍 Full-text Search** - Powered by Elasticsearch
- **📊 Rich Visualizations** - Charts, dashboards, and stats with Apache ECharts
- **🕸️ Knowledge Graph** - Visualize connections between notes (Neo4j)
- **📋 Inline Databases** - Create tables with filters, sorts, and multiple views
- **🌙 Dark Mode** - Beautiful dark theme by default
- **⌨️ Slash Commands** - Quick block insertion with `/` commands
- **🐳 Docker-based** - Easy deployment with Docker Compose

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 20+ (for local development outside Docker)

### Running with Docker

```bash
# Clone and navigate to the project
cd neonotes

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f web
```

The app will be available at:
- **Web App**: http://localhost:3000
- **Neo4j Browser**: http://localhost:7474
- **Elasticsearch**: http://localhost:9200

### Running Locally (Development)

```bash
# Navigate to the web app
cd apps/web

# Install dependencies (requires Node.js 20+)
npm install

# Start the databases (required)
docker-compose up -d postgres neo4j elasticsearch

# Run database migrations
npx prisma db push

# Start the development server
npm run dev
```

## 📁 Project Structure

```
neonotes/
├── docker-compose.yml          # All services orchestration
├── .env                        # Environment variables
│
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/            # Next.js App Router pages
│       │   ├── components/     # React components
│       │   │   ├── editor/     # TipTap editor components
│       │   │   ├── layout/     # Sidebar, search modal
│       │   │   └── visualization/ # Charts, dashboards
│       │   ├── lib/            # Utilities
│       │   ├── stores/         # Zustand stores
│       │   └── types/          # TypeScript definitions
│       └── prisma/             # Database schema
│
└── docker/
    ├── postgres/               # PostgreSQL config
    ├── neo4j/                  # Neo4j config
    └── elasticsearch/          # Elasticsearch config
```

## 🗄️ Database Architecture

| Database | Purpose |
|----------|---------|
| **PostgreSQL** | Core data: pages, blocks, databases, dashboards |
| **Neo4j** | Knowledge graph: page relationships, backlinks |
| **Elasticsearch** | Full-text search with fuzzy matching |

## 🎨 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Editor**: TipTap (ProseMirror-based)
- **Charts**: Apache ECharts
- **State**: Zustand
- **API**: tRPC (planned)
- **ORM**: Prisma

## 🛠️ Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://neonotes:neonotes_dev_password@localhost:5432/neonotes
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neonotes_dev_password
ELASTICSEARCH_URL=http://localhost:9200
```

## 📝 Block Types

- **Text** - Paragraph, headings (H1-H3)
- **Lists** - Bullet, numbered, task lists
- **Media** - Images, code blocks, quotes
- **Advanced** - Tables, inline databases, dividers

## 📊 Chart Types

- Line/Area charts
- Bar/Column charts
- Pie/Donut charts
- Gauge charts
- Radar charts
- Heatmaps
- Scatter plots
- Treemaps

## 🗺️ Roadmap

- [ ] API integration with tRPC
- [ ] Knowledge graph visualization
- [ ] Kanban board view
- [ ] Calendar view
- [ ] Export to Markdown/PDF
- [ ] Desktop app (Tauri)
- [ ] Real-time collaboration

## 📄 License

MIT License - feel free to use for personal and commercial projects.
