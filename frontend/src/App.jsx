import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Objectives from "./pages/Objectives";

// keep your existing objective pages & routes
import Objective1 from "./pages/Objective1";       // Crop Recommendation
import Objective2 from "./pages/Objective2";       // Crop Cycle Planning
import Objective3 from "./pages/Objective3";       // District-wise Suitability
import Objective4 from "./pages/Objective4";       // Profit Estimation
import PrintObjective2 from "./pages/PrintObjective2.jsx"; // your existing print view

function App() {
  return (
    <Router>
      <Routes>
        {/* public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />

        {/* objectives hub */}
        <Route path="/objectives" element={<Objectives />} />

        {/* keep existing routes so NOTHING breaks */}
        <Route path="/objective/1" element={<Objective1 />} />
        <Route path="/objective/2" element={<Objective2 />} />
        <Route path="/objective/3" element={<Objective3 />} />
        <Route path="/objective/4" element={<Objective4 />} />
        <Route path="/objective2/print" element={<PrintObjective2 />} />

        {/* nice alias routes with real names (optional) */}
        <Route path="/crop-recommendation" element={<Objective1 />} />
        <Route path="/crop-cycle-planning" element={<Objective2 />} />
        <Route path="/district-recommendations" element={<Objective3 />} />
        <Route path="/profit-estimation" element={<Objective4 />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
