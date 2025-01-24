import { useState, useEffect } from 'react';

const useLineDetails = (lineNumber: string, lineValue: string) => {
    const [lineDetails, setLineDetails] = useState<any>(null);
    const [serviceDetails, setServiceDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    let vehicle_type: string;


    function getTodayService(blocks_data: any) {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = new Date();
        const dayName = daysOfWeek[today.getDay()].toLowerCase(); 
    
        const matchingBlock = blocks_data.find((block: any) => block.service_days.includes(dayName));
        return matchingBlock ? matchingBlock.service_id : blocks_data[0].service_id;
    }

    function processServiceData(blocks_data: any) { 
        let serviceDetails: Array<[string[], string]> = []; 
        
        blocks_data.forEach((block: any) => {           
            serviceDetails.push([block['service_days'], block['service_id']]);
        });
    
        const uniqueServiceDetails = Array.from(
            new Set(serviceDetails.map(item => JSON.stringify(item)))
        ).map(item => JSON.parse(item));
        
        const dayOrder: { [key: string]: number } = {
            "monday": 0,
            "tuesday": 1,
            "wednesday": 2,
            "thursday": 3,
            "friday": 4,
            "saturday": 5,
            "sunday": 6
        };
    
        const sortedServiceDetails = uniqueServiceDetails.sort((a, b) => {
            const firstDayA = a[0][0];
            const firstDayB = b[0][0];
    
            return (dayOrder[firstDayA.toLowerCase()] || 0) - (dayOrder[firstDayB.toLowerCase()] || 0);
        });
        
        setServiceDetails(sortedServiceDetails);
        processBlockData(blocks_data, getTodayService(blocks_data));
    }

    function processBlockData(blocks_data: any, service_id: string) {
        let lineDetails: any = [];
    
        blocks_data.forEach((block: any) => {
            if (block['service_id'] === service_id) {
                lineDetails.push(block);
            }
        });
        setLineDetails(lineDetails);
    }
  
    useEffect(() => {
        const fetchLineDetails = async () => {
            if (lineNumber.length < 3){
                vehicle_type = 'tram'
            } else{
                vehicle_type = 'bus'
            }
            try {            
                const response = await fetch(`http://127.0.0.1:8000/api/routes/schedule/plan/?route_id=${lineValue}&vehicle_type=${vehicle_type}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch line details');
                }
                const data = await response.json();
                
                processServiceData(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            }
             finally {
                setLoading(false);
            }
        };

        fetchLineDetails();
    }, [lineNumber]);

    return { lineDetails, serviceDetails, loading, error };
};

export default useLineDetails;