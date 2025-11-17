import React, { useEffect, useState } from 'react';
import { api } from '../apiClient';

interface Rank {
  _id: string;
  name: string;
  permissions: string[];
}

export const Register: React.FC = () => {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRanks = async () => {
    try {
      const response = await api.getAllRanks();
      if (response.data) {
        setRanks(response.data);
      }
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to fetch ranks:', err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanks();
  }, []);

  if (loading) {
    return <div>Loading ranks...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        <h2>Error Loading Ranks</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Register</h1>
      <h2>Available Ranks:</h2>
      {ranks.length === 0 ? (
        <p>No ranks available</p>
      ) : (
        <ul>
          {ranks.map((rank) => (
            <li key={rank._id}>
              <strong>{rank.name}</strong>
              <ul>
                {rank.permissions.map((permission, idx) => (
                  <li key={idx}>{permission}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
