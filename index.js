require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { connectDB } = require("./config/db");
const auth = require("./routes/auth");
const products = require("./routes/products");
const orders = require("./routes/orders");

connectDB();

app.use(cors({
    origin: ["http://localhost:5173", "https://e-commerence-fe.vercel.app"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', auth);
app.use("/api/products", products);
app.use("/api/orders", orders);

const { PORT = 8000 } = process.env;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});