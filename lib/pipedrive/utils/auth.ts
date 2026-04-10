import { PipedriveClient } from '../types/pipedrive';

export function createPipedriveClient(apiToken: string): PipedriveClient {
  return {
    apiToken,
    baseUrl: 'https://api.pipedrive.com/v1',
  };
}

export async function pipedriveRequest<T = any>(
  client: PipedriveClient,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = new URL(endpoint, client.baseUrl);
  url.searchParams.set('api_token', client.apiToken);

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pipedrive API error: ${response.status} - ${error}`);
  }

  return response.json();
}