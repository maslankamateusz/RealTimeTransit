import { useEffect, useState } from 'react';

const useStopListWithLocationData = () => {
  const [stopData, setStopData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStopData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/stops/list/location`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        
        setStopData(data)
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

    fetchStopData();
  }, []); 
  return { stopData, loading, error };
};

export default useStopListWithLocationData;
