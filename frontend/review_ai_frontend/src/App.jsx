import React from "react";
import { BrowserRouter as Router, Routes, Route , Navigate} from "react-router-dom"; // import routing components
import Home from "./pages/Home"; // import Home component
import ReviewsPage from "./pages/ReviewsPage"; // import ReviewsPage component
import Dashboard from "./pages/Dashboard"; // import Dashboard component
import Analytics from "./pages/AnalyticsPage"; // import Analytics component
import InsightsPage from "./pages/InsightsPage"; // import InsightsPage component
import AddReviewPage from "./pages/AddReviewPage"; // import AddReviewPage component

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/Analytics" element={<Analytics/>} />"
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/add-review" element={<AddReviewPage />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}
