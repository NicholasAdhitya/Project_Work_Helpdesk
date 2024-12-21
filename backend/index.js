const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cron = require('node-cron');

//const adminRoutes = require('./adminRoutes');

const app = express();
const port = 5000;
//const allowedOrigins = ['http://localhost:3000', 'http://192.168.100.168:3000']; // Add both origins


// Middleware
app.use(cors());
/*app.use(cors({
    origin: 'http://192.168.50.254:3000' ,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'] // The IP of the second PC
}));
app.use(cors({
    origin: function(origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            // Allow requests from both origins and non-browser requests (e.g., Postman)
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));*/
// This handles preflight requests (OPTIONS)
app.options('*', cors());
app.get('/test-cors', (req, res) => {
    res.json({ message: 'CORS is working' });
});
app.use(express.json());
app.use(express.static('uploads')); // Serve uploaded files from the 'uploads' directory



// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql2704',
    database: 'helpdesk'
});

//Routes
//app.use('/admin', adminRoutes);

// Log MySQL
db.connect(err => {
    if (err) {
        console.log('Database connection failed: ', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

//------------------------------------LOGIN---------------------------------------------

// Route for user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Received:', { username, password });

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Query the database for the username
    db.query('SELECT * FROM user_acc WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        // Compare the hashed password with the one in the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }

            // Check user role
            const role = user.role;

            // If the role is not recognized, return an error
            if (role !== 'Technician' && role !== 'User' && role !== 'Supervisor' && role !== 'Admin' && role !== 'Manager') {
                return res.status(400).json({ message: 'Invalid user role' });
            }

            // If password and role are correct, generate a JWT token with role info
            const token = jwt.sign({ userID: user.user_ID, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

            const tech_name = (role === 'Technician' || role === 'Supervisor') ? user.fullname : null;


            // Send token, user_ID, and role to the client
            res.json({
                message: 'Login successful',
                token,
                user_ID: user.user_ID, 
                role: user.role,
                tech_name, // Send the tech_name if available
            });
            
        });
    });
});

//-----------------------------TICKET FEATURE-------------------------------

// Multer Attachment for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Upload folder
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Fetch user info by ID
app.get('/user/:userId', (req, res) => {
    const { userId } = req.params;

    db.query('SELECT fullname FROM user_acc WHERE user_ID = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user info:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(results[0]);
    });
});

// Fetch technicians based on category
app.get('/technicians/:category', (req, res) => {
    const { category } = req.params;

    // Query to fetch technicians based on role and category
    const query = 
    `SELECT fullname FROM user_acc WHERE role = 'Technician' AND category = ?`;

    db.query(query, [category], (err, results) => {
        if (err) {
            console.error('Error fetching technicians:', err);
            return res.status(500).json({ error: 'Error fetching technicians.' });
        }

        // Return the technician names to the frontend
        res.json(results);
    });
});

// Technicians to mark ticket as 'Done'
app.put('/tickets/:ticket_ID/status', (req, res) => {
    const { ticket_ID } = req.params;
    const { ticket_status } = req.body;

    const date_done = ticket_status === "Done" ? new Date() : null; // Set date_done only if status is "Done"

    const query = `
        UPDATE ticket 
        SET ticket_status = ?, date_done = ?
        WHERE ticket_ID = ?
    `;
    const values = [ticket_status, date_done, ticket_ID];

    db.query(query, values, (error, results) => {
        if (error) {
            console.error('Error updating ticket status:', error);
            return res.status(500).json({ message: 'Error updating ticket status' });
        }

        res.json({ message: 'Ticket status updated successfully', results });
    });
});

