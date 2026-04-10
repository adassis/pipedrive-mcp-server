import { createMcpHandler } from 'mcp-handler';
import { getDealsTools } from '@/lib/pipedrive/tools/deals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

      // Use server.tool() with .shape like aircall
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
  return mcpHandler(request);
}

export { handler as GET, handler as POST, handler as DELETE };