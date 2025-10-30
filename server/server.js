console.log('--- [SERVER] Starting server script ---');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
console.log('[INFO] Express app initialized.');

// Middleware
app.use(cors());
console.log('[INFO] CORS middleware enabled.');
app.use(express.json());
console.log('[INFO] express.json middleware enabled for parsing request bodies.');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/calendar', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('[SUCCESS] Successfully connected to MongoDB.');
}).catch(err => {
  console.error('[ERROR] MongoDB connection error:', err.message);
});

// Models
const Event = mongoose.model('Event', {
  title: String,
  description: String,
  start: Date,
  end: Date,
});

const Admin = mongoose.model('Admin', {
  username: String,
  password: String,
});

// --- Routes ---

// 🎯 הלוגים החשובים ביותר נמצאים כאן
app.get('/', (req, res) => {
  console.log(`--- ✅ [ROOT ROUTE] Request received for "/" from IP: ${req.ip} ---`);
  console.log('[ROOT ROUTE] Attempting to send response...');
  res.send('<h1>Hello from the server! The root route is working!</h1>');
  console.log('[ROOT ROUTE] Response sent successfully.');
});

app.get('/api', (req, res) => {
  console.log(`[REQUEST] GET request received for /api from IP: ${req.ip}`);
  res.json({ message: 'Calendar API is running' });
});

app.get('/api/events', async (req, res) => {
  console.log(`[REQUEST] GET request for /api/events`);
  try {
    const events = await Event.find();
    console.log(`[DB] Found ${events.length} events.`);
    res.json(events);
  } catch (error) {
    console.error('[ERROR] in GET /api/events:', error.message);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  console.log(`[REQUEST] POST request for /api/events with body:`, req.body);
  try {
    const event = new Event(req.body);
    await event.save();
    console.log('[DB] New event saved successfully:', event._id);
    res.status(201).json(event);
  } catch (error) {
    console.error('[ERROR] in POST /api/events:', error.message);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  console.log(`[REQUEST] PUT request for /api/events/${req.params.id}`);
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (error) {
    console.error(`[ERROR] in PUT /api/events/${req.params.id}:`, error.message);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  console.log(`[REQUEST] DELETE request for /api/events/${req.params.id}`);
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(`[ERROR] in DELETE /api/events/${req.params.id}:`, error.message);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  console.log(`[REQUEST] POST request for /api/admin/login for user: ${req.body.username}`);
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      console.log(`[AUTH] Login failed for user: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[AUTH] Login successful for user: ${username}`);
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '1d',
    });

    res.json({ token });
  } catch (error) {
    console.error('[ERROR] in POST /api/admin/login:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Initialize default admin
async function initializeAdmin() {
  try {
    const adminExists = await Admin.findOne({ username: 'משה' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123', 10);
      const admin = new Admin({
        username: 'משה',
        password: hashedPassword,
      });
      await admin.save();
      console.log('[INFO] Default admin created');
    } else {
      console.log('[INFO] Default admin already exists.');
    }
  } catch (error) {
    console.error('[ERROR] Error creating default admin:', error);
  }
}

initializeAdmin();

// Serve React build in production
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  // If request is not an API route, serve React app
  if (!req.path.startsWith('/api')) {
    return res.sendFile(path.join(clientBuildPath, 'index.html'));
  }
  return res.status(404).json({ message: 'Not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`--- 🚀 Server is up and running on port ${PORT} ---`);
  console.log(`--- Access root at: http://localhost:${PORT}/ ---`);
});