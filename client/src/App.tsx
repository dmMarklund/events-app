import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EventList from "./components/EventList";
import Calendar from "./components/Calendar";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </Router>
  );
};

export default App;
