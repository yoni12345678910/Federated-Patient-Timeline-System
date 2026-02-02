import axios from 'axios';
import { TimelineResponse } from '../types/timeline';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const fetchTimeline = async (
  patientId: number,
  from?: string,
  to?: string,
  types?: string[],
  role: string = 'doctor'
): Promise<TimelineResponse> => {
  const params: any = { patientId };
  
  // Always include all filters if they have values
  if (from && from.trim() !== '') {
    params.from = from;
  }
  if (to && to.trim() !== '') {
    params.to = to;
  }
  if (types && types.length > 0) {
    params.types = types.join(',');
  }

  console.log('API Request:', {
    url: '/timeline',
    params,
    headers: { 'X-User-Role': role },
  });

  const response = await api.get<TimelineResponse>('/timeline', {
    params,
    headers: {
      'X-User-Role': role,
    },
  });

  return response.data;
};
