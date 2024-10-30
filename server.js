const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mysql = require("mysql2");

require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize an SMTP service
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Configure MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // replace with your DB password
    database: process.env.DB_NAME
});

// Function to initialize the database and table
const initializeDatabase = () => {
    db.connect((err) => {
        if (err) {
            console.error("Database connection error:", err);
            return;
        }
        console.log("Connected to MySQL");

        // Create the database if it doesn't exist
        db.query("CREATE DATABASE IF NOT EXISTS messages_db", (err) => {
            if (err) throw err;
            console.log("Database created or already exists");

            // Switch to the new database
            db.changeUser({ database: "messages_db" }, (err) => {
                if (err) throw err;

                // Create the messages table if it doesn't exist
                const createTableQuery = `
                    CREATE TABLE IF NOT EXISTS messages (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        message TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `;
                db.query(createTableQuery, (err) => {
                    if (err) throw err;
                    console.log("Messages table created or already exists");
                });
            });
        });
    });
};

// Initialize database and table on startup
initializeDatabase();

// Simple route to receive messages
app.post("/send-message", (req, res) =>  {
    const { email, message } = req.body;

    // Save the message to MySQL
    const query = "INSERT INTO messages (email, message) VALUES (?, ?)";
    db.query(query, [email, message], (err, result) => {
        if (err) {
            console.error("Error inserting message into database:", err);
            return res.status(500).json({ success: false, message: "Failed to save message to database." });
        }
    })

    // You could save the message to a database here or send an email, etc.
    console.log(`Received message from  (${email}): ${message}`);

    res.status(200).json({ success: true, message: "Message received!" });

    // Set up the email data
    const mailOptions = {
        from: process.env.EMAIL_USER,  // sender address
        to: email,                      // recipient email address
        subject: "Message Received Confirmation",
        text: `Dear Customer,\n\nThank you for your message! We have received it and will get back to you soon.\n\nBest Regards,\nYour APOCARS Team`
    };

    // Send the confirmation email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending confirmation email:", error);
            return res.status(500).json({ success: false, message: "Failed to send confirmation email." });
        }
        console.log("Confirmation email sent:", info.response);
        res.status(200).json({ success: true, message: "Message received and confirmation email sent!" });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});