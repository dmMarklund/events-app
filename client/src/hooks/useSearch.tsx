import { useState } from "react";
import { MonthYear } from "../types/types";
import { useNavigate } from "react-router-dom";

interface UseSearchProps {
  filterEvents: (monthYear: MonthYear, city: string, query?: string) => void;
  currentMonth: MonthYear;
  selectedCity: string;
}

const useSearch = ({
  filterEvents,
  currentMonth,
  selectedCity,
}: UseSearchProps) => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate("/calendar");
    setSearchQuery(searchInput);
    filterEvents(currentMonth, selectedCity, searchInput);
  };

  const resetSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    filterEvents(currentMonth, selectedCity, "");
  };

  return {
    searchInput,
    setSearchInput,
    searchQuery,
    handleSearch,
    resetSearch,
  };
};

export default useSearch;
