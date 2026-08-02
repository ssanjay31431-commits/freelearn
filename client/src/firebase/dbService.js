import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from './config';

// Pre-seeded services catalog for instant rendering
export const DEFAULT_SERVICES = [
  {
    id: 'srv_1',
    title: 'Custom MERN & React Web Application',
    slug: 'custom-mern-react-web-app',
    category: 'website',
    description: 'High-performance responsive website or web app with admin dashboard, authentication, and database integration.',
    pricingTier: 'Full Project',
    price: 250,
    deliverables: ['Responsive Web Portal', 'React/Node Source Code', 'Admin Dashboard', 'Free 1-Month Support'],
    turnaroundTime: '24-48 Hours',
    popular: true,
  },
  {
    id: 'srv_2',
    title: 'Symposium & Event Poster Design',
    slug: 'symposium-event-poster-design',
    category: 'poster',
    description: 'High-converting, HD professional poster designs for college symposiums, tech fests, webinars, and business branding.',
    pricingTier: 'Per Poster',
    price: 100,
    deliverables: ['Print-ready PDF Poster', 'PNG & JPG HD Render', 'Source PSD/Canva File', 'Unlimited Revisions'],
    turnaroundTime: '4-6 Hours',
    popular: true,
  },
  {
    id: 'srv_3',
    title: 'High-Retention Reel & Video Editing',
    slug: 'high-retention-reel-video-editing',
    category: 'video',
    description: 'Viral short-form video reels, symposium promo edits, sound design, dynamic captions, and color grading.',
    pricingTier: 'Per Video Reel',
    price: 300,
    deliverables: ['1080p/4K HD Video File', 'Dynamic Subtitles & Motion FX', 'Royalty-Free Audio', '2 Revision Rounds'],
    turnaroundTime: '12-24 Hours',
    popular: true,
  },
  {
    id: 'srv_4',
    title: 'Android APK & Mobile Application',
    slug: 'android-apk-mobile-application',
    category: 'app',
    description: 'Lightweight Android APK built with React Native / Flutter for academic projects, startups, and local businesses.',
    pricingTier: 'Full App',
    price: 300,
    deliverables: ['Signed Android APK File', 'Complete Mobile Source Code', 'Firebase Integration', 'Testing Setup'],
    turnaroundTime: '48 Hours',
    popular: false,
  },
  {
    id: 'srv_5',
    title: 'Custom AI Agent & Chatbot Integration',
    slug: 'custom-ai-agent-chatbot-integration',
    category: 'ai',
    description: 'Custom trained OpenAI/Gemini AI agents, automated customer support chatbots, and workflow automation.',
    pricingTier: 'Custom Integration',
    price: 499,
    deliverables: ['Custom AI Chatbot Widget', 'API Key Setup', 'Training Dataset Config', 'Full Integration Code'],
    turnaroundTime: '24 Hours',
    popular: false,
  },
];

// In-memory fallback database for local offline mode
let localOrders = [];
let localQuotes = [];

/* ====================================================
   1. ORDERS FIRESTORE OPERATIONS
   ==================================================== */
