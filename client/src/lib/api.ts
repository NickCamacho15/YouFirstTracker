// API configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're running in a Capacitor app
  if (window.location.protocol === 'capacitor:') {
    // Mobile app - use your local IP address
    return 'http://192.168.1.190:3000';
  }
  // Web browser - use relative paths
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function for making API requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // For mobile environments, add the stored user data as a header if available
  if (window.location.protocol === 'capacitor:') {
    const userData = localStorage.getItem('user_data');
    if (userData && (!options.headers || !(options.headers as any)['X-User-Data'])) {
      options.headers = {
        ...options.headers,
        'X-User-Data': userData
      };
    }
  }
  
  // Always include credentials
  options.credentials = 'include';
  
  try {
    const response = await fetch(url, options);
    
    // Check for and store X-User-Data header in the response
    const userDataHeader = response.headers.get('X-User-Data');
    if (userDataHeader) {
      localStorage.setItem('user_data', userDataHeader);
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}; 