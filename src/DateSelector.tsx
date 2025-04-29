import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

type DateSelectorProps = {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

const DateSelector = ({
  dates,
  selectedDate,
  onSelectDate,
}: DateSelectorProps) => {
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const visibleDates = dates.slice(visibleStartIndex, visibleStartIndex + 7);

  const handlePrevious = () => {
    if (visibleStartIndex > 0) {
      setVisibleStartIndex(visibleStartIndex - 1);
    }
  };

  const handleNext = () => {
    if (visibleStartIndex + 7 < dates.length) {
      setVisibleStartIndex(visibleStartIndex + 1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevious}
          disabled={visibleStartIndex === 0}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Select a date
        </span>
        <button
          onClick={handleNext}
          disabled={visibleStartIndex + 7 >= dates.length}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition"
        >
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {visibleDates.map((date) => {
          const isToday = isSameDay(new Date(), parseISO(date));
          const isSelected = date === selectedDate;
          const dateObj = parseISO(date);

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg
                transition-all duration-200
                ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }
                ${
                  isToday && !isSelected
                    ? "border border-indigo-600 dark:border-indigo-500"
                    : ""
                }
              `}
            >
              <span className="text-xs mb-1">{format(dateObj, "EEE")}</span>
              <span className="text-lg font-bold">{format(dateObj, "d")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateSelector;
