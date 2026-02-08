import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const CACHE_TIMES = {
  carousel: 10 * 60 * 1000,      
  sponsors: 15 * 60 * 1000,      
  testimonials: 15 * 60 * 1000,  
  
  artists: 5 * 60 * 1000,        
  packages: 5 * 60 * 1000,       
  
  events: 2 * 60 * 1000,         
  
  availability: 30 * 1000,       
};

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1 * 60 * 1000, 
    
    gcTime: 5 * 60 * 1000, 
    
    retry: 1, 
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    
    refetchOnWindowFocus: false, 
    refetchOnReconnect: true,    
    refetchOnMount: false,  
    
    networkMode: 'online',
  },
  mutations: {
    retry: 1,
    networkMode: 'online',
  },
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return createQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient();
    }
    return browserQueryClient;
  }
}

export { CACHE_TIMES };
