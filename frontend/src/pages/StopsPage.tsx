import { useState } from "react";
import { useFetch } from "../hooks/useFetch"; 
import Loader from "../components/Loader";

export default function StopsList() {
    const [search, setSearch] = useState("");

    const { data: stops, loading, error } = useFetch<string[]>("api/stops/list"); 

    const filteredStops = stops ? stops.filter(stop =>
        stop.toLowerCase().includes(search.toLowerCase())
    ) : [];

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div>Wystąpił błąd: {error}</div>;
    }

    return (
        <div className="py-10 container mx-auto ps-8 md:ps-32 h-[92vh] mt-1">
            <h1 className="text-4xl font-semibold mb-4 ">Przystanki</h1>
            <input
                type="text"
                placeholder="Wyszukaj przystanek..."
                value={search}
                onChange={(e) => setSearch(e.target.value)} 
                className="border p-2 mb-4 w-1/2"
            />
            
            <ul className="list-disc pl-5 space-y-1">
                {filteredStops.map((stop, index) => (
                    <li key={index}>
                        <a href={`stop/${encodeURIComponent(stop)}`} className="text-blue-600 hover:underline">
                            {stop}
                        </a> 
                    </li>
                ))}
            </ul>
        </div>
    );
    
    
}
