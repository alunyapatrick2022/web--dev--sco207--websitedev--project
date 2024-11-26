const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const sqlite3 = require("sqlite3").verbose();

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

// Configure SQLite3 connection
const db = new sqlite3.Database("./Database/messages.db", (err) => {
    if (err) {
        console.error("Error connecting to SQLite database:", err.message);
        return;
    }
    console.log("Connected to SQLite database");
});

// Function to initialize the database and table
const initializeDatabase = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    db.run(createTableQuery, (err) => {
        if (err) {
            console.error("Error creating messages table:", err.message);
            return;
        }
        console.log("Messages table created or already exists");
    });
};

// Initialize database and table on startup
initializeDatabase();

// Route to receive messages
app.post("/send-message", (req, res) => {
    const { email, message } = req.body;

    // Save the message to SQLite
    const query = `INSERT INTO messages (email, message) VALUES (?, ?)`;
    db.run(query, [email, message], function (err) {
        if (err) {
            console.error("Error inserting message into database:", err.message);
            return res.status(500).json({ success: false, message: "Failed to save message to database." });
        }

        console.log(`Message saved with ID: ${this.lastID}`);

        // Prepare the email data
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "no-reply@gmail.com",
            text: `Dear Customer,\n\nThank you for your message! We have received it and will get back to you shortly.\n\nThis is an autogenerated system message. Please DO NOT REPLY!\n\nBest Regards,\nYour APOCARS Team`
        };

        const companyMailOptions = {
            from: "no-reply@gmail.com",
            to: process.env.EMAIL_USER,
            subject: "New Message Notification",
            text: `New message received from:\n\nEmail: ${email}\nMessage:\n${message}\n\nThis is an system notification.`
        };

        // Send confirmation email to the customer
        transporter.sendMail(userMailOptions, (error, info) => {
            if (error) {
                console.error("Error sending confirmation email:", error);
                return res.status(500).json({ success: false, message: "Failed to send confirmation email." });
            }
            console.log("Confirmation email sent:", info.response);

            // Send notification email to the company
            transporter.sendMail(companyMailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending notification email:", error);
                    return res.status(500).json({ success: false, message: "Message saved but failed to send notification email." });
                }
                console.log("Notification email sent to company:", info.response);
                res.status(200).json({ success: true, message: "Message received, saved, and emails sent!" });
            });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
