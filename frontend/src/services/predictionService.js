// API Service for FastAPI Placement Predictor Backend

const API_ENDPOINTS = [
  import.meta.env.VITE_API_URL,
  'http://127.0.0.1:8000/api',
  '/api',
  'http://localhost:8000/api'
].filter(Boolean);

function buildUrl(baseUrl, endpointPath) {
  let base = baseUrl.trim();
  
  // Auto-heal missing colon typos (e.g. https// -> https://)
  if (base.startsWith('https//')) {
    base = base.replace(/^https\/\//i, 'https://');
  } else if (base.startsWith('http//')) {
    base = base.replace(/^http\/\//i, 'http://');
  }
  
  // Clean duplicate protocol prefixes like https://https://
  base = base.replace(/^(https?:\/\/)+/i, 'https://');

  if (base.endsWith('/')) base = base.slice(0, -1);
  
  // If base doesn't end with /api, append /api
  if (!base.toLowerCase().endsWith('/api')) {
    base = `${base}/api`;
  }
  
  const cleanEndpoint = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  return `${base}${cleanEndpoint}`;
}

async function fetchWithFallback(endpointPath, options = {}) {
  let lastError = null;
  
  for (const baseUrl of API_ENDPOINTS) {
    try {
      const url = buildUrl(baseUrl, endpointPath);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for cloud cold starts

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
