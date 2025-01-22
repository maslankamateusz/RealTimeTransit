import React from 'react';
import useRoutes from '../hooks/useRoutes';

interface Route {
    [key: string]: string;
}

interface Routes {
    [category: string]: Route[];
}

const Lines: React.FC = () => {
    const { routes, loading, error } = useRoutes();

    if (loading) {
        return <div className="text-center p-4">Loading...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }

    const renderSection = (title: string, lines: Route[]) => {
        if (lines.length === 0) return null;

        return (
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 border-b border-gray-300 pb-2">{title}</h2>
                <div
                    className="grid gap-2"
                    style={{
                        gridTemplateColumns: 'repeat(auto-fill, 36px)',
                        justifyContent: 'center',
                    }}
                >
                    {lines.map((line) => {
                        const lineNumber = Object.keys(line)[0];
                        return (
                            <div
                                key={lineNumber}
                                className="flex justify-center items-center bg-white hover:bg-gray-100 text-center text-md font-semibold text-black border border-gray-900 transition-all"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                }}
                            >
                                <a href={`/ttss/linie/${lineNumber}`} className="w-full h-full flex justify-center items-center">
                                    {lineNumber}
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    return (
        <div className="pb-10 container mx-auto px-4">
            <h1 className="text-5xl font-medium my-8">Linie</h1>
            {Object.keys(routes).map((category) => {
                const categoryKey = category as keyof Routes;
                return (
                    <div key={`category-${category}`}>
                        {renderSection(category, routes[categoryKey])}
                    </div>
                );
            })}
        </div>
    );
    
};

export default Lines;
