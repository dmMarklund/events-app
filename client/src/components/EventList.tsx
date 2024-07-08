import React, { useState, useEffect } from "react";
import NavigationBar from "./NavigationBar";
import EventCard from "./EventCard";
import useEvents from "../hooks/useEvents";
import useSearch from "../hooks/useSearch";
import { Event, MonthYear } from "../types/types";

const EventList: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<MonthYear>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const [selectedCity, setSelectedCity] = useState("All");

  const [events_, setEvents] = useState<Event[]>([]);

  const clearEvents = () => {
    setEvents([]);
  };

  const { allEvents, events, availableCities, loading, filterEvents } =
    useEvents();

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
  }, [allEvents, currentMonth, searchQuery]);

  const getUpcomingEvents = (events: Event[]): Event[] => {
    const today = new Date();
    const nextTwoDays = new Date(today);
    nextTwoDays.setDate(today.getDate() + 2);
    return events
      .filter(
        (event) => event.eventDate >= today && event.eventDate <= nextTwoDays
      )
      .slice(0, 12); // Limit to 12 events
  };

  const getHotEvents = (allEvents: Event[]): Event[] => {
    return allEvents
      .map((event) => ({
        ...event,
        totalInterest: (event.numberInterested ?? 0) + (event.numberGoing ?? 0),
      }))
      .sort((a, b) => b.totalInterest - a.totalInterest)
      .slice(0, 12); // Limit to 12 events
  };

  return (
    <div className="event-list-page">
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
          <h1 className="list-h1">Upcoming Events</h1>
          {getUpcomingEvents(events).length === 0 ? (
            <div className="event-grid">
              <div className="no-events-found">
                <span>No events found</span>
              </div>
            </div>
          ) : (
            <div className="event-grid">
              {getUpcomingEvents(events).map((event) => (
                <EventCard
                  key={event.eventNumber}
                  event={event}
                  searchTerm={searchQuery}
                />
              ))}
            </div>
          )}

          <h1 className="list-h1">
            <span className="flaming-text">Hot</span> Events
          </h1>
          <div className="event-grid">
            {getHotEvents(allEvents).map((event) => (
              <EventCard
                key={event.eventNumber}
                event={event}
                searchTerm={searchQuery}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EventList;
