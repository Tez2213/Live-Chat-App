# Real-time Chat Application

A modern, feature-rich chat application built with a microservices architecture using Next.js, Socket.IO, and MongoDB.

## Project Overview

This is a monorepo-based chat application that consists of multiple applications:

- **Web App**: Front-end client application built with Next.js
- **Server**: Back-end WebSocket server using Socket.IO for real-time communication
- **Docs**: Documentation site for the project

## Features

- Real-time messaging using WebSockets
- User authentication and customizable usernames  
- Dark/Light theme toggle with persistent preferences
- Room-based chat functionality
- Message history storage in MongoDB
- Responsive UI for desktop and mobile devices

## Tech Stack

### Front-end
- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [React Icons](https://react-icons.github.io/react-icons/)

### Back-end
- [Node.js](https://nodejs.org/)
- [Socket.IO](https://socket.io/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)

### Development Tools
- [TypeScript](https://www.typescriptlang.org/)
- [Turbo](https://turbo.build/) for monorepo management
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io/) for code formatting

## Project Structure

```
├── apps/
│   ├── docs/          # Documentation site
│   ├── server/        # Backend Socket.IO server
│   └── web/           # Next.js frontend application
├── packages/
│   ├── eslint-config/ # Shared ESLint configurations
│   ├── typescript-config/ # Shared TypeScript configurations
│   └── ui/            # Shared UI components
└── turbo.json         # Turbo configuration
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- MongoDB (local installation or MongoDB Atlas)
- npm 11.1.0 or later

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Chat\ App
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Update with your MongoDB connection string and other configurations

4. Run the development server:
   ```bash
   npm run dev
   ```

This will start:
- Web client at http://localhost:3000
- Server at http://localhost:8000
- Documentation site at http://localhost:3001

## Usage

1. Open http://localhost:3000 in your browser
2. Enter a username to join the chat
3. Start sending and receiving real-time messages
4. Toggle between dark and light themes as needed

## Development

### Commands

- `npm run dev` - Start all applications in development mode
- `npm run build` - Build all applications
- `npm run lint` - Run linting for all applications
- `npm run check-types` - Check TypeScript types for all applications
- `npm run format` - Format code with Prettier

### Adding UI Components

The UI package includes a generator for creating new components:

```bash
cd packages/ui
npm run generate:component
```

## Deployment

The application is designed to be deployed to Vercel or any other platform that supports Next.js applications.

### Server Deployment

For the Socket.IO server:
1. Build the server: `npm run build --filter=server`
2. Deploy the `apps/server/dist` directory to your hosting provider
3. Set up environment variables as per `.env.example`

### Web App Deployment

For the Next.js web application:
1. Build the app: `npm run build --filter=web`
2. Deploy using Vercel or another Next.js-compatible hosting service

