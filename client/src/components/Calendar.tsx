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
  return Array.from(new Set(cityNames)).sort((a, b) => {
    const swedishAlphabet = "abcdefghijklmnopqrstuvwxyzåäö";
    const aIndex = swedishAlphabet.indexOf(a.toLowerCase()[0]);
    const bIndex = swedishAlphabet.indexOf(b.toLowerCase()[0]);
    if (aIndex < bIndex) return -1;
    if (aIndex > bIndex) return 1;
    return 0;
  });
};

const Calendar: React.FC = () => {
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
  }, [currentMonth]);

  useEffect(() => {
    if (selectedCity === "All") {
      resetSearch();
    }
  }, [selectedCity]);

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
      setEvents(currentMonthEvents);
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
      if (dateMatch) {
        const eventDate = new Date(dateMatch[0]);
        return {
          ...event,
          eventDate,
          eventMonth:
            getMonthName(eventDate.getMonth()) + " " + eventDate.getFullYear(),
        };
      }
      return {
        ...event,
        eventDate: new Date(),
        eventMonth: "",
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

  const handleNextMonth = () => {
    setSelectedCity("All");
    emptySearch();
    const currentIndex = availableMonths.findIndex(
      (m) => m.month === currentMonth.month && m.year === currentMonth.year
    );
    if (currentIndex < availableMonths.length - 1) {
      setCurrentMonth(availableMonths[currentIndex + 1]);
    }
  };

  const handlePreviousMonth = () => {
    setSelectedCity("All");
    emptySearch();
    const currentIndex = availableMonths.findIndex(
      (m) => m.month === currentMonth.month && m.year === currentMonth.year
    );
    if (currentIndex > 0) {
      setCurrentMonth(availableMonths[currentIndex - 1]);
    }
  };

  const handleSearch = () => {
    if (searchInput.trim() === "" && selectedCity === "All") {
      return;
    }
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

      let filteredEvents = parsedEvents;

      if (query.trim() !== "") {
        filteredEvents = filteredEvents.filter(
          (event) =>
            event.eventDescription
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            event.eventName.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (selectedCity !== "All") {
        filteredEvents = filteredEvents.filter((event) =>
          event.eventDescription.includes(`Event in ${selectedCity}`)
        );
      }

      filteredEvents = filteredEvents.map((event) => ({
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
    setSearchQuery("");
    setSearchResults([]);
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
      <h1>
        Events of {getMonthName(currentMonth.month)} {currentMonth.year}
      </h1>
      {availableMonths.length > 0 && (
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
      )}
      {loading ? (
        <div className="loading">
          <div className="loader"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="event-grid">
          {searchResults.map((event) => (
            <div key={event.eventNumber} className="event-card">
              <img
                src={`data:image/jpeg;base64,${event.eventImage}`}
                alt={event.eventName}
                className="event-image"
              />
              <div className="event-details">
                <h2>{highlightSearchTerm(event.eventName, searchQuery)}</h2>
                <p>
                  {highlightSearchTerm(event.eventDescription, searchQuery)}
                </p>
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
      ) : searchResults.length === 0 && searchQuery.trim() !== "" ? (
        <div className="no-results">
          No events found for the search term "{searchQuery}".
        </div>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
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
      )}
    </div>
  );
};

const highlightSearchTerm = (text: string, searchTerm: string): JSX.Element => {
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
};

export default Calendar;
