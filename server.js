const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

const app = express();

// Use CORS middleware
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'moko2024',
    database: 'ict_expense_tracker'
});

db.connect(err => {
    if (err) {
        console.error('Failed to connect to MySQL:', err);
        throw err;
    }
    console.log('MySQL Connected...');
});

// Route to handle form submissions
app.post('/add-expense', (req, res) => {
    const expense = req.body;
    const sql = 'INSERT INTO expenses (date, category, description, vendor, cost, invoice_number, pr_number) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [expense.date, expense.category, expense.description, expense.vendor, expense.cost, expense.invoiceNumber, expense.prNumber], (err, result) => {
        if (err) {
            console.error('Failed to add expense:', err);
            return res.status(500).send('Failed to add expense');
        }
        res.send('Expense successfully added!');
    });
});

// Route to handle downloading expenses as CSV
app.get('/download-expenses', (req, res) => {
    const sql = 'SELECT * FROM expenses';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Failed to retrieve expenses:', err);
            return res.status(500).send('Failed to retrieve expenses');
        }
        
        // Define the CSV writer
        const csvWriterInstance = createObjectCsvWriter({
            path: path.join(__dirname, 'expenses.csv'),
            header: [
                { id: 'date', title: 'Date' },
                { id: 'category', title: 'Category' },
                { id: 'description', title: 'Description' },
                { id: 'vendor', title: 'Vendor' },
                { id: 'cost', title: 'Cost' },
                { id: 'invoice_number', title: 'Invoice Number' },
                { id: 'pr_number', title: 'PR Number' }
            ]
        });
        
        // Write records to CSV
        csvWriterInstance.writeRecords(results)
            .then(() => {
                console.log('CSV file was written successfully');
                res.download(path.join(__dirname, 'expenses.csv'), 'expenses.csv', (err) => {
                    if (err) {
                        console.error('Error downloading file:', err);
                    }
                    // Optionally, delete the file after download
                    fs.unlink(path.join(__dirname, 'expenses.csv'), unlinkErr => {
                        if (unlinkErr) {
                            console.error('Error deleting file:', unlinkErr);
                        }
                    });
                });
            })
            .catch(err => {
                console.error('Failed to generate CSV file:', err);
                res.status(500).send('Failed to generate CSV file');
            });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
