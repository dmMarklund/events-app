//hooks/useEvents
export interface Event {
  eventNumber: string;
  eventName: string;
  eventDescription: string;
  eventLink: string;
  eventImage: string;
  eventDate: Date;
  eventMonth: string;
  numberInterested: number;
  numberGoing: number;
}

export interface MonthYear {
  month: number;
  year: number;
}
//components/NavigationBar
export interface NavigationBarProps {
  handleSearch: () => void;
  resetSearch: () => void;
  clearEvents: () => void;
  availableCities: string[];
}
//redux/navigationBArSlice
export interface NavigationBarState {
  searchInput: string;
  selectedCity: string;
  searchQuery: string;
}

//hooks/useSearch
export interface UseSearchProps {
  filterEvents: (monthYear: MonthYear, city: string, query?: string) => void;
  currentMonth: MonthYear;
}
