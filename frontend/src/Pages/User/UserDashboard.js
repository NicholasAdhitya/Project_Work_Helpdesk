import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserDashboard.css';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [fullname, setFullname] = useState('');
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketDesc, setTicketDesc] = useState('');
    const [ticketCategory, setTicketCategory] = useState('');
    const [ticketUrgency, setTicketUrgency] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [technicians, setTechnicians] = useState([]); // Store fetched technicians
    const [selectedTechnician, setSelectedTechnician] = useState(''); // Store selected technician
    const [tickets, setTickets] = useState([]); // Store fetched tickets
    const [sortBy, setSortBy] = useState({ field: '', order: 'asc' });

    // Fetch user info and tickets
    useEffect(() => {
        const userId = localStorage.getItem('user_ID');
        console.log('User ID:', userId); // Log user ID to check if it’s being retrieved

        if (!userId) {
            console.error('No user ID found in localStorage');
            setError('User not logged in or missing user ID');
            return;
        }

        // Fetch user information
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/user/${userId}`);
                console.log('User Info Response:', response.data); // Log response data
                setFullname(response.data.fullname); // Set user fullname
            } catch (error) {
                console.error('Error fetching user info:', error);
                setError('Error fetching user information.');
            }
        };

        fetchUserInfo();

        // Fetch user tickets
        const fetchUserTickets = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/user-tickets/${userId}`);
                setTickets(response.data); // Set fetched tickets
            } catch (error) {
                console.error('Error fetching user tickets:', error);
                setError('Error fetching user tickets.');
            }
        };

        fetchUserTickets();
    }, []);

    // Fetch technicians based on selected category
    useEffect(() => {
        if (ticketCategory) {
            const fetchTechnicians = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/technicians/${ticketCategory}`);
                    console.log('Technicians fetched:', response.data); // Log technicians
                    setTechnicians(response.data); // Set technicians based on category
                } catch (error) {
                    console.error('Error fetching technicians:', error);
                    setError('Error fetching technicians.');
                }
            };

            fetchTechnicians();
        } else {
            setTechnicians([]); // Clear technicians if no category selected
        }
    }, [ticketCategory]); // Dependency on ticketCategory to refetch technicians

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (!ticketSubject || !ticketDesc || !ticketCategory || !ticketUrgency || !selectedTechnician) {
            setError('Please fill in all required fields.');
            return;
        }

        const formData = new FormData();
        formData.append('user_ID', localStorage.getItem('user_ID')); // Add user_ID
        formData.append('ticket_subject', ticketSubject);
        formData.append('ticket_desc', ticketDesc);
        formData.append('ticket_category', ticketCategory);
        formData.append('ticket_urgency', ticketUrgency);
        formData.append('tech_name', selectedTechnician);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            const response = await axios.post('http://localhost:5000/create-ticket', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message);
            // Reset form fields after successful submission
            setTicketSubject('');
            setTicketDesc('');
            setTicketCategory('');
            setTicketUrgency('');
            setSelectedTechnician('');
            setAttachment(null);

            // Update ticket list
            const userId = localStorage.getItem('user_ID');
            const updatedTickets = await axios.get(`http://localhost:5000/user-tickets/${userId}`);
            setTickets(updatedTickets.data); // Update ticket list with new ticket
        } catch (error) {
            console.error('Error creating ticket:', error);
            setError('Error creating ticket. Please try again.');
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

    //Mark Confirmation
    const handleMarkAsDone = (ticket_ID) => {
        if (window.confirm("Are you sure?")) {
            axios.put(`http://localhost:5000/tickets/${ticket_ID}/close`)
                .then(response => {
                    alert("Ticket closed successfully!");
                    setTickets(tickets.map(ticket =>
                        ticket.ticket_ID === ticket_ID ? { ...ticket, ticket_status: 'Closed' } : ticket
                    ));
                })
                .catch(error => {
                    console.error('Error closing ticket:', error);
                    alert('Failed to close the ticket.');
                });
        }
    };

    //------------------------------------LOGOUT-------------------------------
    const handleLogout = () => {
        // Clear any authentication tokens or user data (if applicable)
        localStorage.removeItem('token'); //
        navigate('/login'); // 
    };

return (
    <div>
        {/* Main Content */}
        <div className="App-header">
            <div className="logout-container">
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
            <h1>User Dashboard</h1>
            {fullname && <h2>Welcome, {fullname}</h2>}

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            {/* Form for creating tickets */}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Subject:</label>
                    <input
                        type="text"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        value={ticketDesc}
                        onChange={(e) => setTicketDesc(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Category:</label>
                    <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="Software">Software</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Network">Network</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Technician:</label>
                    <select
                        value={selectedTechnician}
                        onChange={(e) => setSelectedTechnician(e.target.value)}
                        required
                        disabled={!ticketCategory}
                    >
                        <option value="">Select a technician</option>
                        {technicians.length > 0 ? (
                            technicians.map((technician, index) => (
                                <option key={index} value={technician.fullname}>
                                    {technician.fullname}
                                </option>
                            ))
                        ) : (
                            <option value="">(Choose category first)</option>
                        )}
                    </select>
                </div>
                <div className="form-group">
                    <label>Urgency:</label>
                    <select
                        value={ticketUrgency}
                        onChange={(e) => setTicketUrgency(e.target.value)}
                        required
                    >
                        <option value="">Select urgency level</option>
                        <option value="Rendah">Rendah</option>
                        <option value="Sedang">Sedang</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Attachment:</label>
                    <input
                        type="file"
                        onChange={(e) => setAttachment(e.target.files[0])}
                    />
                </div>
                <button type="submit">Create Ticket</button>
            </form>

            {/* Ticket tracking section */}
            <h2>Your Tickets</h2>
            {tickets.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Attachment</th>
                            <th><button onClick={() => sortTickets('ticket_urgency')}>Urgency</button></th>
                            <th><button onClick={() => sortTickets('ticket_status')}>Status</button></th>
                            <th>Date Created</th>
                            <th>Date Closed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket.ticket_ID}>
                                <td>{ticket.ticket_subject}</td>
                                <td>{ticket.ticket_desc}</td>
                                <td>{ticket.ticket_category}</td>
                                <td>{ticket.attachment}</td>
                                <td>{ticket.ticket_urgency}</td>
                                <td>
                                    {ticket.ticket_status === 'Open' && <span>Open</span>}
                                    {ticket.ticket_status === 'In Progress' && <span>In Progress</span>}
                                    {ticket.ticket_status === 'Done' && (
                                        <button onClick={() => handleMarkAsDone(ticket.ticket_ID)}>
                                            Mark as Done
                                        </button>
                                    )}
                                    {ticket.ticket_status === 'Closed' && <span>Closed</span>}
                                </td>
                                <td>{new Date(ticket.date_created).toLocaleString('en-GB', { 
                                        day: '2-digit', 
                                        month: '2-digit', 
                                        year: 'numeric', 
                                        hour: '2-digit', 
                                        minute: '2-digit', 
                                        hour12: false 
                                    })}
                                </td>
                                <td>{ticket.ticket_status === "Closed" ? (
                                    ticket.date_closed ? (
                                        new Date(ticket.date_closed).toLocaleString('en-GB', { 
                                        day: '2-digit', 
                                        month: '2-digit', 
                                        year: 'numeric', 
                                        hour: '2-digit', 
                                        minute: '2-digit', 
                                        hour12: false 
                                    })
                                    ) : (
                                        "Not available"
                                    )
                                    ) : (
                                    "N/A"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No tickets found.</p>
            )}
        </div>
    </div>
);
};

export default UserDashboard;
