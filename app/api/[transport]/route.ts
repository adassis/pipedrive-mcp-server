import { NextRequest, NextResponse } from 'next/server';
import { createMcpHandler } from 'mcp-handler';
import { getDealsTools } from '@/lib/pipedrive/tools/deals';

function authorize(req: NextRequest): boolean {
  const token = process.env.MCP_AUTH_TOKEN;
  if (!token) return true;

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const providedToken = authHeader.slice(7);
  
  if (providedToken.length !== token.length) return false;
  
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ providedToken.charCodeAt(i);
  }
  
  return mismatch === 0;
}

const handler = createMcpHandler((server) => {
  const apiToken = process.env.PIPEDRIVE_API_TOKEN;
  if (!apiToken) {
    throw new Error('PIPEDRIVE_API_TOKEN environment variable is required');
  }

  const readOnly = process.env.PIPEDRIVE_READ_ONLY === 'true';
  const tools = getDealsTools(apiToken);

  tools.forEach((tool) => {
    if (readOnly && !tool.name.startsWith('get_') && !tool.name.startsWith('search_')) {
      return;
    }
    
    server.registerTool(
      tool.name,
      {
        title: tool.description,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      tool.execute
    );
  });
});

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message: 'Unauthorized',
        },
        id: null,
      },
      { status: 401 }
    );
  }

  return handler(req);
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return handler(req);
}