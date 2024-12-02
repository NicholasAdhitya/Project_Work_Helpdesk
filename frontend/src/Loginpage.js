import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//import { useAuth } from './AuthContext';
import './Loginpage.css';

const Loginpage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');
    
        try {
            const response = await axios.post('http://localhost:5000/login', {
                username,
                password,
            });
    
            console.log('Login response:', response.data);
    
            // Store token and user ID in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_ID', response.data.user_ID); // Ensure user_ID is stored
            localStorage.setItem('role', response.data.role); // Optional: Store role if needed for other purposes

            if (response.data.role === 'Technician') {
                localStorage.setItem('tech_name', response.data.tech_name); // Store technician's full name
            }
            
            
            // Log localStorage content to verify what is stored
            console.log('Stored in localStorage:', {
                token: localStorage.getItem('token'),
                user_ID: localStorage.getItem('user_ID'),
                role: localStorage.getItem('role'),
            });
            
            //redirect pages
            const role = response.data.role;
    
            if (role === 'Admin') {
                navigate('/admin'); 
            } else if (role === 'Technician') {
                navigate('/technician');
            } else if (role === 'Supervisor') {
                navigate('/supervisor'); 
            } else if (role === 'Manager') {
                navigate('/manager');
            } else {
                navigate('/user'); 
            }
        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err);
            setError(err.response ? err.response.data.message : 'An error occurred');
        }
    };
    

    return (
        <div className="login-container">
            <h2>Helpdesk Support</h2>
            {error && <p className="visible">{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Username"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                    />
                </div>
                <button type="submit">Login</button>
            </form>

        </div>
    );
};

export default Loginpage;
