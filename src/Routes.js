// Routes.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import RadarMap from './RadarMap'; // Import your first screen component
import RecentSightings from './RecentSightings'; // Import your second screen component
import NearByShips from "./NearByShips";
import InteractiveNearByShips from "./InteractiveNearByShips";

function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={RadarMap} />        
        <Route exact path="/nearby-ship" component={NearByShips} />  
        <Route exact path="/recentsightings" component={RecentSightings} /> 
        <Route exact path="/interactive-nearby-ship" component={InteractiveNearByShips} />          
      </Switch>
    </Router>
  );
}

export default Routes;
