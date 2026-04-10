import { createPipedriveClient, pipedriveRequest } from '../utils/auth';
import { rateLimiter } from '../utils/rate-limiter';
import { PipedriveResponse } from '../types/pipedrive';
import { z } from 'zod';

export function getDealsTools(apiToken: string) {
  const client = createPipedriveClient(apiToken);

  return [
    {
      name: 'get_deals',
      description: 'List all deals with optional filtering and sorting',
      inputSchema: z.object({
        limit: z.number().int().min(1).max(500).default(100).optional().describe('Number of deals to return'),
        start: z.number().int().min(0).default(0).optional().describe('Pagination start'),
        sort: z.string().optional().describe('Field to sort by (e.g., "add_time DESC")'),
        status: z.enum(['open', 'won', 'lost', 'deleted', 'all_not_deleted']).default('all_not_deleted').optional(),
      }),
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
              type: 'text' as const,
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },

    {
      name: 'get_deal',
      description: 'Get details of a specific deal by ID',
      inputSchema: z.object({
        id: z.number().int().describe('Deal ID'),
      }),
      execute: async (input: any) => {
        await rateLimiter.acquire();
        
        const response = await pipedriveRequest<PipedriveResponse>(
          client,
          `/deals/${input.id}`
        );

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },

    {
      name: 'create_deal',
      description: 'Create a new deal',
      inputSchema: z.object({
        title: z.string().describe('Deal title'),
        value: z.number().optional().describe('Deal value'),
        currency: z.string().default('EUR').optional().describe('Currency code (e.g., EUR, USD)'),
        person_id: z.number().optional().describe('Associated person ID'),
        org_id: z.number().optional().describe('Associated organization ID'),
        stage_id: z.number().optional().describe('Pipeline stage ID'),
      }),
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
              type: 'text' as const,
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },

    {
      name: 'update_deal',
      description: 'Update an existing deal',
      inputSchema: z.object({
        id: z.number().int().describe('Deal ID'),
        title: z.string().optional(),
        value: z.number().optional(),
        status: z.enum(['open', 'won', 'lost']).optional(),
        stage_id: z.number().optional(),
      }),
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
              type: 'text' as const,
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },

    {
      name: 'search_deals',
      description: 'Search deals by term',
      inputSchema: z.object({
        term: z.string().describe('Search term'),
        limit: z.number().int().default(100).optional(),
      }),
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
              type: 'text' as const,
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },
  ];
}