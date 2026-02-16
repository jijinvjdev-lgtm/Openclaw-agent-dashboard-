# Dropshipping Agent Dashboard

Real-time monitoring dashboard for multi-agent dropshipping system.

## Quick Start

```bash
# Install dependencies
cd dropshipping-dashboard
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open http://localhost:3000

## Project Structure

```
dropshipping-dashboard/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agents/         # Agent CRUD
│   │   │   ├── tasks/          # Task management
│   │   │   ├── communications/ # Agent messaging
│   │   │   ├── model-usage/    # Model analytics
│   │   │   ├── workflows/      # Product workflows
│   │   │   └── stats/          # Dashboard stats
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── components/
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Sidebar.tsx         # Navigation
│   │   ├── StatsBar.tsx        # Top stats
│   │   ├── AgentGrid.tsx       # Agent overview
│   │   ├── AgentProfile.tsx    # Agent details
│   │   ├── TaskFlow.tsx        # Workflow visualization
│   │   ├── CommunicationMonitor.tsx
│   │   ├── ModelAnalytics.tsx
│   │   ├── StoragePanel.tsx
│   │   └── SystemHealth.tsx
│   ├── lib/
│   │   ├── db.ts               # Prisma client
│   │   ├── socket.ts           # WebSocket handler
│   │   └── store.ts            # Zustand state
│   └── types/
│       └── index.ts             # TypeScript types
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Features

- **Agent Overview** - Grid view of all 10 agents with status, tasks, tokens
- **Agent Profile** - Detailed view with system prompt editing, restart, disable
- **Task Flow** - Visual workflow diagram (React Flow) showing product pipeline
- **Communication Monitor** - Real-time agent-to-agent messaging
- **Model Analytics** - Charts for token usage, fallback rates, latency
- **Storage Panel** - Per-agent workspace storage management
- **System Health** - Gateway, API, database status

## WebSocket Events

```typescript
// Server → Client
'agent:update'     // Agent status changed
'task:update'      // Task progress
'communication:new' // New message
'model:usage'      // Model call logged
'system:health'   // Health check result
'workflow:update' // Pipeline stage change
```

## API Endpoints

| Method | Endpoint |----------|-------------|
| GET | /api/agents | Description |
|--------| List all agents |
| GET | /api/agents/[id] | Get agent details |
| PATCH | /api/agents/[id] | Update agent |
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create task |
| GET | /api/communications | List messages |
| POST | /api/communications | Send message |
| GET | /api/model-usage | Get usage stats |
| POST | /api/model-usage | Log usage |
| GET | /api/workflows | List workflows |
| GET | /api/stats | Dashboard stats |
| GET | /api/health | System health |

## Database Tables

- **agents** - Agent configurations & stats
- **tasks** - Task execution records
- **communications** - Inter-agent messages
- **model_usage** - Token consumption logs
- **memory_logs** - Agent memory entries
- **product_workflows** - Product pipeline state
- **system_health** - Health check history

## Tech Stack

- Next.js 14 (App Router)
- Prisma + SQLite
- Socket.io (WebSocket)
- Recharts (analytics)
- React Flow (workflow viz)
- TailwindCSS
- Zustand (state)

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Or with custom port
PORT=3001 npm start
```
