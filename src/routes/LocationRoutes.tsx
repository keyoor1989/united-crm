
import React from "react";
import { Route } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import LocationBhopal from "@/pages/locations/LocationBhopal";
import LocationIndore from "@/pages/locations/LocationIndore";
import LocationJabalpur from "@/pages/locations/LocationJabalpur";

export const LocationRoutes = () => {
  return (
    <>
      <Route
        path="locations/bhopal"
        element={
          <TaskEnabledLayout>
            <LocationBhopal />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="locations/indore"
        element={
          <TaskEnabledLayout>
            <LocationIndore />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="locations/jabalpur"
        element={
          <TaskEnabledLayout>
            <LocationJabalpur />
          </TaskEnabledLayout>
        }
      />
    </>
  );
};
