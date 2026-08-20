const Service = require('../models/Service');

const initialServicesData = [
  // 1. WEBSITE DEVELOPMENT (Starting ₹250)
  {
    _id: 'srv_web_001',
    title: 'Portfolio Website',
    slug: 'portfolio-website',
    group: 'website',
    categoryName: 'Personal Portfolio',
    startingPrice: 250,
    description: 'High-converting interactive portfolio website with dynamic project showcase, sleek modern layout, and dark/light mode.',
    features: ['Responsive Layout', 'Contact Form', 'SEO Optimized', 'Smooth Animations', '3 Free Revisions'],
    portfolioImages: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'],
    deliveryDays: 2,
    rating: 4.9,
    reviewCount: 42,
    isPopular: true,
  },
  {
    _id: 'srv_web_002',
    title: 'E-Commerce Website',
    slug: 'e-commerce-website',
    group: 'website',
    categoryName: 'E-Commerce',
    startingPrice: 999,
    description: 'Full-fledged online store with shopping cart, payment gateway integration, product inventory, and customer portal.',
    features: ['Cart & Checkout', 'Payment Gateway (Razorpay/UPI)', 'Admin Product Manager', 'Order Analytics', 'Mobile Responsive'],
    portfolioImages: ['https://images.unsplash.com/photo-1556742049-0a67daf64f42?auto=format&fit=crop&w=800&q=80'],
    deliveryDays: 5,
    rating: 5.0,
    reviewCount: 38,
    isPopular: true,
  },
  {
    _id: 'srv_web_003',
    title: 'College Project Website',
    slug: 'college-project-website',
    group: 'website',
    categoryName: 'Academic / College Project',
    startingPrice: 250,
    description: 'Custom academic project website complete with source code, documentation, clean code structure, and live preview link.',
    features: ['Complete Source Code', 'Project Documentation', 'Live Hosting Preview', 'Viva Presentation Deck', 'Express Setup'],
    portfolioImages: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'],
    deliveryDays: 1,
    rating: 4.8,
    reviewCount: 65,
    isPopular: true,
  },
  {
    _id: 'srv_web_004',
    title: 'Business & NGO Website',
    slug: 'business-ngo-website',
    group: 'website',
    categoryName: 'Corporate & Business',
    startingPrice: 499,
    description: 'Professional enterprise website tailored for business growth, NGO fundraising, real estate, and hospitality.',
    features: ['Custom Design', 'Lead Capture Form', 'Google Maps Integration', 'Fast Loading Speed', 'SSL Certificate Support'],
    portfolioImages: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
    deliveryDays: 3,
    rating: 4.9,
    reviewCount: 29,
  },

  // 2. POSTER DESIGN (Starting ₹100)
  {
    _id: 'srv_pos_001',
    title: 'College & Symposium Poster',
    slug: 'symposium-hackathon-poster',
    group: 'poster',
    categoryName: 'Symposium & Hackathons',
    startingPrice: 100,
    description: 'Eye-catching high-resolution poster for college symposiums, hackathons, seminars, department events, and expos.',
    features: ['Ultra HD Print Ready', 'Social Media Story Format', 'Includes Source PSD/Canva File', 'Express 6-Hour Delivery', 'Unlimited Text Revisions'],
    portfolioImages: [
      '/poster_sample_1.png',
      '/poster_sample_2.png',
      '/poster_sample_3.png',
      '/poster_sample_4.png',
      '/poster_sample_5.png'
    ],
    deliveryDays: 1,
    rating: 4.9,
    reviewCount: 88,
    isPopular: true,
  },
  {
    _id: 'srv_pos_002',
    title: 'Instagram & Social Media Flyers',
    slug: 'social-media-posters',
    group: 'poster',
    categoryName: 'Social Media & Banners',
    startingPrice: 100,
    description: 'Vibrant custom social media posters, Instagram posts/reels covers, event banners, and promotional flyers.',
    features: ['Targeted Dimensions (1:1, 9:16)', 'Engaging Typography', 'Brand Color Palette', 'High Res Export', 'Fast Turnaround'],
    portfolioImages: [
      '/poster_sample_3.png',
      '/poster_sample_1.png',
      '/poster_sample_5.png'
    ],
    deliveryDays: 1,
    rating: 4.8,
    reviewCount: 54,
  },
  {
    _id: 'srv_pos_003',
    title: 'Business Cards & Brochures',
    slug: 'business-card-brochure-design',
    group: 'poster',
    categoryName: 'Branding & Corporate',
    startingPrice: 150,
    description: 'Premium corporate business cards, tri-fold brochures, event certificates, and invitation cards.',
    features: ['Double-Sided Design', 'Vector Quality SVG/PDF', 'Custom Logo Placement', 'Print Ready CMYK', '3 Design Variants'],
    portfolioImages: ['https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=800&q=80'],
    deliveryDays: 1,
    rating: 4.9,
    reviewCount: 31,
  },

  // 3. VIDEO EDITING (Starting ₹300)
  {
    _id: 'srv_vid_001',
    title: 'Instagram Reels & YouTube Shorts',
    slug: 'instagram-reels-youtube-shorts',
    group: 'video',
    categoryName: 'Short-Form Content',
    startingPrice: 300,
    description: 'Engaging high-retention short videos with fast cuts, animated captions, color grading, sound effects, and trending music.',
    features: ['Animated Subtitles', 'Sound FX & B-Rolls', 'Color Grading & Transitions', '1080p 60fps Render', 'Viral Hook Framing'],
    portfolioImages: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'],
    sampleVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    deliveryDays: 1,
    rating: 5.0,
    reviewCount: 96,
    isPopular: true,
  },
  {
    _id: 'srv_vid_002',
    title: 'YouTube & Cinematic Video Editing',
    slug: 'youtube-cinematic-editing',
    group: 'video',
    categoryName: 'Long-Form & Vlogs',
    startingPrice: 500,
    description: 'Professional long-form video editing for YouTube channels, podcast episodes, travel vlogs, and corporate promotional videos.',
    features: ['Full Timeline Assembly', 'Motion Graphics Intros', 'Audio Noise Reduction', '4K Export', 'Thumbnail Included'],
    portfolioImages: ['https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80'],
    sampleVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    deliveryDays: 2,
    rating: 4.9,
    reviewCount: 47,
  },

  // 4. MOBILE APP & APK DEVELOPMENT (Starting ₹300)
  {
    _id: 'srv_app_001',
    title: 'Android APK & College Project App',
    slug: 'android-apk-college-app',
    group: 'app',
    categoryName: 'Android APK & Projects',
    startingPrice: 300,
    description: 'Ready-to-install Android APK build with full project source code, clean UI, database integration, and project report.',
    features: ['Direct APK Download Link', 'Full React Native / Flutter Source', 'Firebase / SQLite Backend', 'Setup Guide', 'Bug Fix Guarantee'],
    portfolioImages: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80'],
    deliveryDays: 2,
    rating: 4.9,
    reviewCount: 63,
    isPopular: true,
  },
  {
    _id: 'srv_app_002',
    title: 'Custom Business & Utility Mobile App',
    slug: 'custom-business-mobile-app',
    group: 'app',
    categoryName: 'Business Apps',
    startingPrice: 799,
    description: 'Feature-packed cross-platform mobile application for attendance tracking, billing, inventory, QR scanning, or custom workflows.',
    features: ['Push Notifications', 'User Auth & Role Management', 'Offline Syncing', 'Play Store Publishing Support', 'API Integration'],
    portfolioImages: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80'],
    deliveryDays: 5,
    rating: 5.0,
    reviewCount: 31,
  },

  // 5. AI SOLUTIONS
  {
    _id: 'srv_ai_001',
    title: 'Custom AI Chatbots & Business Automation',
    slug: 'custom-ai-chatbots-automation',
    group: 'ai',
    categoryName: 'AI Chatbots & Agents',
    startingPrice: 499,
    description: 'Intelligent AI agent trained on your custom website data to answer customer queries 24/7, book appointments, and capture leads.',
    features: ['OpenAI / Gemini API Integration', 'WhatsApp & Web Widget Support', 'Lead Collection Form', 'Zero Latency Response', 'Analytics Dashboard'],
    portfolioImages: ['https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80'],
    deliveryDays: 2,
    rating: 5.0,
    reviewCount: 52,
    isPopular: true,
  },
  {
    _id: 'srv_ai_002',
    title: 'AI Resume & Image Generator Integration',
    slug: 'ai-resume-image-generator',
    group: 'ai',
    categoryName: 'AI Web Apps',
    startingPrice: 499,
    description: 'Build your own AI SaaS app or integrate AI resume formatting, text-to-image generation, and automatic code helpers.',
    features: ['Custom Prompt Engineering', 'Full Stack MERN Code', 'Stripe / Razorpay Billing', 'User Credit System', 'Modern UI/UX'],
    portfolioImages: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'],
    deliveryDays: 3,
    rating: 4.9,
    reviewCount: 26,
  },
];

const getServices = async (req, res) => {
  const { group, search } = req.query;

  try {
    let query = {};
    if (group && group !== 'all') {
      query.group = group;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const services = await Service.find(query);
    if (services.length > 0) {
      return res.json(services);
    }
  } catch (err) {
    // Fallback to static services array if DB is not populated
  }

  let filtered = [...initialServicesData];
  if (group && group !== 'all') {
    filtered = filtered.filter((s) => s.group === group);
  }
  if (search) {
    filtered = filtered.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));
  }

  res.json(filtered);
};

const getServiceBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const service = await Service.findOne({ slug });
    if (service) return res.json(service);
  } catch (err) {}

  const found = initialServicesData.find((s) => s.slug === slug || s._id === slug);
  if (found) return res.json(found);

  res.status(404).json({ message: 'Service not found' });
};

const normalizedInitialServicesData = initialServicesData.map(({ _id, ...service }) => service);

module.exports = { getServices, getServiceBySlug, initialServicesData: normalizedInitialServicesData };
