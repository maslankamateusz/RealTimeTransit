import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface ServiceDay {
  service_id: string;
  days: string[];
}

const useServiceData = (routeName: string) => {
  const [serviceData, setServiceData] = useState<ServiceDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/service?route_number=${routeName}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data: ServiceDay[] = await response.json();
        setServiceData(data);
    
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

    fetchServiceData();
  }, [routeName]); 

  return { serviceData, loading, error };
};

export default useServiceData;
