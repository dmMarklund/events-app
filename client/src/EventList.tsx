import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/styles.css";

interface Event {
  eventNumber: string;
  eventDescription: string;
  eventName: string;
  eventImageSrc: string;
  eventDate: Date;
  eventMonth: string;
}

interface MonthYear {
  month: number;
  year: number;
}

const getMonthName = (month: number) => {
  return new Date(0, month).toLocaleString("default", { month: "long" });
};

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState<MonthYear>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [availableMonths, setAvailableMonths] = useState<MonthYear[]>([]);

  useEffect(() => {
    axios
      .get<Event[]>("http://68.183.2.254:5001/events")
      .then((response) => {
        const parsedEvents = response.data.map((event: Event) => {
          const dateMatch = event.eventDescription.match(/(\w+ \d{1,2} \d{4})/);
          if (dateMatch) {
            const eventDate = new Date(dateMatch[0]);
            return {
              ...event,
              eventDate,
              eventMonth:
                getMonthName(eventDate.getMonth()) +
                " " +
                eventDate.getFullYear(),
            };
          }
          // Assign default values if parsing fails
          return {
            ...event,
            eventDate: new Date(),
            eventMonth: "",
          };
        });

        const uniqueMonths = Array.from(
          new Set(parsedEvents.map((event) => event.eventMonth))
        )
          .filter((month): month is string => month !== "")
          .map((monthYear) => {
            const [monthName, year] = monthYear.split(" ");
            const month = new Date(`${monthName} 1, ${year}`).getMonth();
            return { month, year: parseInt(year) };
          })
          .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
          });

        setAvailableMonths(uniqueMonths);

        const currentMonthEvents = parsedEvents
          .filter(
            (event) =>
              event.eventDate &&
              event.eventDate.getMonth() === currentMonth.month &&
              event.eventDate.getFullYear() === currentMonth.year
          )
          .sort((a: Event, b: Event) =>
            a.eventDate && b.eventDate
              ? a.eventDate.getTime() - b.eventDate.getTime()
              : 0
          );

        setEvents(currentMonthEvents);
      })
      .catch((error) => console.error(error));
  }, [currentMonth]);

  const handleNextMonth = () => {
    const currentIndex = availableMonths.findIndex(
      (m) => m.month === currentMonth.month && m.year === currentMonth.year
    );
    if (currentIndex < availableMonths.length - 1) {
      setCurrentMonth(availableMonths[currentIndex + 1]);
    }
  };

  const handlePreviousMonth = () => {
    const currentIndex = availableMonths.findIndex(
      (m) => m.month === currentMonth.month && m.year === currentMonth.year
    );
    if (currentIndex > 0) {
      setCurrentMonth(availableMonths[currentIndex - 1]);
    }
  };

  const formatDescription = (description: string) => {
    const dateRegex = /(\w+ \d{1,2} \d{4})/;
    const match = description.match(dateRegex);
    if (match) {
      const dateStr = match[0];
      const parts = description.split(dateStr);
      return (
        <>
          {parts[0]}
          <strong>{dateStr}</strong>
        </>
      );
    }
    return description;
  };

  return (
    <div className="container">
      <h1>
        Events for {getMonthName(currentMonth.month)} {currentMonth.year}
      </h1>
      <div className="navigation">
        <div className="nav-buttons">
          {currentMonth.month !== availableMonths[0]?.month ||
          currentMonth.year !== availableMonths[0]?.year ? (
            <button onClick={handlePreviousMonth}>Previous Month</button>
          ) : (
            <div />
          )}
        </div>
        <div className="nav-buttons">
          {currentMonth.month !==
            availableMonths[availableMonths.length - 1]?.month ||
          currentMonth.year !==
            availableMonths[availableMonths.length - 1]?.year ? (
            <button onClick={handleNextMonth}>Next Month</button>
          ) : (
            <div />
          )}
        </div>
      </div>
      <div className="event-grid">
        {events.map((event) => (
          <div key={event.eventNumber} className="event-card">
            <img
              src={event.eventImageSrc}
              alt={event.eventName}
              className="event-image"
            />
            <div className="event-details">
              <h2>{event.eventName}</h2>
              <p>{formatDescription(event.eventDescription)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
