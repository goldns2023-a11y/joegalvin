const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productRoutes = require("./routes/products");
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("JOEGALVIN API Running");
});

// 🔥 PUT NEW BLOCK HERE (MongoDB + server start together)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log("MongoDB connection failed:", err);
    process.exit(1);
  });
