//app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db')
const apiRoutes = require("./routes/api");
const portfolioRoutes = require("./routes/portfolioRoutes");
const apiKeysRoutes = require("./routes/apiKeysRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
const tradingdRoutes = require('./routes/tradingRoutes');
const supportRoutes = require('./routes/supportRoute')
const PORT = process.env.PORT || 5000;

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/exchange', require('./routes/exchange'));
app.use("/api", apiRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/keys", apiKeysRoutes);
app.use("/api/notifications", require("./routes/notificationsRoutes"));
app.use("/api/orders", require("./routes/ordersRoutes"));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/trading", tradingdRoutes);
app.use("/api/help", supportRoutes)
module.exports = app;


