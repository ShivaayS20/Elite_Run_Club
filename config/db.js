const mongoose = require("mongoose");

// Vercel can reuse the same running process for multiple requests ("warm"
// invocations), so we cache the connection attempt instead of reconnecting
// on every request — opening a fresh MongoDB connection per request is a
// common way to accidentally exhaust Atlas's connection limit once real
// traffic shows up.
let connectionPromise = null;

const connectDB = () => {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI)
    .then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      // Reset so the NEXT request tries to connect again instead of
      // staying permanently stuck on this one failed attempt.
      connectionPromise = null;
      // IMPORTANT: no process.exit() here. On Vercel, exiting the process
      // kills the entire function for every visitor, not just the one
      // request that needed the database. Instead, we let this one
      // request fail on its own (Mongoose times out any query made while
      // disconnected, and each route's own try/catch already handles that
      // and returns a normal error response) while the rest of the site
      // — and the very next request — keeps working normally.
    });

  return connectionPromise;
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

module.exports = connectDB;