//User confirmation ticket
app.put('/tickets/:ticket_ID/close', (req, res) => {
    const { ticket_ID } = req.params;

    // Validate ticket_ID
    if (isNaN(ticket_ID)) {
        return res.status(400).json({ message: 'Invalid ticket ID' });
    }

    const query = `
        UPDATE ticket 
        SET ticket_status = 'Closed', date_done = NOW(), date_closed = NOW() 
        WHERE ticket_ID = ? AND ticket_status = 'Done'
    `;

    db.query(query, [ticket_ID], (err, result) => {
        if (err) {
            console.error(`Error closing ticket with ID ${ticket_ID}:`, err);
            return res.status(500).json({ message: 'Error closing ticket' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ticket not found or already closed' });
        }

        // Fetch updated ticket data
        const selectQuery = 'SELECT * FROM ticket WHERE ticket_ID = ?';
        db.query(selectQuery, [ticket_ID], (err, updatedResult) => {
            if (err) {
                console.error('Error fetching updated ticket data:', err);
                return res.status(500).json({ message: 'Error fetching updated ticket data' });
            }

            res.json({
                message: 'Ticket successfully closed',
                ticket: updatedResult[0],
            });
        });
    });
});

// Ticket creation logic
app.post('/create-ticket', upload.single('attachment'), (req, res) => {
    const { user_ID, ticket_subject, ticket_desc, ticket_category, ticket_urgency, tech_name } = req.body;
    let finalTicketStatus = 'Open'; 
    const ticket_attach = req.file ? req.file.filename : null; // File name from Multer

    console.log('Received user_ID:', user_ID); // Log the user_ID
    console.log('Attachment received:', req.file); // Log the attachment

    // Validate user_ID and get department (username)
    const userQuery = 'SELECT username, fullname, department FROM user_acc WHERE user_ID = ?';
    db.query(userQuery, [user_ID], (err, userResult) => {
        if (err || userResult.length === 0) {
            console.error('User query error:', err); // Log user query error
            return res.status(400).json({ error: 'Invalid user_ID' });
        }

        const department = userResult[0].department;

        // Fetch technician name based on fullname and role
        const techQuery = 'SELECT fullname FROM user_acc WHERE fullname = ? AND role = "Technician"';
        db.query(techQuery, [tech_name], (err, techResult) => {
            if (err || techResult.length === 0) {
                console.error('Technician query error:', err); 
                console.error('Tech name:', tech_name);// Log technician query error

                return res.status(400).json({ error: 'Invalid technician' });
            }

            const techFullName = techResult[0].fullname; // Technician's full name
            console.log('Technician found:', techFullName); // Log the found technician's name

            // Log ticket data before insertion
            console.log('Ticket data:', {
                user_ID,
                department,
                ticket_subject,
                ticket_category,
                ticket_urgency,
                techFullName,
                finalTicketStatus,
                ticket_desc,
                ticket_attach,
            });

            // SQL query to insert a new ticket
            const query = `
                INSERT INTO ticket (user_ID, department, ticket_subject, ticket_category, ticket_urgency, tech_name, ticket_status, ticket_desc, ticket_attach, date_created)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            db.query(query, [user_ID, department, ticket_subject, ticket_category, ticket_urgency, techFullName, finalTicketStatus, ticket_desc, ticket_attach], (err, result) => {
                if (err) {
                    console.error('Error creating ticket:', err); // Log error details
                    return res.status(500).json({ error: 'Error creating ticket', details: err.message });
                }
                res.json({ message: 'Ticket created successfully', ticket_ID: result.insertId });
            });
        });
    });
});


// Fetch tickets created by a specific user
app.get('/user-tickets/:userId', (req, res) => {
    const { userId } = req.params;

    const query = `SELECT * FROM ticket WHERE user_ID = ? ORDER BY date_created DESC`;
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user tickets:', err);
            return res.status(500).json({ message: 'Error fetching user tickets' });
        }
        
        res.json(results); // Return the tickets to the frontend
    });
});

// Auto-Close Function
const autoCloseTickets = () => {
    const daysToAutoClose = 1; // Adjust this as needed
    const currentDate = new Date();
    console.log(`Auto-close check started at ${currentDate}`);

    db.query(
        `SELECT ticket_ID, date_done 
         FROM ticket 
         WHERE ticket_status = 'Done' AND date_closed IS NULL`,
        (err, results) => {
            if (err) {
                console.error('Error fetching tickets for auto-close:', err);
                return;
            }

            results.forEach(ticket => {
                const dateDone = new Date(ticket.date_done);
                const diffInDays = Math.floor((currentDate - dateDone) / (1000 * 60 * 60 * 24));

                if (diffInDays >= daysToAutoClose) {
                    // Update the ticket status to Closed
                    db.query(
                        `UPDATE ticket SET ticket_status = 'Closed', date_closed = ? WHERE ticket_ID = ?`,
                        [currentDate, ticket.ticket_ID],
                        (updateErr, result) => {
                            if (updateErr) {
                                console.error(`Error auto-closing ticket ${ticket.ticket_ID}:`, updateErr);
                            } else {
                                console.log(`Ticket ${ticket.ticket_ID} auto-closed successfully.`);
                            }
                        }
                    );
                }
            });
        }
    );
};

// Schedule Auto-Close to Run Daily
cron.schedule('0 0 * * *', () => {
    console.log('Running auto-close tickets');
    autoCloseTickets();
});

// Example API to Test Manual Fetch for Auto-Close (Optional for Debugging)
app.get('/test-autoclose', (req, res) => {
    autoCloseTickets();
    res.send('Auto-close logic triggered');
});

//-----------------------------TECHNICIAN FEATURE----------------------------

// Fetch tickets assigned to a technician
app.get('/tickets/:techName', (req, res) => {
    const techName = req.params.techName;
    const query = `
        SELECT ticket.*, user_acc.fullname AS sender_fullname 
        FROM ticket 
        JOIN user_acc ON ticket.user_ID = user_acc.user_ID 
        WHERE ticket.tech_name = ?
    `;

    db.query(query, [techName], (err, results) => {
        if (err) {
            console.error('Error fetching tickets:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json(results);
    });
});

// Route to update ticket status at /tickets/:ticket_ID/status
app.route('/tickets/:ticket_ID/status')
    .put((req, res) => {
        const { ticket_ID } = req.params;
        const { ticket_status } = req.body;

        const query = `UPDATE ticket SET ticket_status = ? WHERE ticket_ID = ?`;

        db.query(query, [ticket_status, ticket_ID], (err, result) => {
            if (err) {
                console.error('Error updating ticket status:', err);
                return res.status(500).json({ message: 'Error updating ticket status' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Ticket not found' });
            }

            res.json({ message: 'Ticket status updated successfully' });
        });
    });

// Route to delete a ticket by ticket_ID
app.delete('/tickets/:ticket_ID', (req, res) => {
    const { ticket_ID } = req.params;

    const query = `DELETE FROM ticket WHERE ticket_ID = ?`;

    db.query(query, [ticket_ID], (err, result) => {
        if (err) {
            console.error('Error deleting ticket:', err);
            return res.status(500).json({ message: 'Error deleting ticket' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json({ message: 'Ticket deleted successfully' });
    });
});

// ----------------------------- ADMIN FEATURE ------------------------------------

// Fetch all users
app.get('/admin/users', (req, res) => {
    const query = `SELECT user_ID, username, fullname, email, department, role FROM user_acc`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ message: 'Error fetching users' });
        }

        res.json(results); // Return all users, including Admin roles, to the frontend
    });
});

// Add a new user
app.post('/admin/users', async (req, res) => {
    const { username, fullname, password, email, department, role } = req.body;

    try {
        // Hash the password with a salt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user with hashed password
        const query = `
            INSERT INTO user_acc (username, fullname, password, email, department, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [username, fullname, hashedPassword, email, department, role], (err, result) => {
            if (err) {
                console.error('Error adding user:', err);
                return res.status(500).json({ message: 'Error adding user' });
            }
            res.status(201).json({ message: 'User added successfully' });
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).json({ message: 'Error processing user data' });
    }
});

// Edit user
app.put('/admin/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, fullname, email, department, role, password } = req.body;

    // Prepare values for the query
    let query = `
        UPDATE user_acc 
        SET username = ?, fullname = ?, email = ?, department = ?, role = ?`;
    const values = [username, fullname, email, department, role];

    // If password is provided, hash it and add to the query
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += `, password = ?`;
        values.push(hashedPassword);
    }

    query += ` WHERE user_ID = ?`;
    values.push(id);

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Error updating user' });
        }
        res.json({ message: 'User updated successfully' });
    });
});

// Delete user
app.delete('/admin/users/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM user_acc WHERE user_ID = ?`;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ message: 'Error deleting user' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// Fetch all tickets
app.get('/admin/tickets', (req, res) => {
    const sql = 'SELECT * FROM ticket';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching tickets' });
        }
        res.json(results);
    });
});

//Ticket sort
app.get('/sort-tickets', async (req, res) => {
    const { status } = req.query;

    try {
        let query = `SELECT * FROM ticket`;
        const params = [];

        // If a status is provided, add a WHERE clause
        if (status) {
            query += ` WHERE ticket_status = ?`;
            params.push(status);
        }

        const [tickets] = await db.query(query, params);
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching sorted tickets:', error);
        res.status(500).json({ error: 'Error fetching sorted tickets' });
    }
});

//Ticket total
app.get('/admin/tickets/count', async (req, res) => {
    try {
        const [result] = await db.promise().query('SELECT COUNT(*) AS totalTickets FROM ticket');
        res.json({ totalTickets: result[0].totalTickets });
    } catch (error) {
        console.error("Error fetching ticket count:", error.message);
        res.status(500).json({ message: 'Error fetching ticket count' });
    }
});

/* Server Feedback
app.get('/', (req, res) => {
    res.send('Welcome to the Helpdesk API!');
});*/

// Start the server
app.listen(port,'0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});
