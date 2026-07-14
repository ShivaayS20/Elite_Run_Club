require("dotenv").config();
const connectDB = require("../config/db");
const Event = require("../models/Event");
const mongoose = require("mongoose");

const run = async () => {
  await connectDB();

  const testEvent = await Event.create({
    title: "Saturday Morning 5K",
    description: "A friendly 5K run around the city park, all paces welcome.",
    date: new Date("2026-07-12"),
    time: "06:00 AM",
    location: "City Park Main Gate",
    distanceKm: 5,
    difficulty: "Easy",
    maxParticipants: 50,
  });

  console.log("Test event created:", testEvent.title);
  await mongoose.connection.close();
  process.exit(0);
};

run();