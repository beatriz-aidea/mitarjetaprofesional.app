import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Generator from './pages/Generator';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Generator />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/:public_id" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
