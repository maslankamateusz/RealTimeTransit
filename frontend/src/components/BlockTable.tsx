import React from 'react';

const BlockTable: React.FC<{ lineDetails: any[] }> = ({ lineDetails }) => {
    interface Vehicle {
    vehicle_id: string;
    timestamp: number;
    }
    interface Block {
    block_id: string;
    start_time: string;
    end_time: string;
    schedule_number: string;
    route_short_names: string[];
    vehicles: Vehicle[] | null;
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return minutes === 0 ? `${remainingSeconds} sek` : `${minutes} min ${remainingSeconds} sek`;
    };
    const getTimeFromTimestamp = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };
  return (
    <section className="mb-8 mr-3">
      <table className="table-auto w-full border-collapse border border-gray-300 mr-10">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-center">Od</th>
            <th className="border border-gray-300 p-2 text-center">Do</th>
            <th className="border border-gray-300 p-2 text-center">Linie</th>
            <th className="border border-gray-300 p-2 text-center">Pojazd</th>
            <th className="border border-gray-300 p-2 text-center">Brygada</th>
          </tr>
        </thead>
        <tbody>
        {lineDetails.map((block: Block) => {
            const startTimeWithoutSeconds: string = block.start_time.substring(0, 5);
            const endTimeWithoutSeconds: string = block.end_time.substring(0, 5);
            const [endHour, endMinute] = endTimeWithoutSeconds.split(':').map(Number);
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            const isNightLine = block.route_short_names.some((line) => line.startsWith('6') || line.startsWith('9'));
            let isBeforeEndTime = false;

            if (isNightLine) {
                const adjustedEndHour = endHour + 24;
                isBeforeEndTime = currentHour < adjustedEndHour || (currentHour === adjustedEndHour && currentMinute < endMinute);
            } else {
                isBeforeEndTime = currentHour < endHour || (currentHour === endHour && currentMinute < endMinute);
            }

            const lines = block.route_short_names;
            const vehicles = block.vehicles;

            return (
                <tr key={block.block_id}>
                <td className="border border-gray-300 p-2 text-center text-lg">{startTimeWithoutSeconds}</td>
                <td className="border border-gray-300 p-2 text-center text-lg">{endTimeWithoutSeconds}</td>
                <td className="border border-gray-300 p-2">
                    <div className="flex justify-center">
                    {lines.map((line) => {
                        const lineNumber = line;
                        const isNightLine = (String(lineNumber).startsWith('6') || String(lineNumber).startsWith('9')) && String(lineNumber).length > 1;
                        const isSubstituteLine = String(lineNumber).startsWith('7') && String(lineNumber).length > 1;

                        return (
                        <div
                            className={`me-2 flex justify-center items-center text-center text-md font-semibold border transition-all
                            ${isNightLine ? 'bg-black text-white border-black' : isSubstituteLine ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-black border-gray-900 hover:bg-gray-100'}`}
                            style={{ width: '34px', height: '34px' }}
                            key={`${block.block_id}-${block.schedule_number}-${lines.indexOf(line)}`}
                        >
                            {lineNumber}
                        </div>
                        );
                    })}
                    </div>
                </td>
                <td className="border border-gray-300 p-2 text-center">
                    {vehicles == null ? (
                    null
                    ) : vehicles.length === 0 ? (
                    '⚠'
                    ) : (
                    vehicles.map((vehicle) => {
                        const firstTwo = vehicle.vehicle_id.slice(0, 2);
                        const rest = vehicle.vehicle_id.slice(2);
                        const timestamp = vehicle.timestamp;
                        const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
                        const seconds = currentTimestampInSeconds - timestamp;
                        const time = formatTime(seconds);
                        const timeString = getTimeFromTimestamp(timestamp);

                        const [endHour, endMinute] = block.end_time.substring(0, 5).split(':').map(Number);
                        const now = new Date();
                        const currentHour = now.getHours();
                        const currentMinute = now.getMinutes();

                        const isAfterEndTime = currentHour > endHour || (currentHour === endHour && currentMinute > endMinute);

                        let statusColor = 'bg-yellow-500';
                        if (seconds <= 600) {
                        statusColor = 'bg-green-500';
                        } 
                        else if (isAfterEndTime) {
                        statusColor = 'bg-blue-500'; 
                        }

                        return (
                        <div key={vehicle.vehicle_id} className="flex items-center justify-center my-1 relative group">
                            <a href={`/vehicle/${encodeURIComponent(vehicle.vehicle_id)}`} className="text-lg text-gray-800 hover:underline">
                            <span className="text-sm">{firstTwo}</span>
                            {rest}
                            </a>
                            <span className={`w-2.5 h-2.5 rounded-full ${statusColor} mt-[1px] ml-2`} />
                            <div className="absolute right-4 bottom-3 transform -translate-y-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
                            Ostatnia aktualizacja: {time} temu, o godzinie: {timeString}
                            </div>
                        </div>
                        );
                    })
                    )}
                </td>
                    <td className="border border-gray-300 p-2 text-center">
                        <a href={`schedule/${encodeURIComponent(block.schedule_number)}`} className="text-blue-600 hover:underline text-lg">
                        {block.schedule_number}
                        </a>
                    </td>
                </tr>
            );
            })}
        </tbody>
      </table>
    </section>
  );
};

export default BlockTable;
