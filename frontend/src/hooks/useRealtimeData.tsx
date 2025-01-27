import { useEffect, useState } from 'react';

const useRealtimeData = () => {
  const [realtimeData, setRealtimeData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/realtime/vehicles`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log("Świerze dane jak bułeczki", data);
        
        setRealtimeData(data)
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
  }, []); 
  return { realtimeData, loading, error };
};

export default useRealtimeData;
