// App.jsx — routing, WorkoutMode context
import { useState } from 'react';
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
import { getActiveWorkoutDraft } from './db/storage';

function AppRoutes() {
  const [activeSession, setActiveSession] = useState(
    () => getActiveWorkoutDraft()?.programDay ?? null
  ); // null = no session

  return (
    activeSession ? (
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
      )
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
