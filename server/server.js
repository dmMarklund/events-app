const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 5001;

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.static(path.join(__dirname, "build")));

app.get("/events", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("events_db");
    const collection = database.collection("events");

    const events = await collection.find({}).toArray();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving events.");
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
