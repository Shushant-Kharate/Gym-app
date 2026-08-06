// App.jsx — routing, WorkoutMode context
import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import ProgramOverview from './pages/ProgramOverview';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutMode from './pages/WorkoutMode';
import Nutrition from './pages/Nutrition';
import Body from './pages/Body';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// WorkoutMode context — when active, hides the bottom nav
export const WorkoutContext = createContext(null);

export function useWorkoutContext() {
  return useContext(WorkoutContext);
}

function AppRoutes() {
  const [activeSession, setActiveSession] = useState(null); // null = no session

  return (
    <WorkoutContext.Provider value={{ activeSession, setActiveSession }}>
      {activeSession ? (
        <WorkoutMode
          programDay={activeSession}
          onEnd={() => setActiveSession(null)}
        />
      ) : (
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard onStartWorkout={setActiveSession} />} />
            <Route path="/program" element={<ProgramOverview onStartWorkout={setActiveSession} />} />
            <Route path="/library" element={<ExerciseLibrary />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/body" element={<Body />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AppShell>
      )}
    </WorkoutContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
