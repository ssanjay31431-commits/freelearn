const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Security & Rate Limiting Middleware
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
const allowedOrigins = [
  'https://adminvibeforge.vercel.app',
  'https://vibeforge.vercel.app',
  'https://freelearn-seven.vercel.app',
  'https://vibeforge.netlify.app',
  'https://vibeforge-hq68.onrender.com', // Render production URL
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5000'
].filter(Boolean);

console.log('Allowed Origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin && origin.startsWith(o)) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
  })
);

app.options('*', cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300, // Limit each IP to 300 requests per window
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.IO Setup - attach to the HTTP server and enforce CORS using allowedOrigins
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin && origin.startsWith(o)) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`⚡ Socket Client Connected: ${socket.id}`);
  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined room: order_${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket Client Disconnected: ${socket.id}`);
  });
});

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'VibeForge Enterprise API Server is active and operational 🚀',
    agency: 'VibeForge Digital Agency',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    agency: 'VibeForge Digital Agency',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/debug', require('./routes/debugRoutes'));

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `API Route ${req.originalUrl} not found` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: err.message || 'Server Internal Error' });
});

const startServer = (port) => {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      if (nextPort <= port + 10) {
        console.warn(`⚠️ Port ${port} is already in use. Trying ${nextPort} instead...`);
        server.removeAllListeners('error');
        startServer(nextPort);
      } else {
        console.error(`❌ No available port found in range ${port}-${port + 10}.`);
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  server.listen(port, () => {
    console.log(`🚀 VibeForge Enterprise Server running on port ${port}`);
  });
};

startServer(Number(process.env.PORT || 5000));
