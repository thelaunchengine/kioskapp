// src/App.js
import React from "react";
import { Routes, Route } from 'react-router-dom';
import "./css/App.css";
import 'leaflet/dist/leaflet.css';

import InteractiveWhales from "./InteractiveWhales";
import NoneInteractiveShips from "./NoneInteractiveShips";
import NoneInteractiveWhales from "./NoneInteractiveWhales";
import InteractiveShips from "./InteractiveShips";
import InteractiveShipsNew from "./InteractiveShipsNew";
import InteractiveShipsTest from "./InteractiveShipsTest";
import InteractiveShipsCopy from "./InteractiveShipsCopy";

import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, trackPageView } from "./analytics";
function App() {
  const location = useLocation();

  useEffect(() => {
    initGA(); // Initialize Google Analytics
  }, []);

  useEffect(() => {
    trackPageView(location.pathname); // Track page changes
  }, [location]);
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<NoneInteractiveShips />} />
        <Route path="/whales" element={<NoneInteractiveWhales />} />
        <Route path="/interactive-ships" element={<InteractiveShips />} />
        <Route path="/interactive-whales" element={<InteractiveWhales />} />
        <Route path="/interactive-ships-new" element={<InteractiveShipsNew />} />
        <Route path="/ships-test" element={<InteractiveShipsTest />} />
        <Route path="/interactive-ships-copy" element={<InteractiveShipsCopy />} />
      </Routes>
    </div>


  );
}

export default App;
