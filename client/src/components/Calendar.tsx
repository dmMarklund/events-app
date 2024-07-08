import React, { useState, useEffect } from "react";
import NavigationBar from "./NavigationBar";
import EventCard from "./EventCard";
import useEvents from "../hooks/useEvents";
import useSearch from "../hooks/useSearch";
import { MonthYear } from "../types/types";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { setSearchInput, setSelectedCity } from "../redux/navigationBarSlice";

const getMonthName = (month: number) => {
  return new Date(0, month).toLocaleString("en-US", { month: "long" });
};

const Calendar: React.FC = () => {
  const dispatch = useDispatch();

  const [currentMonth, setCurrentMonth] = useState<MonthYear>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const [events_, setEvents] = useState<Event[]>([]);

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

  const {
    searchInput,
    setSearchInput,
    searchQuery,
    handleSearch,
    resetSearch,
  } = useSearch({
    filterEvents,
    currentMonth,
  });

  useEffect(() => {
    filterEvents(currentMonth, selectedCity);
  }, [allEvents, currentMonth, selectedCity, searchQuery]);

  // Ensure events are filtered correctly on the initial load
  useEffect(() => {
    filterEvents(currentMonth, selectedCity);
  }, []);

  const handleMonthChange = (monthYearString: string) => {
    const [monthName, year] = monthYearString.split(" ");
    const month = new Date(`${monthName} 1, ${year}`).getMonth();
    setCurrentMonth({ month, year: parseInt(year) });
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
              {availableMonths.map((monthYear) => (
                <div
                  key={`${monthYear.month}-${monthYear.year}`}
                  className={`month-item ${
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
                    key={event.eventName}
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
