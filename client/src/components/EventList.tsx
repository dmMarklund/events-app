import React, { useEffect, useState } from "react";
import axios from "axios";
import NavigationBar from "./NavigationBar";

interface Event {
  eventNumber: string;
  eventDescription: string;
  eventName: string;
  eventImage: string;
  eventDate: Date;
  eventMonth: string;
  eventLink: string;
  numberInterested?: number;
  numberGoing?: number;
}

interface MonthYear {
  month: number;
  year: number;
}

const getMonthName = (month: number) => {
  return new Date(0, month).toLocaleString("en-US", { month: "long" });
};

const extractCityNames = (events: Event[]): string[] => {
  const cityNames = events
    .map((event) => {
      const match = event.eventDescription.match(/Event in ([^\s,]+)/);
      console.log(`Match found: ${match ? match[1] : "No match"}`);
      return match ? match[1] : null;
    })
    .filter((city): city is string => city !== null);

  console.log(`City names extracted: ${cityNames}`);
  return Array.from(new Set(cityNames));
};

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState<MonthYear>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [availableMonths, setAvailableMonths] = useState<MonthYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [selectedCity, setSelectedCity] = useState("All");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const limit = 30;

  useEffect(() => {
    fetchEvents();
  }, [currentMonth, selectedCity]);

  const fetchEvents = async () => {
    setLoading(true);
    let allEvents: Event[] = [];
    let page = 1;
    let totalFetched = 0;

    try {
      while (true) {
        const response = await axios.get<{ total: number; events: Event[] }>(
          `http://68.183.2.254:5001/events?page=${page}&limit=${limit}`
        );
        const { total, events } = response.data;

        totalFetched += events.length;
        allEvents = allEvents.concat(events);
        page++;

        if (totalFetched >= total) {
          break;
        }
      }

      const parsedEvents = parseEvents(allEvents);
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
      setAvailableCities(extractCityNames(parsedEvents));
      const currentMonthEvents = filterEventsByMonth(
        parsedEvents,
        currentMonth
      );
      setEvents(
        selectedCity === "All"
          ? currentMonthEvents
          : currentMonthEvents.filter((event) =>
              event.eventDescription.includes(`Event in ${selectedCity}`)
            )
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseEvents = (events: Event[]): Event[] => {
    return events.map((event) => {
      const dateMatch = event.eventDescription.match(/(\w+ \d{1,2} \d{4})/);
      const interestedMatch = event.eventDescription.match(
        /(\d+) people interested/
      );
      const goingMatch = event.eventDescription.match(/(\d+) people going/);
      const numberInterested = interestedMatch
        ? parseInt(interestedMatch[1])
        : 0;
      const numberGoing = goingMatch ? parseInt(goingMatch[1]) : 0;
      if (dateMatch) {
        const eventDate = new Date(dateMatch[0]);
        return {
          ...event,
          eventDate,
          eventMonth:
            getMonthName(eventDate.getMonth()) + " " + eventDate.getFullYear(),
          numberInterested,
          numberGoing,
        };
      }
      return {
        ...event,
        eventDate: new Date(),
        eventMonth: "",
        numberInterested,
        numberGoing,
      };
    });
  };

  const filterEventsByMonth = (
    events: Event[],
    monthYear: MonthYear
  ): Event[] => {
    return events
      .filter(
        (event) =>
          event.eventDate &&
          event.eventDate.getMonth() === monthYear.month &&
          event.eventDate.getFullYear() === monthYear.year
      )
      .sort((a: Event, b: Event) =>
        a.eventDate && b.eventDate
          ? a.eventDate.getTime() - b.eventDate.getTime()
          : 0
      );
  };

  const handleSearch = () => {
    if (searchInput.trim() === "") return;
    setSearchQuery(searchInput);
    searchEvents(searchInput);
  };

  const searchEvents = async (query: string) => {
    setLoading(true);
    let allEvents: Event[] = [];
    let page = 1;
    let totalFetched = 0;

    try {
      do {
        const response = await axios.get<{ total: number; events: Event[] }>(
          `http://68.183.2.254:5001/events?page=${page}&limit=${limit}`
        );
        const { total, events } = response.data;

        totalFetched += events.length;
        allEvents = allEvents.concat(events);
        page++;

        if (totalFetched >= total) {
          break;
        }
      } while (true);

      const parsedEvents = parseEvents(allEvents);

      const filteredEvents = parsedEvents
        .filter(
          (event) =>
            event.eventDescription
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            event.eventName.toLowerCase().includes(query.toLowerCase())
        )
        .map((event) => ({
          ...event,
          highlightedDescription: highlightSearchTerm(
            event.eventDescription,
            query
          ),
          highlightedName: highlightSearchTerm(event.eventName, query),
        }));

      setSearchResults(filteredEvents);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error searching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setSearchResults([]);
    fetchEvents(); // Reload events for the current month
  };

  const emptySearch = () => {
    setSearchInput("");
    setSearchResults([]);
  };

  const getUpcomingEvents = (events: Event[]): Event[] => {
    const today = new Date();
    const nextTwoDays = new Date(today);
    nextTwoDays.setDate(today.getDate() + 2);
    return events
      .filter(
        (event) => event.eventDate >= today && event.eventDate <= nextTwoDays
      )
      .slice(0, 12);
  };

  const getHotEvents = (events: Event[]): Event[] => {
    return events
      .map((event) => ({
        ...event,
        totalInterest: (event.numberInterested ?? 0) + (event.numberGoing ?? 0),
      }))
      .sort((a, b) => b.totalInterest - a.totalInterest)
      .slice(0, 12);
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

  const highlightSearchTerm = (
    text: string,
    searchTerm: string
  ): JSX.Element => {
    if (!searchTerm) return <>{text}</>;
    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark key={index}>{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="container">
      <NavigationBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
        resetSearch={resetSearch}
        availableCities={availableCities}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />
      <h1>Upcoming Events</h1>
      <div className="event-grid">
        {getUpcomingEvents(events).map((event) => (
          <div key={event.eventNumber} className="event-card">
            <img
              src={`data:image/jpeg;base64,${event.eventImage}`}
              alt={event.eventName}
              className="event-image"
            />
            <div className="event-details">
              <h2>{event.eventName}</h2>
              <p>{formatDescription(event.eventDescription)}</p>
              <a
                href={event.eventLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Event Link
              </a>
            </div>
          </div>
        ))}
      </div>
      <h1>Hot Events</h1>
      <div className="event-grid">
        {getHotEvents(events).map((event) => (
          <div key={event.eventNumber} className="event-card">
            <img
              src={`data:image/jpeg;base64,${event.eventImage}`}
              alt={event.eventName}
              className="event-image"
            />
            <div className="event-details">
              <h2>{event.eventName}</h2>
              <p>{formatDescription(event.eventDescription)}</p>
              <a
                href={event.eventLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Event Link
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
