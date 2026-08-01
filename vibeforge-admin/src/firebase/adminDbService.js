import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from './config';

export const getFirestoreAdminOrders = async () => {
  try {
    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((docSnap) => docSnap.data());
    return orders;
  } catch (err) {
    console.warn('[Admin Firestore Orders Fallback Notice]:', err.message);
    return [];
  }
};

export const getFirestoreAdminStats = async () => {
  try {
    const orders = await getFirestoreAdminOrders();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((o) => new Date(o.createdAt || Date.now()) >= startOfToday);
    const pendingOrders = orders.filter((o) => !['Completed', 'Delivered'].includes(o.statusTimeline) && o.paymentStatus !== 'paid');
    const completedOrders = orders.filter((o) => ['Completed', 'Delivered'].includes(o.statusTimeline) || o.paymentStatus === 'paid');
    const cancelledOrders = orders.filter((o) => o.statusTimeline === 'Cancelled' || o.paymentStatus === 'failed');

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amountPaid) || Number(o.totalAmount) || 0), 0);
    const revenueToday = todayOrders.reduce((sum, o) => sum + (Number(o.amountPaid) || Number(o.totalAmount) || 0), 0);
    const revenueThisMonth = orders
      .filter((o) => new Date(o.createdAt || Date.now()) >= startOfMonth)
      .reduce((sum, o) => sum + (Number(o.amountPaid) || Number(o.totalAmount) || 0), 0);

    const pendingPayments = orders.reduce((sum, o) => sum + (Number(o.amountDue) || 0), 0);

    // Extract unique customers
    const customerMap = new Map();
    orders.forEach((o) => {
      if (o.customerEmail) {
        const key = o.customerEmail.toLowerCase();
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            _id: 'cust_' + Math.random().toString(36).substr(2, 9),
            name: o.customerName || 'Customer',
            email: o.customerEmail,
            phone: o.customerPhone || '',
            rewardPoints: Math.floor((o.amountPaid || o.totalAmount || 0) / 100) * 10,
            status: 'active',
            createdAt: o.createdAt || new Date()
          });
        }
      }
    });
    const customers = Array.from(customerMap.values());

    const newCustomersCount = customers.filter((c) => new Date(c.createdAt || Date.now()) >= startOfMonth).length;
    const returningCustomersCount = Math.max(0, customers.length - newCustomersCount);
    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    return {
      revenueToday,
      revenueThisMonth,
      totalRevenue,
      todayOrdersCount: todayOrders.length,
      pendingOrdersCount: pendingOrders.length,
      completedOrdersCount: completedOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      newCustomersCount,
      returningCustomersCount,
      pendingPayments,
      avgOrderValue,
      recentOrders: orders.slice(0, 10),
      monthlyRevenueChart: [],
      orderDistributionChart: []
    };
  } catch (err) {
    console.warn('[Admin Firestore Stats Error]:', err.message);
    return null;
  }
};

export const updateFirestoreOrderStatusAdmin = async (orderId, newStatus) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { statusTimeline: newStatus });
    return true;
  } catch (err) {
    console.warn('[Admin Firestore Update Status Error]:', err.message);
    return false;
  }
};
