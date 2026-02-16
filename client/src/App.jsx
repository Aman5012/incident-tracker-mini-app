import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateIncident from './pages/CreateIncident';
import IncidentDetail from './pages/IncidentDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateIncident />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

