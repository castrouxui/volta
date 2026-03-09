import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Generate website endpoint
app.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const message = await client.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are an expert web developer. Generate clean, production-ready HTML/CSS code for the following website description:\n\n${prompt}\n\nProvide only the code without any explanations or markdown formatting.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      res.status(500).json({ error: 'Unexpected response format' });
      return;
    }

    res.json({ code: content.text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
