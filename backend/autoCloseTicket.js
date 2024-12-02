/*
const cron = require('node-cron');
const db = require('./index');


// Define the task variable globally
let task;

const scheduleAutoClose = () => {
    if (!task || !task.running) { // Only schedule if it's not already running
        task = cron.schedule('/1 * * * *', async () => {  // Example for daily task
            try {
                const minutesThreshold = 1;
                const cutoffDate = new Date();
                cutoffDate.setMinutes(cutoffDate.getMinutes() - minutesThreshold);

                const [result] = await db.query(
                    `UPDATE ticket 
                     SET ticket_status = "Closed"
                     WHERE ticket_status = "Done" 
                     AND date_created <= ?`,
                    [cutoffDate]
                );

                console.log(`${result.affectedRows} tickets auto-closed`);
            } catch (error) {
                console.error('Error in auto-closing tickets:', error);
            }
        });

        console.log('Auto-closing tickets job scheduled.');
    } else {
        console.log('Auto-closing tickets job is already scheduled.');
    }
};

// Function to stop the auto-closing schedule
const stopAutoClose = () => {
    if (task && task.running) {
        task.stop();
        console.log('Auto-close schedule stopped.');
    } else {
        console.log('No active schedule to stop.');
    }
};

// Export the functions
module.exports = { scheduleAutoClose, stopAutoClose }; */