import React from 'react';
import { useNavigate } from 'react-router-dom';
import useRoutes from '../hooks/useRoutes';
import Loader from './Loader';
interface Route {
    [key: string]: string;
}

interface Routes {
    [category: string]: Route[];
}

const Lines: React.FC = () => {
    const { routes, loading, error } = useRoutes();
    const navigate = useNavigate();

    if (loading) {
        return <Loader />;
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
                        const isNightLine = (String(lineNumber).startsWith('6') || String(lineNumber).startsWith('9')) && String(lineNumber).length > 1;
                        const isSubstituteLine = String(lineNumber).startsWith('7') && String(lineNumber).length > 1;

                        return (
                            <div
                                key={lineNumber}
                                className={`flex justify-center items-center text-center text-md font-semibold border transition-all cursor-pointer ${
                                    isNightLine
                                        ? 'bg-black text-white border-black'
                                        : isSubstituteLine
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'bg-white text-black border-gray-900 hover:bg-gray-100'
                                }`}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                }}
                                onClick={() =>
                                    navigate(`/lines/${lineNumber}`)
                                }
                            >
                                {lineNumber}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="pb-10 container mx-auto px-32">
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
