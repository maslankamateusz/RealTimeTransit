import { useState, useEffect } from 'react';

const useLineDetails = (lineNumber: string, lineValue: string, service_id: string | null) => {
    const [lineDetails, setLineDetails] = useState<any>(null);
    const [serviceDetails, setServiceDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fetchedData, setFetchedData] = useState<any>(null); 
    const vehicle_type = lineNumber.length < 3 ? 'tram' : 'bus';

    const getTodayService = (blocks_data: any) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = new Date();
        const dayName = daysOfWeek[today.getDay()].toLowerCase();

        const matchingBlock = blocks_data.find((block: any) => block.service_days.includes(dayName));
        return matchingBlock ? matchingBlock.service_id : blocks_data[0]?.service_id;
    };

    const processServiceData = (blocks_data: any) => {
        const serviceDetails: Array<[string[], string]> = blocks_data.map((block: any) => [
            block['service_days'],
            block['service_id'],
        ]);

        const uniqueServiceDetails = Array.from(
            new Set(serviceDetails.map((item) => JSON.stringify(item)))
        ).map((item) => JSON.parse(item));

        const dayOrder: { [key: string]: number } = {
            monday: 0,
            tuesday: 1,
            wednesday: 2,
            thursday: 3,
            friday: 4,
            saturday: 5,
            sunday: 6,
        };

        const sortedServiceDetails = uniqueServiceDetails.sort((a, b) => {
            const firstDayA = a[0][0];
            const firstDayB = b[0][0];
            return (dayOrder[firstDayA.toLowerCase()] || 0) - (dayOrder[firstDayB.toLowerCase()] || 0);
        });

        setServiceDetails(sortedServiceDetails);
    };

    const processBlockData = (blocks_data: any, service_id: string) => {
        const lineDetails = blocks_data.filter((block: any) => block.service_id === service_id);
        setLineDetails(lineDetails);
    };

    useEffect(() => {
        const fetchLineDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://127.0.0.1:8000/api/routes/schedule/plan/?route_id=${lineValue}&vehicle_type=${vehicle_type}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch line details');
                }
                const data = await response.json();
                setFetchedData(data); 
                processServiceData(data); 
                const todayServiceId = getTodayService(data);
                processBlockData(data, todayServiceId);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchLineDetails();
    }, [lineValue, vehicle_type]);

    useEffect(() => {
        if (fetchedData && service_id) {
            processBlockData(fetchedData, service_id);
        }
    }, [service_id, fetchedData]);

    return { lineDetails, serviceDetails, loading, error };
};

export default useLineDetails;
