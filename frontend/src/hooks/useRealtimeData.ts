import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const useRealtimeData = () => {
  const [realtimeData, setRealtimeData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        setLoading(true); 
        const response = await fetch(`${API_URL}/api/realtime/vehicles`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setRealtimeData(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false); 
      }
    };

    fetchRealtimeData();

    const intervalId = setInterval(() => {
      fetchRealtimeData();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []); 

  return { realtimeData, loading, error };
};

export default useRealtimeData;
