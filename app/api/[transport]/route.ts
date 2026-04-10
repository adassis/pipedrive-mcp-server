import { createMcpHandler } from 'mcp-handler';
import { getDealsTools } from '@/lib/pipedrive/tools/deals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Timing-safe comparison of two strings
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Optional shared-secret authentication
 */
function authorize(request: Request): Response | null {
  const expected = process.env.MCP_AUTH_TOKEN;
  if (!expected) return null; // auth disabled

  const header = request.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const provided = match?.[1]?.trim();

  if (!provided || !safeEqual(provided, expected)) {
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32001, message: 'Unauthorized' },
        id: null,
      }),
      {
        status: 401,
        headers: {
          'content-type': 'application/json',
          'www-authenticate': 'Bearer realm="pipedrive-mcp"',
        },
      },
    );
  }
  return null;
}

const mcpHandler = createMcpHandler(
  (server) => {
    const apiToken = process.env.PIPEDRIVE_API_TOKEN;
    if (!apiToken) {
      throw new Error('PIPEDRIVE_API_TOKEN environment variable is required');
    }

    const readOnly = process.env.PIPEDRIVE_READ_ONLY === 'true';
    const tools = getDealsTools(apiToken);

    for (const tool of tools) {
      if (readOnly && !tool.name.startsWith('get_') && !tool.name.startsWith('search_')) {
        continue;
      }

      // Use server.tool() instead of server.registerTool()
      // Pass .shape directly from Zod schema
      server.tool(
        tool.name,
        tool.description,
        tool.inputSchema.shape,
        async (args: unknown) => tool.execute(args),
      );
    }
  },
  {
    serverInfo: {
      name: 'pipedrive-mcp-server',
      version: '1.0.0',
    },
    capabilities: {
      tools: {},
    },
  },
  {
    basePath: '/api',
    verboseLogs: true,
  },
);

async function handler(request: Request): Promise<Response> {
  const denied = authorize(request);
  if (denied) return denied;
  return mcpHandler(request);
}

export { handler as GET, handler as POST, handler as DELETE };