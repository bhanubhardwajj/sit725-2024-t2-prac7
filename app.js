import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import http from 'http';
import Query from './models/Query.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server); // Integrate Socket.io with your HTTP server

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/student_portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.render('index', { queries });
});

app.post('/add-query', async (req, res) => {
    const { studentName, queryText, email } = req.body;
    const newQuery = new Query({ studentName, queryText, email });
    await newQuery.save();

    // Emit the new query event to all clients
    io.emit('newQuery', { studentName, queryText, email });

    res.redirect('/');
});

// Listen for socket connections
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
