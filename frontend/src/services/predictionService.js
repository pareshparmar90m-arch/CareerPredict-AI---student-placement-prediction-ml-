// API Service for FastAPI Placement Predictor Backend

const API_ENDPOINTS = [
  import.meta.env.VITE_API_URL,
  'http://127.0.0.1:8000/api',
  '/api',
  'http://localhost:8000/api'
].filter(Boolean);

async function fetchWithFallback(endpointPath, options = {}) {
  let lastError = null;
  
  for (const baseUrl of API_ENDPOINTS) {
    try {
      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const url = `${cleanBase}${endpointPath}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout per attempt

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }
      
      const errorData = await response.json().catch(() => ({}));
      lastError = new Error(errorData.detail || `Server returned status ${response.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  
  throw lastError || new Error('Unable to connect to placement prediction API across all endpoints.');
}

export async function predictStudentPlacement(formData) {
  try {
    const response = await fetchWithFallback('/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    return await response.json();
  } catch (error) {
    console.error('API Error in predictStudentPlacement:', error);
    throw new Error(
      error.message || 'Unable to connect to placement prediction API. Please ensure the FastAPI backend is running.'
    );
  }
}

export async function checkApiHealth() {
  try {
    const response = await fetchWithFallback('/health');
    return await response.json();
  } catch (error) {
    try {
      const fallbackResponse = await fetchWithFallback('/model-info');
      return await fallbackResponse.json();
    } catch (err) {
      console.error('API Error in checkApiHealth:', err);
      throw err;
    }
  }
}

export async function getModelMetadata() {
  try {
    const response = await fetchWithFallback('/model-info');
    const data = await response.json();
    return data.metadata;
  } catch (error) {
    console.error('API Error in getModelMetadata:', error);
    throw error;
  }
}

export async function getStatisticalAnalysis() {
  try {
    const response = await fetchWithFallback('/statistics');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error in getStatisticalAnalysis:', error);
    throw error;
  }
}

export async function getModelAnalytics() {
  try {
    const response = await fetchWithFallback('/analytics');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error in getModelAnalytics:', error);
    throw error;
  }
}
