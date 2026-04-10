import { NextRequest } from 'next/server';
import { createMcpHandler } from 'mcp-handler';
import { getDealsTools } from '@/lib/pipedrive/tools/deals';

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

export { handler as GET, handler as POST };