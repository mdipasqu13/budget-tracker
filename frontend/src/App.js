import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import BudgetTracker from "./components/BudgetTracker";

function App() {
  const [userId, setUserId] = React.useState(() => {
    // Retrieve userId from localStorage if it exists
    return localStorage.getItem("userId") || null;
  });

  // Save userId to localStorage whenever it changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("userId");
    }
  }, [userId]);

  return (
    <Router>
      <Routes>
        {/* Pass setUserId as a prop to Auth */}
        <Route path="/" element={<Auth setUserId={setUserId} />} />
        
        {/* Pass userId as a prop to BudgetTracker */}
        <Route path="/tracker" element={<BudgetTracker userId={userId} />} />
        
      </Routes>
    </Router>
  );
}

export default App;
