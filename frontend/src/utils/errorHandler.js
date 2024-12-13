export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || 'An error occurred';
    const status = error.response.status;
    
    if (status === 404) {
      console.error('API endpoint not found:', error.response.config.url);
    }
    
    return {
      message,
      status
    };
  }
  
  if (error.request) {
    // Request made but no response
    return {
      message: 'Server not responding',
      status: 503
    };
  }
  
  // Something else went wrong
  return {
    message: error.message || 'An unexpected error occurred',
    status: 500
  };
}; 