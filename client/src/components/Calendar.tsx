import React, { useState, useEffect } from "react";
import NavigationBar from "./NavigationBar";
import EventCard from "./EventCard";
import useEvents from "../hooks/useEvents";
import useSearch from "../hooks/useSearch";
import { MonthYear } from "../types/types";

const getMonthName = (month: number) => {
  return new Date(0, month).toLocaleString("en-US", { month: "long" });
};

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<MonthYear>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [selectedCity, setSelectedCity] = useState("All");
  const {
    allEvents,
    events,
    availableMonths,
    availableCities,
    loading,
    filterEvents,
  } = useEvents();

  const {
    searchInput,
    setSearchInput,
    searchQuery,
    handleSearch,
    resetSearch,
  } = useSearch({
    selectedCity,
  });

  useEffect(() => {
    filterEvents(currentMonth, selectedCity);
  }, [allEvents, currentMonth, selectedCity]);

  // Ensure events are filtered correctly on the initial load
  useEffect(() => {
    filterEvents(currentMonth, selectedCity);
  }, []);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [monthName, year] = event.target.value.split(" ");
    const month = new Date(`${monthName} 1, ${year}`).getMonth();
    setCurrentMonth({ month, year: parseInt(year) });
  };

  return (
    <div className="calendar-page">
      <NavigationBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
        resetSearch={resetSearch}
        availableCities={availableCities}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />
      <div className="month-selector">
        <select
          value={`${getMonthName(currentMonth.month)} ${currentMonth.year}`}
          onChange={handleMonthChange}
        >
          {availableMonths.map((monthYear) => (
            <option
              key={`${monthYear.month}-${monthYear.year}`}
              value={`${getMonthName(monthYear.month)} ${monthYear.year}`}
            >
              {getMonthName(monthYear.month)} {monthYear.year}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="loading">
          <span className="loader" />
        </div>
      ) : (
        <div className="event-grid">
          {events
            .filter((event) =>
              event.eventName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((event) => (
              <EventCard
                key={event.eventName}
                event={event}
                searchTerm={searchQuery}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default Calendar;
