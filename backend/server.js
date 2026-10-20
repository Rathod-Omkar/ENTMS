require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");
const employeeRoutes = require("./routes/employeeRoutes.js");


const app = express();
app.use(cors({origin:process.env.CLIENT_URL||"http://localhost:5173",}));
app.use(express.json());

app.use("/api/employee",employeeRoutes);
app.use("/api/tasks", taskRoutes);





app.use(errorHandler);
const PORT = process.env.PORT || 8000;

async function startServer() {
    await connectDB();
    
    app.listen(PORT,()=>{
    console.log(`Server running at port ${PORT}`);
});
}

startServer();
