import { useEffect, useState } from 'react';

interface Route {
    [key: string]: string; 
}

interface Routes {
    [category: string]: Route[]; 
}

const useRoutes = () => {
    const [routes, setRoutes] = useState<Routes>({}); 
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/routes')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                const formattedRoutes: Routes = {};

                Object.keys(data).forEach((category) => {
                    formattedRoutes[category] = data[category];
                });

                setRoutes(formattedRoutes);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return { routes, loading, error };
};

export default useRoutes;
