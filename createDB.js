// createDB.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("matchaMelb.db");

// Create Reviews Table
const createReviewsTable = `
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT NOT NULL,
    venue TEXT NOT NULL,
    review TEXT NOT NULL,
    rating INTEGER NOT NULL,
    timestamp TEXT DEFAULT (datetime('now', 'localtime'))
  );
`;

// Create Subscribers Table
const createSubscribersTable = `
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    timestamp TEXT DEFAULT (datetime('now', 'localtime'))
  );
`;

// Run SQL to create tables
db.serialize(() => {
  db.run(createReviewsTable, (err) => {
    if (err) console.error("Error creating reviews table:", err);
    else console.log("✅ reviews table created successfully.");
  });

  db.run(createSubscribersTable, (err) => {
    if (err) console.error("Error creating subscribers table:", err);
    else console.log("✅ subscribers table created successfully.");
  });
});

// Close connection
db.close();
