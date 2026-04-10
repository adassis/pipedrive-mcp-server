import { createMcpHandler } from 'mcp-handler';
import { getDealsTools } from '@/lib/pipedrive/tools/deals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const mcpHandler = createMcpHandler((server) => {
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

    server.registerTool(
      tool.name,
      {
        title: tool.description,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      tool.execute
    );
  }
});

export { mcpHandler as GET, mcpHandler as POST };