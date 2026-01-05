# Vibenance

A modern personal finance management application built with a focus on transaction tracking, asset management, and intelligent financial insights. Vibenance helps you take control of your finances by providing comprehensive tools for managing bank accounts, tracking transactions, monitoring assets, and getting AI-powered financial advice.

> [!WARNING]
> This is a personal project under active development. While I strive to maintain stability, breaking changes may occur as the project evolves. Please use at your own discretion.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Frontend**: React 19, TanStack Router, TanStack Query, Vite, Tailwind CSS, ShadCn UI
- **Backend**: Hono, ORPC
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [Better Auth](https://www.better-auth.com)
- **Monorepo**: Turborepo
- **Language**: TypeScript
- **Linting/Formatting**: Biome

## Application Features

- **Dashboard** - Comprehensive overview of your financial health
- **Transaction Management** - Import, view, and categorize transactions from multiple bank accounts
- **Bank Account Integration** - Manage multiple bank accounts with support for various account types (savings, checking, credit cards, investments, loans)
- **File Import** - Custom CSV and PDF parsers for various banks
- **Asset Tracking** - Monitor and track your financial assets
- **Finance Agent** - AI-powered financial assistant for insights and recommendations
- **Spending Analytics** - Visualize spending trends and category breakdowns with interactive charts
- **Telegram Bot** - Import transactions and interact with your finances via Telegram

## Roadmap

- [x] Transaction management
- [x] Asset management
- [x] Finance assistant
- [x] Budget Management
- [ ] Financial Goals
- [ ] Reports and Analytics
- [ ] Tax Management
- [ ] Agentic finance assistant

## Prerequisites

- [Bun](https://bun.sh) (v1.2.20 or higher)
- PostgreSQL 18+ (or use Docker Compose)
- Docker and Docker Compose (optional, for containerized setup)

## Getting Started

### Install Dependencies

```bash
bun install
```

## Setup

### Local Development

This project uses PostgreSQL with Drizzle ORM and is structured as a monorepo with the following structure:

```
vibenance/
├── apps/
│   ├── server/     # Hono backend server
│   └── web/         # React frontend application
└── packages/
    ├── api/         # API routers and services
    ├── auth/        # Authentication configuration
    ├── db/          # Database schema and migrations
    └── parser/      # Bank statement parsers
```

1. **Set up PostgreSQL database**

   Make sure you have PostgreSQL installed and running, or use the provided Docker Compose setup:

   ```bash
   bun run db:start
   ```

2. **Configure environment variables**

   Create a `.env` file in `apps/server/` with the following variables:

   ```env
   # Database
   DATABASE_URL=postgresql://postgres:password@localhost:5432/vibenance

   # Server Configuration
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3001
   VITE_DEV_URL=http://localhost:3001
   STATIC_PATH=../web/dist

   # Authentication (required)
   BETTER_AUTH_SECRET=your-secret-key-here

   # Telegram Bot (optional)
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   ```

   > **Note**: Generate a secure random string for `BETTER_AUTH_SECRET`. You can use `openssl rand -base64 32` or any secure random string generator.

3. **Apply database schema**

   ```bash
   bun run db:push
   ```

4. **Start the development servers**

   ```bash
   bun run dev
   ```

   This will start:
   - Backend server on `http://localhost:3000`
   - Frontend development server on `http://localhost:3001`

   You can also run them separately:

   ```bash
   bun run dev:server  # Backend only
   bun run dev:web     # Frontend only
   ```

5. **Access the application**

   Open your browser and navigate to `http://localhost:3001`

### Docker Setup

1. **Create environment file**

   Create a `.env` file in the project root (or set environment variables):

   ```env
   POSTGRES_PASSWORD=your-secure-password
   CORS_ORIGIN=http://localhost:3000
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   BETTER_AUTH_SECRET=your-secret-key-here
   ```

2. **Start services**

   ```bash
   docker compose up -d
   ```

   This will start:
   - PostgreSQL database on port `5432`
   - Application server on port `3000`

3. **Access the application**

   Open your browser and navigate to `http://localhost:3000`

4. **Stop services**

   ```bash
   docker compose down
   ```

## Available Scripts

- `bun run dev` - Start all development servers
- `bun run build` - Build all packages and apps
- `bun run check` - Run Biome linter and formatter
- `bun run db:push` - Push database schema changes
- `bun run db:studio` - Open Drizzle Studio (database GUI)
- `bun run db:seed` - Seed the database with sample data
- `bun run db:reset` - Reset the database (⚠️ destructive)
- `bun run db:start` - Start PostgreSQL using Docker Compose
- `bun run db:stop` - Stop PostgreSQL container
