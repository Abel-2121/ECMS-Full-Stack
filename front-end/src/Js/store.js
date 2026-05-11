import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import electionReducer from './election-slice';
import voterListReducer from './voterList-slice';
import credentialReducer from './credential-slice';
import nominationReducer from './nomination-slice';
import monitoringReducer from './monitoring-slice';
import resultsReducer from './results-slice';
import institutionReducer from './institution-slice';
import adminReducer from './admin-slice';
import analyticsReducer from './analytics-slice';
//import settingsReducer from './settings-slice';
import votingReducer from './voting-slice';
//import candidatesReducer from './candidates-slice';
import dashboardReducer from './dashboard-slice'
import adminDashboard from './admin-dashboard-slice'
import systemSettings from './system-settings-slice'
import user from './user-slice'
import voterRegistrationReducer from './voterRegistration-slice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    election: electionReducer,
    voterList: voterListReducer,
    credential: credentialReducer,
    nomination: nominationReducer,
    //candidates: candidatesReducer,
    monitoring: monitoringReducer,
    results: resultsReducer,
    institution: institutionReducer,
    admin: adminReducer,
    analytics: analyticsReducer,
    //settings: settingsReducer,
    voting: votingReducer,
    dashboard: dashboardReducer,
    adminDashboard: adminDashboard,
    systemSettings: systemSettings,
    user: user,
    voterRegistration: voterRegistrationReducer,
  },
});

export default store;
