# Volta

**Transform ideas into websites**

Volta is an AI-powered website builder that generates production-ready code from natural language descriptions. Using Claude AI, Volta allows designers and developers to create beautiful, functional websites in seconds.

## Features

- 🎨 **Design to Code**: Describe your vision, get production-ready code
- ⚡ **Powered by Claude AI**: Uses Claude API for intelligent code generation
- 🎯 **Multiple Export Formats**: React, Tailwind CSS, or vanilla HTML
- 🔒 **Secure**: API keys stored server-side for safety
- 🚀 **Production Ready**: Clean, optimized, deployable code

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **API**: Anthropic Claude API
- **Deployment**: Vercel

## Project Structure

```
volta/
├── frontend/          # React application
├── backend/           # Express API server
├── vercel.json        # Deployment configuration
└── package.json       # Monorepo root configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Add your Anthropic API key to `.env.local`

4. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start both frontend and backend:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Building

```bash
npm run build
```

### Linting and Formatting

```bash
npm run lint
npm run format
```

## Deployment

This project is configured for deployment to Vercel:

1. Push to GitHub
2. Connect GitHub repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `CLAUDE_MODEL` (default: claude-opus-4-6)

Vercel will automatically build and deploy on push to the main branch.

## License

MIT
