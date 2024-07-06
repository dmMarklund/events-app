import { useState } from "react";

interface UseSearchProps {
  selectedCity: string;
}
const useSearch = ({ selectedCity }: UseSearchProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (selectedCity.trim() !== "") {
      return;
    }
    setSearchQuery(searchInput);
  };

  const resetSearch = () => {
    setSearchInput("");
    setSearchQuery("");
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
