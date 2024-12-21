import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDash.css';

const AdminDash = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [totalTickets, setTotalTickets] = useState(null);
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [sortBy, setSortBy] = useState({ field: '', order: 'asc' });
    const [editingUser, setEditingUser] = useState(null); // Track the user being edited
    const [editFormData, setEditFormData] = useState({
        username: '',
        fullname: '',
        email: '',
        department: '',
        role: '',
        password: ''
    });
    const [newUser, setNewUser] = useState({
        username: '',
        fullname: '',
        password: '',
        email: '',
        department: '',
        role: ''
    });

    // Fetch data based on the active tab
    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'tickets') {
            fetchTickets(); // Fetch tickets when the tickets tab is active
        }
    }, [activeTab]);

    //--------------------------------ADD USER-----------------------------------

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/admin/users');
            setUsers(res.data);
            setError('');
        } catch (err) {
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    // Function to toggle form visibility
    const handleShowAddUserForm = () => {
        setShowAddUserForm(!showAddUserForm);
    };

    // Function to handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Function to submit the form and add new user
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/admin/users', newUser);
            setShowAddUserForm(false);
            fetchUsers(); // Refresh the user list after adding new user
            setNewUser({ username: '', fullname: '', password: '', email: '', department: '', role: '' });
        } catch (err) {
            setError('Error adding user');
        }
    };

    // Helper function to render table rows for user data
    const renderUserTable = () => {
        return users.map((user) => (
            <tr key={user.user_ID}>
                <td>{user.user_ID}</td>
                <td>{user.username}</td>
                <td>{user.fullname}</td>
                <td>{user.email}</td>
                <td>{user.department}</td>
                <td>{user.role}</td>
                <td>
                <div className="button-container">
                    <button onClick={() => handleEditClick(user)}>Edit</button>
                    <button onClick={() => handleDeleteClick(user.user_ID)}>Delete</button> {/* Added delete button */}
                </div>
            </td>
            </tr>
        ));
    };

    //---------------------------EDIT---------------------------------
    const handleEditClick = (user) => {
        setEditingUser(user.user_ID);
        setEditFormData({
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            department: user.department,
            role: user.role,
            password: '' // Start with empty password
        });
    };

    const handleEditFormChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const updatedData = { ...editFormData };
        if (editFormData.password) {
            updatedData.password = editFormData.password; // Add the password only if it is provided
        }
        try {
            await axios.put(`http://localhost:5000/admin/users/${editingUser}`, updatedData);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            setError('Error updating user');
        }
    };

    // New delete handler with confirmation
    const handleDeleteClick = (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            deleteUser(id);
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/admin/users/${id}`);
            fetchUsers(); // Refresh the user list after deletion
        } catch (err) {
            setError('Error deleting user');
        }
    };

    //------------------------------------TICKETS--------------------------------------

    //Show all tickets
    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/admin/tickets');
            setTickets(res.data);
            setError('');
        } catch (err) {
            setError('Error fetching tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchTotalTickets = async () => {
            try {
                const response = await axios.get('http://localhost:5000/admin/tickets/count');
                setTotalTickets(response.data.totalTickets); // Store the count in state
            } catch (error) {
                console.error('Error fetching ticket count:', error);
            }
        };

        fetchTotalTickets();
    }, []);
    
    //Sort
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

    //--------------------------------LOGOUT--------------------------------
    const handleLogout = () => {
        localStorage.clear(); 
        navigate('/login'); 
    };

    return (
        <div className="admin-dash">
            <div className="logout-container">
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => handleTabChange('users')}
                >
                    Users
                </button>
                <button
                    className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
                    onClick={() => handleTabChange('tickets')}
                >
                    Tickets
                </button>
            </div>

            <div className="content">
                {activeTab === 'users' && (
                    <div>
                        <h2>User Accounts</h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Department</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>{renderUserTable()}</tbody>
                            </table>
                        )}
                        <button onClick={handleShowAddUserForm}>Add New User</button>
                        {showAddUserForm && (
                            <form onSubmit={handleAddUser} className="add-user-form">
                                <h3>Add New User</h3>
                                <label>Username:</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={newUser.username}
                                    onChange={handleInputChange}
                                />
                                <label>Full Name:</label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={newUser.fullname}
                                    onChange={handleInputChange}
                                />
                                <label>Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newUser.password}
                                    onChange={handleInputChange}
                                />
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                />
                                <label>Department:</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={newUser.department}
                                    onChange={handleInputChange}
                                />
                                <label>Role:</label>
                                <select
                                    name="role"
                                    value={newUser.role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="User">User</option>
                                    <option value="Technician">Technician</option>
                                    <option value="Manager">Manager</option>
                                </select>
                                <button type="submit">Add User</button>
                            </form>
                        )}
                        {editingUser && (
                            <div className="edit-modal">
                                <form onSubmit={handleEditSubmit}>
                                    <h3>Edit User</h3>
                                    <label>Username:</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={editFormData.username}
                                        onChange={handleEditFormChange}
                                    />
                                    <label>Full Name:</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={editFormData.fullname}
                                        onChange={handleEditFormChange}
                                    />
                                    <label>Password:</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={editFormData.password || ''}
                                        onChange={handleEditFormChange}
                                        placeholder="Leave blank to keep current password"
                                    />
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editFormData.email}
                                        onChange={handleEditFormChange}
                                    />
                                    <label>Department:</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={editFormData.department}
                                        onChange={handleEditFormChange}
                                    />
                                    <label>Role:</label>
                                    <select
                                        name="role"
                                        value={editFormData.role}
                                        onChange={handleEditFormChange}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="User">User</option>
                                        <option value="Technician">Technician</option>
                                    </select>
                                    <button type="submit">Save Changes</button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'tickets' && (
                <div>
                    <h2>Tickets</h2>
                    <h3>Total Tickets: {totalTickets}</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>User ID</th>
                                    <th>Department</th>
                                    <th>Subject</th>
                                    <th>Category</th>
                                    <th>
                                        <button onClick={() => sortTickets('ticket_urgency')}>Urgency</button>
                                    </th>
                                    <th>Technician</th>
                                    <th>
                                        <button onClick={() => sortTickets('ticket_status')}>Status</button>
                                    </th>
                                    <th>Description</th>
                                    <th>Attachment</th>
                                    <th>
                                        <button onClick={() => sortTickets('date_created')}>Date Created</button>
                                    </th>
                                    <th>
                                        <button onClick={() => sortTickets('date_closed')}>Date Closed</button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => {
                                // Convert the UTC date to local timezone
                                const formatDate = (date) =>
                                    date
                                        ? new Date(date).toLocaleString('en-GB', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: '2-digit',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: false,
                                          })
                                        : 'N/A';
                            
                                const localDate = formatDate(ticket.date_created); // Format date_created
                                const localDateClosed = formatDate(ticket.date_closed); // Format date_closed if available

                                return (
                                    <tr key={ticket.ticket_ID}>
                                        <td>{ticket.ticket_ID}</td>
                                        <td>{ticket.user_ID}</td>
                                        <td>{ticket.department}</td>
                                        <td>{ticket.ticket_subject}</td>
                                        <td>{ticket.ticket_category}</td>
                                        <td>{ticket.ticket_urgency}</td>
                                        <td>{ticket.tech_name}</td>
                                        <td>{ticket.ticket_status}</td>
                                        <td>{ticket.ticket_desc}</td>
                                        <td>{ticket.ticket_attach}</td>
                                        <td>{localDate}</td>
                                        <td>{localDateClosed}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default AdminDash;
