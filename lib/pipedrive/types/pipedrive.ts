export interface PipedriveClient {
  apiToken: string;
  baseUrl: string;
}

export const READ_ONLY_TOOLS = [
  'get_deals',
  'get_deal',
  'search_deals',
  'get_persons',
  'get_person',
  'search_persons',
  'get_organizations',
  'get_organization',
  'search_organizations',
  'get_leads',
  'get_lead',
  'get_activities',
  'get_activity',
  'get_notes',
  'get_note',
  'get_pipelines',
  'get_pipeline',
  'get_stages',
  'get_stage',
  'search_items',
];

export interface PipedriveResponse<T = any> {
  success: boolean;
  data: T;
  additional_data?: {
    pagination?: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
    };
  };
}