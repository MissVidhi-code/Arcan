import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Notes from "./components/Notes";
import Reminder from "./components/Reminder";
import Timetable from "./components/Timetable";
import Chatbot from "./components/Chatbot";
import Calendar from "./components/Calendar";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        
        {/* Navbar */}
        <nav className="bg-gray-800 p-4 flex gap-6 justify-center text-lg">
          <Link to="/">Dashboard</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/reminder">Reminder</Link>
          <Link to="/timetable">Timetable</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/chatbot">AI Chat</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/reminder" element={<Reminder />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
