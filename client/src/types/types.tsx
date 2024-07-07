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

export interface NavigationBarProps {
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  resetSearch: () => void;
  clearEvents: () => void;
  availableCities: string[];
  selectedCity: string;
  setSelectedCity: React.Dispatch<React.SetStateAction<string>>;
}
