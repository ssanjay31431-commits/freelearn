const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../data/mock_store.json');

// Initial default state
const initialData = {
  orders: [
    {
      orderId: 'VF-742262',
      customerName: 'Somu Somu',
      customerEmail: 'tsomu7036@gmail.com',
      customerPhone: '+91 99433 80320',
      address: 'VibeForge Headquarters, India',
      items: [
        {
          serviceId: 's1',
          title: 'Full-Stack MERN & React Web Application',
          categoryName: 'Web Development',
          price: 19900,
          quantity: 1,
          priority: 'standard'
        }
      ],
      subtotal: 19900,
      discount: 0,
      gst: 3582,
      totalAmount: 23482,
      paymentType: 'full',
      amountPaid: 23482,
      amountDue: 0,
      paymentMethod: 'Razorpay UPI',
      paymentStatus: 'paid',
      statusTimeline: 'Order Received',
      createdAt: new Date().toISOString()
    }
  ],
  users: [
    {
      _id: 'usr_superadmin_7036',
      name: 'VibeForge Super Admin',
      email: 'tsomu7036@gmail.com',
      password: 'Kavi@2005',
      phone: '+91 99433 80320',
      role: 'super_admin',
      rewardPoints: 2340,
      status: 'active'
    }
  ],
  offers: [],
  settings: {
    websiteName: 'VibeForge Digital Agency',
    phone: '+91 99433 80320',
    email: 'contact@vibeforge.com',
    whatsappNumber: '+91 99433 80320'
  }
};

const ensureStore = () => {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(initialData, null, 2));
  }
};

const loadStore = () => {
  try {
    ensureStore();
    const data = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load fileStore:', error.message);
    return initialData;
  }
};

const saveStore = (storeData) => {
  try {
    ensureStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(storeData, null, 2));
  } catch (error) {
    console.error('Failed to save fileStore:', error.message);
  }
};

module.exports = { loadStore, saveStore };
