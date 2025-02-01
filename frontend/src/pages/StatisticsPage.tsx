import React, { useState, useEffect, useMemo } from "react"; 
import Button from "../components/Button";
import DateRangePicker from "../components/DataRangePicker";
import useVehicleHistory from "../hooks/useVehicleHistory";
import useRouteHistory from "../hooks/useRouteHistory";

const StatisticsPage: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [historyType, setHistoryType] = useState<"vehicle" | "line" | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [fetchData, setFetchData] = useState<boolean>(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);

  interface VehicleHistoryEntry {
    date: string;
    schedule_number: string[];
    route_short_names: number[][];
    vehicle_id: string;
  }

  interface VehicleData {
    date: string;
    schedule_number: string;
    route_short_names: string;
  }

  const { vehicleHistory } = useVehicleHistory(
    fetchData && historyType === "vehicle" ? inputValue : "",
    fetchData && historyType === "vehicle" ? startDate! : "",
    fetchData && historyType === "vehicle" ? endDate! : ""
  );

  const { routeHistory } = useRouteHistory(
    fetchData && historyType === "line" ? inputValue : "",
    fetchData && historyType === "line" ? startDate! : "",
    fetchData && historyType === "line" ? endDate! : ""
  );

  useEffect(() => {
    if (historyType === "vehicle" && vehicleHistory && vehicleHistory.length > 0) {
      setFetchedData(vehicleHistory);
    } else if (historyType === "line" && routeHistory && routeHistory.length > 0) {
      setFetchedData(routeHistory);
    }
    setFetchData(false);
  }, [vehicleHistory, routeHistory]);

  const handleTypeSelection = (type: "vehicle" | "line") => {
    setHistoryType(type);
    setIsFormVisible(true);
    setFetchedData([]);
  };

  const handleSubmit = () => {
    if (!startDate || !endDate || !inputValue) {
      console.warn("Proszę podać wszystkie dane!");
      return;
    }
    setFetchedData([]);
    setFetchData(true);
  };

  const sortScheduleNumbers = (scheduleNumbers: string[]) => {
    return scheduleNumbers.sort((a, b) => {
      const [mainA, subA] = a.split("/").map(Number);
      const [mainB, subB] = b.split("/").map(Number);
      return mainA !== mainB ? mainA - mainB : (subA || 0) - (subB || 0);
    });
  };

  const groupedData = useMemo(() => {
    if (historyType !== "line" || fetchedData.length === 0) return null;

    const dates = [...new Set(fetchedData.map((entry) => entry.date))].sort();
    let scheduleNumbersMap = new Map<string, Set<string>>();

    fetchedData.forEach(entry => {
      entry.schedule_number.forEach((schedule: string, index: number) => {
        const routeShortNames = entry.route_short_names[index]; 
        if (routeShortNames && routeShortNames.includes(Number(inputValue))) {
          if (!scheduleNumbersMap.has(schedule)) {
            scheduleNumbersMap.set(schedule, new Set());
          }
          routeShortNames.forEach((route: number) => scheduleNumbersMap.get(schedule)?.add(route.toString()));
        }
      });
    });

    const sortedScheduleNumbers = sortScheduleNumbers(Array.from(scheduleNumbersMap.keys()));

    const formattedData = dates.map((date) => {
      const row: { [key: string]: string } = { date };

      sortedScheduleNumbers.forEach((schedule) => {
        row[schedule] = "-";
      });

      fetchedData.forEach(entry => {
        if (entry.date === date) {
          entry.schedule_number.forEach((schedule: string, index: number) => {
            const routeShortNames = entry.route_short_names[index];
            if (routeShortNames && routeShortNames.includes(Number(inputValue))) {
              const scheduleKey = schedule;
              const vehicleIds = new Set(row[scheduleKey] !== "-" ? row[scheduleKey].split(", ") : []);
              vehicleIds.add(entry.vehicle_id);
              row[scheduleKey] = Array.from(vehicleIds).join(", ");
            }
          });
        }
      });

      return row;
    });

    return { dates, sortedScheduleNumbers, formattedData, scheduleNumbersMap };
  }, [fetchedData, historyType, inputValue]);



  const vehicleData = useMemo(() => {
    if (historyType !== "vehicle" || fetchedData.length === 0) return null;

    return fetchedData.map((entry: VehicleHistoryEntry) => ({
        date: entry.date,
        schedule_number: entry.schedule_number.join(", "),
        route_short_names: entry.route_short_names.map(names => `(${names.join(", ")})`).join(", ")
    }));
  }, [fetchedData, historyType]) as VehicleData[] | null;

  return (
    <div className="py-10 container mx-auto ps-6 md:ps-32 h-[92vh] mt-1">
      <h1 className="text-4xl font-semibold mb-4">Dane statystyczne</h1>

      <div className="flex gap-10 mb-6">
        <Button onClick={() => handleTypeSelection("vehicle")}>Historia Pojazdu</Button>
        <Button onClick={() => handleTypeSelection("line")}>Historia Linii</Button>
      </div>

      {isFormVisible && (
        <div className="w-full flex flex-col items-start gap-4 mt-10">
          <div className="flex flex-col md:flex-row md:items-center">
            <DateRangePicker onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
            <div className="mt-4 md:mt-0 md:ms-12">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-gray-700 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder={historyType === "vehicle" ? "Podaj numer pojazdu" : "Podaj numer linii"}
              />
            </div>
          </div>
         <button 
            onClick={handleSubmit}
            className="mt-4 mx-8 md:mx-36 px-6 py-2 bg-white text-gray-700 border-2 border-gray-700 hover:bg-gray-700 hover:text-white font-medium rounded-lg transition-all 
            focus:ring-2 focus:ring-blue-400"
          >
            {historyType === "vehicle" ? "Szukaj pojazdu" : "Szukaj linii"}
          </button>

          {historyType === "line" && groupedData && (
            <div className="my-6 w-[90%] md:w-full overflow-x-auto">
              <table className="table-auto w-full text-center border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 px-10 py-2">Data</th>
                    {groupedData.sortedScheduleNumbers.map((schedule) => {
                      const routeNames = groupedData.scheduleNumbersMap.get(schedule);
                      const routeNamesText = routeNames ? `(${Array.from(routeNames).join(", ")})` : "";
                      return (
                        <th key={schedule} className="border border-gray-300 px-4 py-2">
                          {schedule} <span className="text-sm font-normal">{routeNamesText}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {groupedData.formattedData.map((row, index) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">{row.date}</td>
                      {groupedData.sortedScheduleNumbers.map((schedule) => (
                        <td key={schedule} className="border border-gray-300 px-4 py-2 hover:underline">
                            <a href={`/vehicle/${row[schedule]}`}>{row[schedule]}</a>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {historyType === "vehicle" && vehicleData && (
            <div className="my-6 w-full overflow-auto">
              <table className="table-auto w-7/8 md:w-full text-center border border-gray-300">
                <thead className="bg-gray-200">
                    <tr>
                    <th className="border border-gray-300 px-4 py-2">Data</th>
                    <th className="border border-gray-300 px-4 py-2">Brygada</th>
                    <th className="border border-gray-300 px-4 py-2">Trasa</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicleData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="border border-gray-300 px-4 py-2">{row.date}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.schedule_number}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.route_short_names}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
