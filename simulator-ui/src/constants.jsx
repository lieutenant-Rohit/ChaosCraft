export const FAILURE_TYPES = [
  { value: 'LATENCY', label: 'Latency', description: 'Add delay to responses', defaultParams: 'latencyMs:3000', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )},
  { value: 'ERROR', label: 'Error Injection', description: 'Return random errors', defaultParams: 'errorRate:100', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  )},
  { value: 'SERVICE_KILL', label: 'Service Kill', description: 'Shut down the service', defaultParams: '', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
      <line x1="12" y1="2" x2="12" y2="12"/>
    </svg>
  )},
  { value: 'CIRCUIT_BREAKER_TRIP', label: 'Circuit Breaker', description: 'Simulate circuit breaker', defaultParams: '', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  )},
  { value: 'CONNECTION_POOL_EXHAUSTION', label: 'Connection Exhaustion', description: 'Starve DB connections', defaultParams: 'maxConnections:0', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  )},
];

export const SERVICES = ['demo-app', 'payment-service', 'inventory-service'];

export const SEVERITY_COLORS = {
  CRITICAL: { bg: 'bg-red-500/[0.08]', text: 'text-red-400', border: 'border-red-500/[0.08]' },
  HIGH: { bg: 'bg-amber-500/[0.08]', text: 'text-amber-400', border: 'border-amber-500/[0.08]' },
  MEDIUM: { bg: 'bg-white/[0.04]', text: 'text-white/40', border: 'border-white/[0.04]' },
};
