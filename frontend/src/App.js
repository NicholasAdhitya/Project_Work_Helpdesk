import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Loginpage'; 
import UserDashboard from './Pages/User/UserDashboard';
import SuperDash from './Pages/Tech/SuperDash';
import TechnicianDash from './Pages/Tech/TechnicianDash';
import AdminDash from './Pages/Admin/AdminDash';
import ManagerDash from './Pages/Manager/ManagerDash';



function App() {
    return (
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/manager" element={<ManagerDash />} />
                    <Route path="/user" element={<UserDashboard />} />
                    <Route path="/supervisor" element={<SuperDash />} />
                    <Route path="/technician" element={<TechnicianDash />} />
                    <Route path="/admin" element={<AdminDash />} />
                </Routes>
            </Router>
    );
}

export default App;