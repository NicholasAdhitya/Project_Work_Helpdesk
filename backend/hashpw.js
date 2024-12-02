const bcrypt = require('bcrypt');

const password = '87654321'; // Replace with the technician's password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed password:', hash);
    // You can also add code here to update the password in your database if needed
});