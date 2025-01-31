import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TechnicianDash.css';

const TechnicianDashboard = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [techName] = useState(localStorage.getItem('tech_name')); // Now fetching tech_name from localStorage
    const [message, setMessage] = useState('');
    const [sortBy, setSortBy] = useState({ field: '', order: 'asc' });
    console.log('Tech Name:', techName);
    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/tickets/${techName}`);
                console.log('Tickets Response:', response.data); // Log the response data
                setTickets(response.data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            }
        };

        fetchTickets();
    }, [techName]);

    const handleUpdateUrgency = async (ticketId, newUrgency) => {
        try {
            await axios.put(`http://localhost:5000/tickets/${ticketId}`, { ticket_urgency: newUrgency });
            setMessage('Ticket urgency updated successfully');
            // Re-fetch tickets after updating
            const response = await axios.get(`http://localhost:5000/tickets/${techName}`);
            setTickets(response.data);
        } catch (error) {
            console.error('Error updating urgency:', error);
        }
    };

    // Function to update ticket status
    const handleStatusChange = async (ticket_ID, newStatus) => {
        try {
            const updateData = { ticket_status: newStatus };

            // If the new status is "Done," add the current date to the update
            if (newStatus === "Done") {
                updateData.date_done = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format date for MySQL
            }

            await axios.put(`http://localhost:5000/tickets/${ticket_ID}/status`, updateData);
            setTickets(tickets.map(ticket =>
                ticket.ticket_ID === ticket_ID ? { ...ticket, ticket_status: newStatus, date_done: updateData.date_done || ticket.date_done } : ticket
            ));
            setMessage('Ticket status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    //Sort Ticket
    const sortTickets = (field) => {
        const newOrder = sortBy.field === field && sortBy.order === 'asc' ? 'desc' : 'asc';
        setSortBy({ field, order: newOrder });
    
        const sortedTickets = [...tickets].sort((a, b) => {
            if (newOrder === 'asc') {
                return a[field] > b[field] ? 1 : -1;
            } else {
                return a[field] < b[field] ? 1 : -1;
            }
        });
        setTickets(sortedTickets);
    };

    //Logout
    const handleLogout = () => {
        localStorage.clear(); 
        navigate('/login');
    }

    return (
        <div>
            <h1>Technician Dashboard </h1>
            <h2>{techName}</h2>
            {message && <p>{message}</p>}
            <div className="logout-container">
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Ticket ID</th>
                        <th>Name</th>
                        <th>Subject</th>
                        <th>Description</th>
                        <th>Attachement</th>
                        <th><button onClick={() => sortTickets('ticket_urgency')}>Urgency</button></th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                {tickets.map(ticket => (
                    <tr key={ticket.ticket_ID}>
                        <td>{ticket.ticket_ID}</td>
                        <td>{ticket.sender_fullname}</td>
                        <td>{ticket.ticket_subject}</td>
                        <td>{ticket.ticket_desc}</td>
                        <td>{ticket.attachment && ticket.attachment.trim() !== '' ? (
                                // Display attachment as a link or an image
                                
                                <a href={ticket.attachment} target="_blank" rel="noopener noreferrer">
                                    View Attachment
                                </a>
                                ) : (
                                    <span>No Attachment</span>
                                )}</td>
                        <td>
                            {/* Check if the logged-in user is a 'user' (not a technician) */}
                            {role === 'user' ? (
                                <select
                                    value={ticket.ticket_urgency || "Rendah"} // Provide a default value if ticket_urgency is null or undefined
                                    onChange={(e) => handleUpdateUrgency(ticket.ticket_ID, e.target.value)}
                                >
                                    <option value="Rendah">Rendah</option>
                                    <option value="Sedang">Sedang</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            ) : (
                                // If logged in as a technician, display the urgency as plain text
                                <span>{ticket.ticket_urgency}</span>
                            )}
                            </td>
                            <td>
                            {ticket.ticket_status === "Closed" ? (
                                // Render a span element for 'Closed' tickets
                                <span>{ticket.ticket_status}</span>
                            ) : (
                                // Render a dropdown for non-closed tickets
                                <select 
                                    value={ticket.ticket_status} 
                                    onChange={(e) => handleStatusChange(ticket.ticket_ID, e.target.value)}
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TechnicianDashboard;
