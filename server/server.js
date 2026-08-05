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

const isPreviewOrigin = (origin) => {
  if (!origin) return false;
  return [
    /https:\/\/[\w-]+\.vercel\.app$/,
    /https:\/\/[\w-]+\.netlify\.app$/,
    /https:\/\/[\w-]+\.onrender\.com$/
  ].some((pattern) => pattern.test(origin));
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (allowedOrigins.some((o) => origin.startsWith(o))) return true;
  if (isPreviewOrigin(origin)) return true;
  return false;
};

console.log('Allowed Origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin) || process.env.NODE_ENV !== 'production') {
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

app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    if (req.method === 'POST' && (req.originalUrl.includes('/webhook') || req.path.includes('/webhook'))) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for generated PDF invoices
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

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
const registerRoutes = () => {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/services', require('./routes/serviceRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/payment', require('./routes/paymentRoutes'));
  app.use('/payment', require('./routes/paymentRoutes'));
  app.use('/api/quotes', require('./routes/quoteRoutes'));
  app.use('/api/contact', require('./routes/contactRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/ai', require('./routes/aiRoutes'));
  app.use('/api/debug', require('./routes/debugRoutes'));

  // 404 Route Handler
  app.use((req, res) => {
    res.status(404).json({ message: `API Route ${req.originalUrl} not found` });
  });
};

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err);
  res.status(500).json({ message: err.message || 'Server Internal Error' });
});

const port = Number(process.env.PORT || 5000);

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception during startup:', error.stack || error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection during startup:', reason && (reason.stack || reason));
  process.exit(1);
});

const startServer = async () => {
  try {
    console.log('Starting VibeForge server...');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.log('PORT:', process.env.PORT || 'undefined');

    await connectDB();
    registerRoutes();

    const host = '0.0.0.0';
    console.log('Binding host:', host);

    server.on('error', (err) => {
      console.error('Server failed to start:', err.stack || err);
      process.exit(1);
    });

    server.listen(port, host, () => {
      console.log(`🚀 VibeForge Enterprise Server running on port ${port} and host ${host}`);
    });
  } catch (error) {
    console.error('Fatal startup error:', error.stack || error);
    process.exit(1);
  }
};

startServer();
