import React, { useState } from "react";
import Button from "../components/Button";
import DateRangePicker from "../components/DataRangePicker";

const StatisticsPage: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [historyType, setHistoryType] = useState<"vehicle" | "line">("vehicle");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!startDate || !endDate || !inputValue) {
      console.warn("Proszę podać wszystkie dane!");
      return;
    }

    const requestData = {
      type: historyType,
      number: inputValue,
      startDate,
      endDate,
    };

    console.log("Wyszukiwanie:", requestData);
  };

  return (
    <div className="py-10 container mx-auto ps-32 h-[92vh] mt-1">
      <h1 className="text-4xl font-semibold mb-4">Dane statystyczne</h1>

      <div className="flex gap-10 mb-6">
        <Button onClick={() => setHistoryType("vehicle")}>Historia Pojazdu</Button>
        <Button onClick={() => setHistoryType("line")}>Historia Linii</Button>
      </div>

      <div className="w-1/2 flex flex-col items-start gap-4 mt-10">
        <div className="flex">
          <DateRangePicker onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
          
          <div className="ms-12">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={historyType === "vehicle" ? "Podaj numer pojazdu" : "Podaj numer linii"}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 mx-auto px-6 py-2 bg-white text-gray-700 border-2 border-gray-700 hover:bg-gray-700 hover:text-white font-medium rounded-lg transition-all 
          focus:ring-2 focus:ring-blue-400"
        >
          {historyType === "vehicle" ? "Szukaj pojazdu" : "Szukaj linii"}
        </button>
      </div>
    </div>
  );
};

export default StatisticsPage;
