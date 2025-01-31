import React, { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

interface DateRangePickerProps {
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onStartDateChange, onEndDateChange }) => {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startDateRef.current) {
      flatpickr(startDateRef.current, {
        dateFormat: "Y-m-d",
        onChange: (selectedDates) => {
          onStartDateChange(selectedDates.length ? selectedDates[0].toISOString().split("T")[0] : null);
        },
      });
    }

    if (endDateRef.current) {
      flatpickr(endDateRef.current, {
        dateFormat: "Y-m-d",
        onChange: (selectedDates) => {
          onEndDateChange(selectedDates.length ? selectedDates[0].toISOString().split("T")[0] : null);
        },
      });
    }
  }, [onStartDateChange, onEndDateChange]);

  return (
    <div className="flex items-center space-x-4 ">
      <div className="relative ">
        <input
          ref={startDateRef}
          type="text"
          readOnly
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Wybierz datę początkową"
        />
      </div>

      <span className="text-gray-500">do</span>

      <div className="relative">
        <input
          ref={endDateRef}
          type="text"
          readOnly
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Wybierz datę końcową"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
