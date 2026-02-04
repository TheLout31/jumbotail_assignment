const express = require("express");
const connectToDB = require("./config/mongodb.config");
const cors = require("cors")
const app = express();
const PORT = 3000;

// Connect to MongoDB
connectToDB()

app.use(cors())

// Middleware to parse JSON body
app.use(express.json());


// GET route
app.get("/", (req, res) => {
  res.json({ message: "Server working fine!!" });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
