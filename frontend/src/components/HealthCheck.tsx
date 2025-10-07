import React, { useEffect, useState } from 'react';
import { api } from '../apiClient';

export const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<string>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.health()
      .then(r => setStatus(r.data?.status || 'ok'))
      .catch(e => setError(e.message));
  }, []);

  if (error) return <div style={{ color: 'red' }}>Health error: {error}</div>;
  return <div>Backend health: <strong>{status}</strong></div>;
};
