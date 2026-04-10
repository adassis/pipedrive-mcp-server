import { Tool } from 'mcp-handler';
import { createPipedriveClient, pipedriveRequest } from '../utils/auth';
import { rateLimiter } from '../utils/rate-limiter';
import { PipedriveResponse } from '../types/pipedrive';

export function getDealsTools(apiToken: string): Tool[] {
  const client = createPipedriveClient(apiToken);

  return [
    {
      name: 'get_deals',
      description: 'List all deals with optional filtering and sorting',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Number of deals to return (max 500)',
            default: 100,
          },
          start: {
            type: 'number',
            description: 'Pagination start',
            default: 0,
          },
          sort: {
            type: 'string',
            description: 'Field to sort by (e.g., "add_time DESC")',
          },
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
            description: 'Deal status filter',
            default: 'all_not_deleted',
          },
        },
      },
      execute: async (input: any) => {
        await rateLimiter.acquire();
        
        const params = new URLSearchParams();
        if (input.limit) params.set('limit', input.limit.toString());
        if (input.start) params.set('start', input.start.toString());
        if (input.sort) params.set('sort', input.sort);
        if (input.status) params.set('status', input.status);

        const response = await pipedriveRequest<PipedriveResponse>(
          client,
          `/deals?${params.toString()}`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },

    {
      name: 'get_deal',
      description: 'Get details of a specific deal by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Deal ID',
          },
        },
        required: ['id'],
      },
      execute: async (input: any) => {
        await rateLimiter.acquire();
        
        const response = await pipedriveRequest<PipedriveResponse>(
          client,
          `/deals/${input.id}`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },

    {
      name: 'create_deal',
      description: 'Create a new deal',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Deal title',
          },
          value: {
            type: 'number',
            description: 'Deal value',
          },
          currency: {
            type: 'string',
            description: 'Currency code (e.g., EUR, USD)',
            default: 'EUR',
          },
          person_id: {
            type: 'number',
            description: 'Associated person ID',
          },
          org_id: {
            type: 'number',
            description: 'Associated organization ID',
          },
          stage_id: {
            type: 'number',
            description: 'Pipeline stage ID',
          },
        },
        required: ['title'],
      },
      execute: async (input: any) => {
        await rateLimiter.acquire();
        
        const response = await pipedriveRequest<PipedriveResponse>(
          client,
          '/deals',
          {
            method: 'POST',
            body: JSON.stringify(input),
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },

    {
      name: 'update_deal',
      description: 'Update an existing deal',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Deal ID',
          },
          title: { type: 'string' },
          value: { type: 'number' },
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost'],
          },
          stage_id: { type: 'number' },
        },
        required: ['id'],
      },
      execute: async (input: any) => {
        await rateLimiter.acquire();
        
        const { id, ...data } = input;
        
        const response = await pipedriveRequest<PipedriveResponse>(
          client,
          `/deals/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },

    {
      name: 'search_deals',
      description: 'Search deals by term',
      inputSchema: {
        type: 'object',
        properties: {
          term: {
            type: 'string',
            description: 'Search term',
          },
          limit: {
            type: 'number',
            default: 100,
          },
        },
        required: ['term'],
      },
      execute: async (input: any) => {
        await rateLimiter.acquire();
        
        const params = new URLSearchParams({
          term: input.term,
          item_types: 'deal',
          limit: input.limit?.toString() || '100',
        });

        const response = await pipedriveRequest<PipedriveResponse>(
          client,
          `/itemSearch?${params.toString()}`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },
  ];
}