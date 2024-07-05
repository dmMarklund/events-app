import React from "react";

interface NavigationBarProps {
  searchInput: string;
  setSearchInput: (input: string) => void;
  handleSearch: () => void;
  resetSearch: () => void;
  availableCities: string[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  searchInput,
  setSearchInput,
  handleSearch,
  resetSearch,
  availableCities,
  selectedCity,
  setSelectedCity,
}) => {
  return (
    <div className="navigation-bar">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search events..."
      />
      <select
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
      >
        <option value="All">Everywhere</option>
        {availableCities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <button onClick={handleSearch}>Search</button>

      <button onClick={resetSearch}>Reset</button>

      <a href="/">Home</a>
      <a href="/calendar">Calendar</a>
    </div>
  );
};

export default NavigationBar;
