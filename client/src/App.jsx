import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './features/home/Home';
// Import other pages as needed

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        {/* Add other routes here */}
      </Route>
    </Routes>
  );
}

export default App;
