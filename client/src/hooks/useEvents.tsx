import { useState, useEffect } from "react";
import axios from "axios";
import { Event, MonthYear } from "../types/types";

const limit = 30;

const getMonthName = (month: number) => {
  return new Date(0, month).toLocaleString("en-US", { month: "long" });
};

const parseEvents = (events: Event[]): Event[] => {
  return events.map((event) => {
    const dateMatch = event.eventDescription.match(/(\w+ \d{1,2} \d{4})/);
    const interestedMatch = event.eventDescription.match(
      /(\d+) people interested/
    );
    const goingMatch = event.eventDescription.match(/(\d+) people going/);
    const numberInterested = interestedMatch ? parseInt(interestedMatch[1]) : 0;
    const numberGoing = goingMatch ? parseInt(goingMatch[1]) : 0;
    if (dateMatch) {
      const eventDate = new Date(dateMatch[0]);
      return {
        ...event,
        eventDate,
        eventMonth: `${getMonthName(
          eventDate.getMonth()
        )} ${eventDate.getFullYear()}`,
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
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return events
    .filter(
      (event) =>
        event.eventDate &&
        event.eventDate >= startOfToday && // Only include events from today onwards
        event.eventDate.getMonth() === monthYear.month &&
        event.eventDate.getFullYear() === monthYear.year
    )
    .sort((a, b) =>
      a.eventDate && b.eventDate
        ? a.eventDate.getTime() - b.eventDate.getTime()
        : 0
    );
};

const extractCityNames = (events: Event[]): string[] => {
  const cityNames = events
    .map((event) => {
      const match = event.eventDescription.match(/Event in ([^\s,]+)/);
      return match ? match[1] : null;
    })
    .filter((city): city is string => city !== null);
  return Array.from(new Set(cityNames)).sort((a, b) => {
    const swedishAlphabet = "abcdefghijklmnopqrstuvwxyzåäö";
    const aIndex = swedishAlphabet.indexOf(a.toLowerCase()[0]);
    const bIndex = swedishAlphabet.indexOf(b.toLowerCase()[0]);
    if (aIndex < bIndex) return -1;
    if (aIndex > bIndex) return 1;
    return 0;
  });
};

const useEvents = () => {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [availableMonths, setAvailableMonths] = useState<MonthYear[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    let fetchedEvents: Event[] = [];
    let page = 1;
    let totalFetched = 0;

    try {
      while (true) {
        const response = await axios.get<{ total: number; events: Event[] }>(
          `http://68.183.2.254:5001/events?page=${page}&limit=${limit}`
        );
        const { total, events } = response.data;

        totalFetched += events.length;
        fetchedEvents = fetchedEvents.concat(events);
        page++;

        if (totalFetched >= total) {
          break;
        }
      }

      const parsedEvents = parseEvents(fetchedEvents);
      setAllEvents(parsedEvents);

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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (
    currentMonth: MonthYear | null,
    selectedCity: string
  ) => {
    const filteredEvents = currentMonth
      ? filterEventsByMonth(allEvents, currentMonth)
      : allEvents;

    setEvents(
      selectedCity === "All"
        ? filteredEvents
        : filteredEvents.filter((event) =>
            event.eventDescription.includes(`Event in ${selectedCity}`)
          )
    );
  };

  return {
    allEvents,
    events,
    availableMonths,
    availableCities,
    loading,
    filterEvents,
    numberInterested: events.reduce(
      (acc, event) => acc + event.numberInterested,
      0
    ),
    numberGoing: events.reduce((acc, event) => acc + event.numberGoing, 0),
  };
};

export default useEvents;