export const createFirestoreOrder = async (orderData) => {
  const orderId = orderData.orderId || `VF-${Math.floor(100000 + Math.random() * 900000)}`;
  const fullOrder = {
    orderId,
    user: orderData.user || null,
    userId: orderData.userId || orderData.user?._id || 'guest',
    customerName: orderData.customerName || orderData.user?.name || 'Customer',
    customerEmail: orderData.customerEmail || orderData.user?.email || 'customer@gmail.com',
    customerPhone: orderData.customerPhone || orderData.user?.phone || '',
    items: orderData.items || [],
    totalAmount: Number(orderData.totalAmount || 0),
    amountPaid: Number(orderData.amountPaid || 0),
    amountDue: Number(orderData.amountDue || 0),
    advancePercentage: Number(orderData.advancePercentage || 50),
    paymentStatus: orderData.paymentStatus || 'Advance Paid (50%)',
    orderStatus: orderData.orderStatus || 'Pending',
    statusTimeline: orderData.statusTimeline || 'Pending',
    emailStatus: orderData.emailStatus || 'Not Sent',
    emailSentAt: orderData.emailSentAt || null,
    adminEmailAlert: 'vibeforge@gmail.com',
    adminPhoneAlert: '9943380320',
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
  };

  // 1. Post to Express API Backend to store in MongoDB Atlas & trigger Brevo SMTP emails
  const apiUrls = [
    import.meta.env.VITE_API_BASE_URL,
    import.meta.env.VITE_API_URL,
    'https://vibeforge-server.onrender.com/api',
    'https://freelearn.onrender.com/api',
    'http://localhost:5000/api'
  ].filter(Boolean);

  let serverOrder = null;
  for (const baseUrl of apiUrls) {
    try {
      const cleanUrl = baseUrl.replace(/\/$/, '');
      const token = localStorage.getItem('vf_token') || '';
      const res = await fetch(`${cleanUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(fullOrder)
      });
      if (res.ok) {
        serverOrder = await res.json();
        if (serverOrder && serverOrder.orderId) {
          console.log('✅ Express Backend API created order & dispatched Brevo email:', serverOrder.orderId);
          break;
        }
      }
    } catch (e) {
      console.warn(`[API Order Dispatch] Attempt to post to ${baseUrl} failed:`, e.message);
    }
  }

  // 2. Save to Firestore for client UI sync
  try {
    const docRef = doc(db, 'orders', orderId);
    await setDoc(docRef, fullOrder);
  } catch (err) {
    console.warn('Firestore Order Write Fallback:', err.message);
  }

  const finalOrder = serverOrder || fullOrder;
  localOrders.unshift(finalOrder);
  return finalOrder;
};

export const getUserFirestoreOrders = async (userId, userEmail) => {
  let clearedOrderIds = [];
  try {
    clearedOrderIds = JSON.parse(localStorage.getItem('vibeforge_cleared_orders') || '[]');
  } catch (e) {}

  try {
    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs
      .map((doc) => doc.data())
      .filter(
        (ord) =>
          (ord.userId === userId || ord.customerEmail === userEmail) &&
          !clearedOrderIds.includes(ord.orderId)
      );

    if (orders.length > 0) return orders;
  } catch (err) {
    console.warn('Firestore getUserOrders Fallback:', err.message);
  }

  return localOrders.filter(
    (ord) =>
      (ord.userId === userId || ord.customerEmail === userEmail) &&
      !clearedOrderIds.includes(ord.orderId)
  );
};

export const getFirestoreOrderById = async (orderId) => {
  // 1. Try Backend Express API first for latest status
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiBase}/orders/${orderId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.orderId) return data;
    }
  } catch (apiErr) {
    console.warn('Backend API getOrderById Fallback:', apiErr.message);
  }

  // 2. Try Firestore
  try {
    const docRef = doc(db, 'orders', orderId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) return snapshot.data();
  } catch (err) {
    console.warn('Firestore getOrderById Fallback:', err.message);
  }

  // 3. Fallback to local store
  return localOrders.find((ord) => ord.orderId === orderId || ord._id === orderId);
};

export const getAllFirestoreOrders = async () => {
  try {
    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((doc) => doc.data());
    if (orders.length > 0) return orders;
  } catch (err) {
    console.warn('Firestore getAllOrders Fallback:', err.message);
  }

  return localOrders;
};

export const updateFirestoreOrderStatus = async (orderId, newStatus) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { statusTimeline: newStatus });
  } catch (err) {
    console.warn('Firestore updateStatus Fallback:', err.message);
  }

  const found = localOrders.find((o) => o.orderId === orderId);
  if (found) found.statusTimeline = newStatus;

  return { success: true, orderId, newStatus };
};

export const cancelFirestoreOrder = async (orderId, cancelReason = 'Cancelled by customer') => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { statusTimeline: 'Cancelled', cancelReason, cancelledAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Firestore cancelOrder Fallback:', err.message);
  }

  const found = localOrders.find((o) => o.orderId === orderId);
  if (found) {
    found.statusTimeline = 'Cancelled';
    found.cancelReason = cancelReason;
  }

  return { success: true, orderId, newStatus: 'Cancelled' };
};

export const clearUserFirestoreOrders = async (userId, userEmail, specificOrderId = null) => {
  try {
    let cleared = JSON.parse(localStorage.getItem('vibeforge_cleared_orders') || '[]');
    if (specificOrderId) {
      if (!cleared.includes(specificOrderId)) cleared.push(specificOrderId);
    } else {
      // Clear all active local orders for this user
      const userOrders = localOrders.filter(
        (ord) => ord.userId === userId || ord.customerEmail === userEmail
      );
      userOrders.forEach((o) => {
        if (!cleared.includes(o.orderId)) cleared.push(o.orderId);
      });
    }
    localStorage.setItem('vibeforge_cleared_orders', JSON.stringify(cleared));
  } catch (e) {
    console.warn('Clear orders localStorage fallback:', e);
  }

  if (specificOrderId) {
    localOrders = localOrders.filter((o) => o.orderId !== specificOrderId);
  } else {
    localOrders = localOrders.filter(
      (ord) => ord.userId !== userId && ord.customerEmail !== userEmail
    );
  }

  return { success: true };
};

/* ====================================================
   2. CUSTOM QUOTE FIRESTORE OPERATIONS
   ==================================================== */
export const submitFirestoreQuote = async (quoteData) => {
  const quoteObj = {
    quoteId: `QT-${Date.now()}`,
    name: quoteData.name,
    email: quoteData.email,
    phone: quoteData.phone || '',
    serviceCategory: quoteData.serviceCategory,
    projectDescription: quoteData.projectDescription,
    budgetRange: quoteData.budgetRange || 'Flexible',
    status: 'Pending Review',
    adminEmailAlert: 'vibeforge@gmail.com',
    adminPhoneAlert: '9943380320',
    createdAt: new Date().toISOString(),
  };

  try {
    await addDoc(collection(db, 'quotes'), quoteObj);
  } catch (err) {
    console.warn('Firestore Quote Write Fallback:', err.message);
  }

  localQuotes.unshift(quoteObj);
  return quoteObj;
};

export const getAllFirestoreQuotes = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'quotes'));
    const quotes = snapshot.docs.map((doc) => doc.data());
    if (quotes.length > 0) return quotes;
  } catch (err) {
    console.warn('Firestore getAllQuotes Fallback:', err.message);
  }

  return localQuotes;
};

/* ====================================================
   3. USER PROFILE FIRESTORE OPERATIONS
   ==================================================== */
export const saveFirestoreUserProfile = async (userId, userProfileData) => {
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, userProfileData, { merge: true });
  } catch (err) {
    console.warn('Firestore User Profile Write Fallback:', err.message);
  }
};
