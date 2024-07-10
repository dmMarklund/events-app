import React, { useState, useEffect } from "react";
import NavigationBar from "./NavigationBar";
import EventCard from "./EventCard";
import useEvents from "../hooks/useEvents";
import useSearch from "../hooks/useSearch";
import { MonthYear } from "../types/types";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { v4 as uuidv4 } from "uuid";

const getMonthName = (month: number) => {
  return new Date(0, month).toLocaleString("en-US", { month: "long" });
};

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<MonthYear>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [selectedMonth, setSelectedMonth] = useState<MonthYear | null>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [_, setEvents] = useState<Event[]>([]);

  const clearEvents = () => {
    setEvents([]);
  };

  const selectedCity = useSelector(
    (state: RootState) => state.navigationBar.selectedCity
  );

  const {
    allEvents,
    events,
    availableMonths,
    availableCities,
    loading,
    filterEvents,
  } = useEvents();

  const { searchQuery, handleSearch, resetSearch } = useSearch({
    filterEvents,
    currentMonth,
  });

  useEffect(() => {
    if (allEvents.length > 0) {
      allEvents.sort((a, b) => {
        return a.eventDate.getTime() - b.eventDate.getTime();
      });
    }
    filterEvents(currentMonth, selectedCity);
  }, [allEvents, currentMonth, selectedCity, searchQuery]);

  useEffect(() => {
    filterEvents(null, selectedCity);
    if (availableMonths.length > 0) {
      setCurrentMonth({
        month: availableMonths[0].month,
        year: availableMonths[0].year,
      });
    }
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      setCurrentMonth(selectedMonth);
    }
  }, [selectedMonth]);

  const handleMonthChange = (monthYearString: string) => {
    const [monthName, year] = monthYearString.split(" ");
    const month = new Date(`${monthName} 1, ${year}`).getMonth();
    const currentM_ = { month, year: parseInt(year) };
    setCurrentMonth(currentM_);
    setSelectedMonth(currentM_);
  };

  const handleAllEventsClick = () => {
    setSelectedMonth(null);
    filterEvents(null, selectedCity);
  };

  return (
    <div className="calendar-page">
      <NavigationBar
        handleSearch={handleSearch}
        resetSearch={resetSearch}
        clearEvents={clearEvents}
        availableCities={availableCities}
      />

      {loading ? (
        <div className="loading">
          <span className="loader" />
        </div>
      ) : (
        <>
          <div className="month-selector-container">
            <div className="month-selector">
              {/* All Events button */}
              <div
                className={`month-item ${
                  selectedMonth === null ? "selected" : ""
                }`}
                onClick={handleAllEventsClick}
              >
                All Events
              </div>

              {/* Display availableMonths */}
              {availableMonths.map((monthYear) => (
                <div
                  key={uuidv4()}
                  className={`month-item ${
                    selectedMonth &&
                    currentMonth.month === monthYear.month &&
                    currentMonth.year === monthYear.year
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleMonthChange(
                      `${getMonthName(monthYear.month)} ${monthYear.year}`
                    )
                  }
                >
                  {getMonthName(monthYear.month)} {monthYear.year}
                </div>
              ))}
            </div>
          </div>

          {events.filter((event) =>
            event.eventName.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <div className="event-grid">
              <div className="no-events-found">
                <span>No events found</span>
              </div>
            </div>
          ) : (
            <div className="event-grid">
              {events
                .filter((event) =>
                  event.eventName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((event) => (
                  <EventCard
                    key={uuidv4()}
                    event={event}
                    searchTerm={searchQuery}
                  />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Calendar;
