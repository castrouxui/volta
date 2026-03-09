# Volta Backend

Express.js TypeScript server for Volta website builder. Handles Claude API integration for code generation.

## Development

```bash
npm install
npm run dev
```

Server runs at `http://localhost:3001`

## Build

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for required environment variables.

- `ANTHROPIC_API_KEY`: Your Claude API key
- `CLAUDE_MODEL`: Model to use (default: claude-opus-4-6)
- `PORT`: Server port (default: 3001)

## API Endpoints

- `GET /health` - Health check
- `POST /generate` - Generate website code from prompt

## Linting

```bash
npm run lint
npm run format
```
