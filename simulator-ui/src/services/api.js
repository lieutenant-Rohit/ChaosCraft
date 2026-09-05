const API_BASE = '/api';

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    let message = response.statusText;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || text;
    } catch {
      message = text || response.statusText;
    }
    throw new Error(message);
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  getDashboard: () => request('/dashboard'),

  getExperiments: () => request('/experiments'),
  getExperiment: (id) => request(`/experiments/${id}`),
  createExperiment: (data) => request('/experiments', { method: 'POST', body: JSON.stringify(data) }),
  startExperiment: (id) => request(`/experiments/${id}/start`, { method: 'POST' }),
  stopExperiment: (id) => request(`/experiments/${id}/stop`, { method: 'POST' }),
  getExperimentEvents: (id) => request(`/experiments/${id}/events`),

  injectFailure: (data) => request('/failures/inject', { method: 'POST', body: JSON.stringify(data) }),
  removeFailure: (service, type) => request(`/failures/${encodeURIComponent(service)}/${encodeURIComponent(type)}`, { method: 'DELETE' }),
  removeAllFailures: (service) => request(`/failures/${encodeURIComponent(service)}`, { method: 'DELETE' }),
  getActiveFailures: () => request('/failures/active'),

  startTraffic: (data) => request('/traffic/start', { method: 'POST', body: JSON.stringify(data) }),
  stopTraffic: () => request('/traffic/stop', { method: 'POST' }),
  getTrafficStats: () => request('/traffic/stats'),

  getIncidents: () => request('/incidents'),
  getIncident: (id) => request(`/incidents/${id}`),
  getIncidentsByExperiment: (experimentId) => request(`/incidents/experiment/${experimentId}`),
};
