import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Startup {
  id: number;
  name: string;
  description: string;
  website: string;
  founding_date: string;
  location: string;
  industry: string;
  tech_stack: string[];
  funding_history: Record<string, number>;
  team_size: number;
  founders: Founder[];
}

export interface Founder {
  id?: number;
  name: string;
  role: string;
  linkedin_url?: string;
  background?: string;
}

export interface StartupAnalysis {
  id: number;
  startup_id: number;
  market_score: number;
  team_score: number;
  tech_score: number;
  traction_score: number;
  overall_score: number;
  analysis_date: string;
  insights: Record<string, string>;
  risk_factors: string[];
}

export const startupApi = {
  // Get all startups
  getStartups: () => api.get<Startup[]>('/startups/'),

  // Get a single startup
  getStartup: (id: number) => api.get<Startup>(`/startups/${id}`),

  // Create a new startup
  createStartup: (startup: Omit<Startup, 'id'>) => 
    api.post<Startup>('/startups/', startup),

  // Get startup analysis
  getStartupAnalysis: (id: number) => 
    api.get<StartupAnalysis>(`/startups/${id}/analysis`),
};
