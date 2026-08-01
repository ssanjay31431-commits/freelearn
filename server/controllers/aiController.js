const handleAIChat = async (req, res) => {
  const { message } = req.body;
  const lowerMsg = (message || '').toLowerCase();

  let reply = "I'm VibeAI, your assistant at VibeForge! I can help you choose services, estimate pricing, track your project, or connect with our engineering team directly on WhatsApp.";
  let suggestedActions = [];

  if (lowerMsg.includes('web') || lowerMsg.includes('website') || lowerMsg.includes('portfolio') || lowerMsg.includes('e-commerce')) {
    reply = "Our Website Development starts at just ₹250 for Personal/College Portfolios! We build modern responsive sites using React, Tailwind CSS, Next.js, and Node.js. E-Commerce stores start at ₹999.";
    suggestedActions = [
      { label: 'View Web Services', action: '/services?group=website' },
      { label: 'Book Website (₹250+)', action: '/services/portfolio-website' },
    ];
  } else if (lowerMsg.includes('poster') || lowerMsg.includes('flyer') || lowerMsg.includes('banner') || lowerMsg.includes('symposium')) {
    reply = "Poster Design starts at ₹100! We create HD symposium posters, hackathon flyers, department event banners, business cards, and Instagram graphics with ultra-fast 6-hour delivery.";
    suggestedActions = [
      { label: 'View Poster Designs', action: '/services?group=poster' },
      { label: 'Book Poster (₹100)', action: '/services/symposium-hackathon-poster' },
    ];
  } else if (lowerMsg.includes('video') || lowerMsg.includes('reel') || lowerMsg.includes('edit') || lowerMsg.includes('shorts')) {
    reply = "Video Editing starts at ₹300! We specialize in Instagram Reels, YouTube Shorts, podcast editing, color grading, animated captions, sound FX, and cinematic trailers.";
    suggestedActions = [
      { label: 'View Video Editing', action: '/services?group=video' },
      { label: 'Book Reel Editing (₹300)', action: '/services/instagram-reels-youtube-shorts' },
    ];
  } else if (lowerMsg.includes('app') || lowerMsg.includes('apk') || lowerMsg.includes('android') || lowerMsg.includes('mobile')) {
    reply = "Mobile App & Android APK Development starts at ₹300! Perfect for college projects, business utilities, attendance tools, or full cross-platform apps.";
    suggestedActions = [
      { label: 'View Mobile Apps', action: '/services?group=app' },
      { label: 'Book APK Build (₹300)', action: '/services/android-apk-college-app' },
    ];
  } else if (lowerMsg.includes('ai') || lowerMsg.includes('chatbot') || lowerMsg.includes('automation')) {
    reply = "We integrate custom AI Chatbots, OpenAI/Gemini automation, resume generators, and text-to-image engines starting at ₹499.";
    suggestedActions = [
      { label: 'Explore AI Solutions', action: '/services?group=ai' },
      { label: 'Request Custom Quote', action: '/quote' },
    ];
  } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('rate') || lowerMsg.includes('50%')) {
    reply = "Our pricing is transparent and highly affordable! Poster: ₹100+, Web: ₹250+, Video: ₹300+, APK: ₹300+, AI: ₹499+. We accept 50% advance payments and Pay Later options!";
    suggestedActions = [
      { label: 'Request Custom Quote', action: '/quote' },
      { label: 'Talk on WhatsApp', action: 'whatsapp' },
    ];
  } else if (lowerMsg.includes('track') || lowerMsg.includes('status') || lowerMsg.includes('order')) {
    reply = "You can easily track your order in real-time from your Client Dashboard or by entering your order ID on our Track Order page!";
    suggestedActions = [
      { label: 'Track Order', action: '/track' },
      { label: 'My Client Dashboard', action: '/dashboard' },
    ];
  }

  res.json({
    reply,
    suggestedActions,
    whatsappNumber: '+919876543210',
  });
};

module.exports = { handleAIChat };
