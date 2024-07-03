const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const path = require("path");
const compression = require("compression");

const app = express();
const port = 5001;

const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(compression());
app.use(cors());
app.use(express.static(path.join(__dirname, "build")));

const fetchEvents = async (page, limit) => {
  try {
    await client.connect();
    const database = client.db("events_db");
    const collection = database.collection("events");

    const totalEvents = await collection.countDocuments();
    const events = await collection
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return { total: totalEvents, events };
  } catch (error) {
    console.error("Error fetching events from MongoDB:", error);
    throw error;
  }
};

app.get("/events", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;

  try {
    const { total, events } = await fetchEvents(page, limit);
    res.json({ total, events });
  } catch (error) {
    console.error("Error retrieving events:", error);
    res.status(500).send("Error retrieving events.");
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
