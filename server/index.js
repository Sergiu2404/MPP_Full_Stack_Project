const http = require('http');
const WebSocket = require('ws');

const { generateRandomFoodItem, generateAndSaveRandomFoodItem } = require("./controller/GenerateFoodItem"); // Import the function

const express = require('express');
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ noServer:true });

wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.send('Food items WebSocket!');
});
  
setInterval(() => {
    generateAndSaveRandomFoodItem(); // Generate and save random food item
    
    const update = {
        type: 'new_item',
        data: generateRandomFoodItem()
    };
  
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(update));
        }
    });
}, 360000);

app.use(express.json());
app.use(cors());

const db = require('./models');

// ROUTERS
const foodItemRouter = require('./routes/FoodItems');
app.use("/foodItems", foodItemRouter);

const reviewRouter = require("./routes/Reviews");
app.use("/reviews", reviewRouter);

const userRouter = require("./routes/Users");
app.use("/auth", userRouter);

// Status check endpoint
app.get('/status', (req, res) => {
    res.send({ status: 'online' });
});



server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (socket) => {
        wss.emit('connection', socket, request);
    });
});

db.sequelize.sync().then(() => {
    server.listen(3001, () => {
        console.log("Server is running on port 3001...");
    });
});
