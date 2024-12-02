/*const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('./index');

// Reads all users
router.get('/admin/users', (req, res) => {
    const query = 'SELECT user_ID, username, fullname, email, role, department FROM user_acc';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ message: 'Error fetching users', details: err.message });
        }
        res.json(results);
    });
});

// Create new user account
router.post('/create-user', (req, res) => {
    const { username, fullname, email, password, department, role } = req.body;

    // Validate input
    if (!username || !fullname || !email || !password || !department || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash password 
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        const query = 'INSERT INTO user_acc (username, fullname, email, password, department, role) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [username, fullname, email, hashedPassword, department, role], (err, result) => {
            if (err) {
                console.error('Error creating user:', err);
                return res.status(500).json({ message: 'Error creating user', details: err.message });
            }
            res.json({ message: 'User created successfully', userId: result.insertId });
        });
    });
});

// Update user account
router.put('/update-user/:userId', (req, res) => {
    const { userId } = req.params;
    const { username, fullname, role, department } = req.body;

    // Validate input
    if (!username || !fullname || !role || !department) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'UPDATE user_acc SET username = ?, fullname = ?, role = ?, department = ? WHERE user_ID = ?';
    db.query(query, [username, fullname, role, department, userId], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Error updating user', details: err.message });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User updated successfully' });
    });
});

// Delete user account
router.delete('/delete-user/:userId', (req, res) => {
    const { userId } = req.params;

    const query = 'DELETE FROM user_acc WHERE user_ID = ?';
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ message: 'Error deleting user', details: err.message });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    });
});

// Fetch all tickets (for admin view)
router.get('/admin/tickets', (req, res) => {
    const query = `
        SELECT ticket.*, user_acc.fullname AS sender_fullname 
        FROM ticket 
        JOIN user_acc ON ticket.user_ID = user_acc.user_ID
        ORDER BY ticket.date_created DESC`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tickets:', err);
            return res.status(500).json({ message: 'Error fetching tickets', details: err.message });
        }
        res.json(results);
    });
});

// Fetch system logs (for admin view)
/*router.get('/logs', (req, res) => {
    const query = 'SELECT * FROM system_logs ORDER BY log_time DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching system logs:', err);
            return res.status(500).json({ message: 'Error fetching system logs', details: err.message });
        }
        res.json(results);
    });
});

module.exports = router;*/
