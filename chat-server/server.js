const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


app.use(cors());
app.use(express.json());

const users = [];
const messages = [];

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const alreadyExists = !!users.find(u => u.username === username);
  if(alreadyExists) {
    res
      .status(400)
      .send({ message: 'Username already exists', success: false });
  } else {
    users.push({ username, password: hashedPassword });
    res
      .status(201)
      .send({ message: 'User registered successfully', success: true });
  }
  
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });
    res.status(200).send({ token, username });
  } else {
    res.status(401).send({ message: 'Invalid credentials' });
  }
});

app.get("/users", (req, res) => {
  let safeUsers = users.map((user) => {return {username: user?.username}})
  return res.status(200).send(safeUsers);
})

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('sendMessage', (message) => {
    messages.push(message);
    socket.broadcast.emit('message', message);
    console.log("message:", message);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
