import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from './store/session'
import Navigation from "./components/Navigation";
import AllSpots from "./components/AllSpots";
import ASpot from "./components/ASpot";
import NewSpotForm from "./components/NewSpotForm";

function App() {
  const dispatch = useDispatch()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    dispatch(sessionActions.restoreUserThunk()).then(() => setIsLoaded(true))
  }, [dispatch])

  return (
    <div>
      <Navigation isLoaded={isLoaded} />
      {isLoaded &&
      <Switch>
        <Route exact path="/" component={AllSpots} />
        <Route path="/api/spots/new" component={NewSpotForm} />
        <Route exact path="/api/spots/:spotId" component={ASpot} />
      </Switch>}
    </div>
  );
}

export default App;
