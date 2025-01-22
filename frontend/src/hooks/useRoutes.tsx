import { useEffect, useState } from 'react';

interface Line {
    route_id: string;
    route_short_name: string;
}

const useRoutes = () => {
    const [routes, setRoutes] = useState<Line[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/routes')
            .then(response => {                              
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {                
                setRoutes(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return { routes, loading, error };
};

export default useRoutes;
