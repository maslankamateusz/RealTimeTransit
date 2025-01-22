import React from 'react';
import useRoutes from '../hooks/useRoutes';

const Lines: React.FC = () => {
    const { routes, loading, error } = useRoutes();
    
    // console.log(routes);
    
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Lista Linii</h2>
            <ul>
                {routes.map(line => (
                    <li key={line.route_short_name}>
                        {line.route_short_name} - {line.route_id}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Lines;
