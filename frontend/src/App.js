import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import './styles/globals.css';

import LandingPage        from './pages/LandingPage';
import DashboardLayout    from './components/dashboard/DashboardLayout';
import EventTypesPage     from './pages/EventTypesPage';
import BookingsPage       from './pages/BookingsPage';
import AvailabilityPage   from './pages/AvailabilityPage';
import SettingsPage       from './pages/SettingsPage';
import PublicProfilePage  from './pages/PublicProfilePage';
import PublicBookingPage  from './pages/PublicBookingPage';
import BookingConfirmPage from './pages/BookingConfirmPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              borderRadius: '8px',
              background: '#1c1c1c',
              color: '#d0d0d0',
              border: '1px solid #2a2a2a',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            },
          }}
        />
        <Routes>
          <Route path="/"                       element={<LandingPage />} />
          <Route path="/dashboard"              element={<DashboardLayout />}>
            <Route index                        element={<Navigate to="/dashboard/event-types" replace />} />
            <Route path="event-types"           element={<EventTypesPage />} />
            <Route path="bookings"              element={<BookingsPage />} />
            <Route path="availability"          element={<AvailabilityPage />} />
            <Route path="settings"              element={<SettingsPage />} />
          </Route>
          <Route path="/book/:username"         element={<PublicProfilePage />} />
          <Route path="/book/:username/:slug"   element={<PublicBookingPage />} />
          <Route path="/booking/confirmed"      element={<BookingConfirmPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}