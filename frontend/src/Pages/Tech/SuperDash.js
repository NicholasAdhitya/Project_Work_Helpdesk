import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SuperDash = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [techName] = useState(localStorage.getItem('tech_name'));  // Supervisor name
    const [technicians, setTechnicians] = useState([]);  // List of technicians
    const [message, setMessage] = useState('');

    // Fetch tickets and technicians
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tickets');  // Fetch all tickets
                setTickets(response.data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            }
        };

        const fetchTechnicians = async () => {
            try {
                const response = await axios.get('http://localhost:5000/technicians');  // Fetch all technicians
                setTechnicians(response.data);
            } catch (error) {
                console.error('Error fetching technicians:', error);
            }
        };

        fetchTickets();
        fetchTechnicians();
    }, []);

    // Update ticket urgency
    const handleUpdateUrgency = async (ticketId, newUrgency) => {
        try {
            await axios.put(`http://localhost:5000/tickets/${ticketId}`, { ticket_urgency: newUrgency });
            setMessage('Ticket urgency updated successfully');
            const response = await axios.get('http://localhost:5000/tickets');  // Re-fetch tickets
            setTickets(response.data);
        } catch (error) {
            console.error('Error updating urgency:', error);
        }
    };

    // Update ticket status
    const handleStatusChange = async (ticket_ID, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/tickets/${ticket_ID}/status`, { ticket_status: newStatus });
            setTickets(tickets.map(ticket =>
                ticket.ticket_ID === ticket_ID ? { ...ticket, ticket_status: newStatus } : ticket
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Assign a technician to a ticket
    const handleAssignTechnician = async (ticketId, technicianId) => {
        try {
            await axios.put(`http://localhost:5000/tickets/${ticketId}/assign`, { technician_id: technicianId });
            setMessage('Technician assigned successfully');
            const response = await axios.get('http://localhost:5000/tickets');  // Re-fetch tickets
            setTickets(response.data);
        } catch (error) {
            console.error('Error assigning technician:', error);
        }
    };

    // Logout and clear localStorage
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div>
            <h1>Supervisor Technician Dashboard</h1>
            <h2>{techName}</h2>
            {message && <p>{message}</p>}
            <div className="logout-container">
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Subject</th>
                        <th>Description</th>
                        <th>Attachment</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Assign Technician</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => (
                        <tr key={ticket.ticket_ID}>
                            <td>{ticket.sender_fullname}</td>
                            <td>{ticket.ticket_subject}</td>
                            <td>{ticket.ticket_desc}</td>
                            <td>{ticket.attachment}</td>
                            <td>
                                <select
                                    value={ticket.ticket_urgency || "Rendah"}
                                    onChange={(e) => handleUpdateUrgency(ticket.ticket_ID, e.target.value)}
                                >
                                    <option value="Rendah">Rendah</option>
                                    <option value="Sedang">Sedang</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </td>
                            <td>
                                <select 
                                    value={ticket.ticket_status} 
                                    onChange={(e) => handleStatusChange(ticket.ticket_ID, e.target.value)}
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </td>
                            <td>
                                <select 
                                    value={ticket.assigned_technician || ''}  // Assigned technician field
                                    onChange={(e) => handleAssignTechnician(ticket.ticket_ID, e.target.value)}
                                >
                                    <option value="">Select Technician</option>
                                    {technicians.map(technician => (
                                        <option key={technician.user_ID} value={technician.user_ID}>
                                            {technician.tech_name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                {/* Any additional actions */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SuperDash;
