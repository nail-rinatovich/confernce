const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 3000;

// Store conference rooms (mapping conferenceCode -> array of clients)
const rooms = {};

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Send index.html for any other request
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket connection setup
wss.on('connection', (ws) => {
    let currentRoom = null;  // Store the user's current conference room

    console.log('New connection established');
    
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received:', data);

        if (data.type === 'create') {
            // Create a new conference room
            currentRoom = data.conferenceCode;
            rooms[currentRoom] = rooms[currentRoom] || [];
            rooms[currentRoom].push(ws);

            // Notify other clients in the room
            ws.send(JSON.stringify({ type: 'transcript', transcript: 'Conference created. Waiting for participants...' }));
        } else if (data.type === 'join') {
            // Join an existing conference room
            currentRoom = data.conferenceCode;
            if (rooms[currentRoom]) {
                rooms[currentRoom].push(ws);
                ws.send(JSON.stringify({ type: 'transcript', transcript: 'Joined conference: ' + currentRoom }));
            } else {
                ws.send(JSON.stringify({ type: 'transcript', transcript: 'Conference not found.' }));
            }
        } else if (data.conferenceCode && rooms[data.conferenceCode]) {
            // Broadcast recognized speech to all clients in the same room
            rooms[data.conferenceCode].forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'transcript', transcript: data.transcript }));
                }
            });
        }
    });

    ws.on('close', () => {
        if (currentRoom && rooms[currentRoom]) {
            const index = rooms[currentRoom].indexOf(ws);
            if (index !== -1) {
                rooms[currentRoom].splice(index, 1);
            }
            console.log(`Client left conference: ${currentRoom}`);
        }
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
