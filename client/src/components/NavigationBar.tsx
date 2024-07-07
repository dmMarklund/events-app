import React from "react";
import { NavigationBarProps } from "../types/types";

const NavigationBar: React.FC<NavigationBarProps> = ({
  searchInput,
  setSearchInput,
  handleSearch,
  resetSearch,
  clearEvents,
  availableCities,
  selectedCity,
  setSelectedCity,
}) => {
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    clearEvents(); // Call clearEvents to reset events before selecting new city
    setSelectedCity(newCity);
  };

  return (
    <div className="navigation-bar">
      <div className="search-container">
        <select value={selectedCity} onChange={handleCityChange}>
          <option value="All">Everywhere</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search events..."
        />
        <button onClick={handleSearch} className="search-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            width="24px"
            height="24px"
          >
            <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z" />
          </svg>
        </button>
        <button onClick={resetSearch} className="search-reset-button">
          Clear
        </button>
      </div>
      <div>
        <a href="/">Home</a>
        <a href="/calendar">Calendar</a>
      </div>
    </div>
  );
};

export default NavigationBar;
