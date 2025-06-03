// ========== MODULE IMPORTS ==========

// Import the Express framework for creating the web server
const express = require("express");
// Use Morgan middleware for logging HTTP requests to the console
const morgan = require("morgan");
// Path module helps with resolving file/directory paths
const path = require("path");
// Body-parser middleware allows access to submitted form data via req.body
const bodyParser = require("body-parser");
// Module for connecting to the SQLite3 database
const sqlite3 = require("sqlite3").verbose();

// Create an instance of an Express application
const app = express();
const port = 3000; // The port number the server will listen on

// ========== TEMPLATE ENGINE SETUP ==========

// Set the directory that contains EJS template files
app.set("views", path.join(__dirname, "views"));
// Set EJS as the templating/view engine for dynamic rendering
app.set("view engine", "ejs");

// ========== MIDDLEWARE ==========

// Use Morgan to log HTTP requests (method, URL, status, etc.)
app.use(morgan("common"));
// Parse URL-encoded data (submitted via form POST)
app.use(bodyParser.urlencoded({ extended: false }));
// Serve static files (e.g., CSS, images, JS) from the "public" folder
app.use(express.static("public"));
// Make `req` available to all EJS templates
app.use((req, res, next) => {
  res.locals.req = req;
  next();
});

// ========== DATABASE CONNECTION ==========

// Connect to the SQLite database file
const db = new sqlite3.Database(
  "./matchaMelb.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error("❌ Failed to connect to database:", err.message);
      throw err;
    }
    console.log("✅ Connected to matchaMelb database.");
  }
);

// ========== PAGE ROUTES ==========

// Render the homepage
app.get("/", (req, res) => {
  res.render("index", {
    title: "MatchaMelb | Discover the Best Matcha Spots in Melbourne",
  });
});

// Render the About page
app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us | MatchaMelb",
  });
});

// Render the Recipes page
app.get("/recipes", (req, res) => {
  res.render("recipes", {
    title: "Matcha Recipes & Ideas | MatchaMelb",
  });
});

// Render the Wiki page
app.get("/wiki", (req, res) => {
  res.render("wiki", { title: "Developer Wiki | MatchaMelb" });
});

// ========== FORM HANDLING ROUTE | REVIEW ==========

// This route handles POST submissions from the review form on the homepage
app.post("/submitreview", (req, res) => {
  // Extract form data from the request body
  const { name, email, phone, country, venue, review, rating } = req.body;
  const errors = [];

  // Validate required fields — ensure no critical input is left blank
  if (!name) errors.push("Name is required.");
  if (!email) errors.push("Email is required.");
  if (!country) errors.push("Country is required.");
  if (!venue) errors.push("Venue is required.");
  if (!review) errors.push("Review text is required.");
  if (!rating) errors.push("Rating is required.");

  // Validate phone number: must be exactly 10 digits and start with '04'
  if (!phone || !/^\d{10}$/.test(phone) || !phone.startsWith("04")) {
    errors.push(
      "Phone number format seems off — try entering your mobile number again please."
    );
  }

  // If there are validation errors, render the error view with the list of messages
  if (errors.length > 0) {
    return res.render("error", {
      title: "Review Submission Error",
      errorList: errors,
    });
  }

  // If all inputs are valid, store the review in the database with a timestamp
  const timestamp = new Date().toLocaleString();

  db.run(
    `INSERT INTO reviews (name, email, phone, country, venue, review, rating, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, country, venue, review, rating, timestamp],
    function (err) {
      // Handle database error (e.g., if insertion fails)
      if (err) {
        return res.status(500).render("error", {
          title: "Database Error",
          errorList: ["We couldn’t save your review. Please try again later."],
        });
      }

      // On success, render a confirmation page that echoes back the user’s input
      res.render("response", {
        title: "Your Matcha Moment Has Been Shared!",
        name,
        email,
        phone,
        country,
        venue,
        review,
        rating,
        timestamp,
      });
    }
  );
});

// ========== FORM HANDLING ROUTE | SUBSCRIBE ==========

// This route handles the POST request from the footer subscription form
app.post("/subscribe", (req, res) => {
  const { email, redirectTo } = req.body; // Extract email and optional redirect target
  const timestamp = new Date().toLocaleString(); // Capture the time of submission
  const errors = [];

  // Simple client-side email validation: must include "@"
  if (!email || !email.includes("@")) {
    errors.push("Hmm… we’ll need a valid email to keep you in the loop!");
  }

  // If validation fails, render the error page with the error message(s)
  if (errors.length > 0) {
    return res.status(400).render("error", {
      title: "Subscription Error",
      errorList: errors,
    });
  }

  // Insert the subscriber's email into the database with timestamp
  db.run(
    "INSERT INTO subscribers (email, timestamp) VALUES (?, ?)",
    [email, timestamp],
    (err) => {
      if (err) {
        // Render error page if the insertion fails (e.g., DB error)
        return res.status(500).render("error", {
          title: "Subscription Error",
          errorList: ["Something went wrong while saving your subscription."],
        });
      }

      // Redirect the user back to the original page with a success flag
      const safeRedirect = redirectTo || "/";
      res.redirect(`${safeRedirect}?subscribed=true`);
    }
  );
});

// ================== ADMIN ROUTE ==================

// Renders the admin dashboard showing both reviews and subscribers
app.get("/admin", (req, res) => {
  // Query all reviews from the database, ordered by most recent
  db.all("SELECT * FROM reviews ORDER BY timestamp DESC", (err, reviews) => {
    if (err) {
      return res.status(500).render("error", {
        title: "Database Error",
        errorList: ["Failed to load reviews from database."],
      });
    }

    // Query all subscriber entries, also ordered by most recent
    db.all(
      "SELECT * FROM subscribers ORDER BY timestamp DESC",
      (err2, subscribers) => {
        if (err2) {
          return res.status(500).render("error", {
            title: "Database Error",
            errorList: ["Failed to load subscribers from database."],
          });
        }

        // Render the admin dashboard with both data sets
        res.render("admin", {
          title: "Admin Dashboard",
          reviews,
          subscribers,
        });
      }
    );
  });
});

// ========== FALLBACK ROUTE ==========

// Catch-all for any undefined routes – render custom 404 page
app.use((req, res) => {
  res.status(404).render("404");
});

// ========== START THE SERVER ==========

// Start the Express server and log startup info to the console
app.listen(port, () => {
  console.log(`🌐 MatchaMelb server running at http://localhost:${port}`);
  console.log(`🛑 Type Ctrl+C to shut down the web server`);
});
