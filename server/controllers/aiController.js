const axios = require('axios');

const handleAIChat = async (req, res) => {
  const { message } = req.body;
  const text = (message || '').trim();
  const lowerMsg = text.toLowerCase();

  let reply = '';
  let suggestedActions = [];

  // 1. WHATSAPP & CONTACT QUERIES (Highest Priority to avoid false positive triggers)
  if (
    lowerMsg.includes('whatsapp') ||
    lowerMsg.includes('phone') ||
    lowerMsg.includes('number') ||
    lowerMsg.includes('contact') ||
    lowerMsg.includes('call') ||
    lowerMsg.includes('reach') ||
    lowerMsg.includes('email') ||
    lowerMsg.includes('address')
  ) {
    reply = `📱 **VibeForge Founders WhatsApp & Direct Contacts:**

• **Sanjay Sundar S** (Mobile App & APK): +91 77084 47215
• **Rishi Nathan M** (Video & Photo Director): +91 81228 89631
• **Madhavan J S** (Full-Stack Web Architect): +91 99433 80320

✉️ **Email**: vibeforgemrs@gmail.com
⚡ We respond on WhatsApp within 2 hours!`;

    suggestedActions = [
      { label: '💬 Chat on WhatsApp', action: 'whatsapp' },
      { label: '✉️ Contact Page', action: '/contact' },
    ];
  }

  // 2. GREETINGS & CASUAL INTRO
  else if (/^\b(hi|hello|hey|greetings|howdy|good morning|good evening|good afternoon|namaste)\b/i.test(lowerMsg)) {
    reply = "👋 Hello! I'm VibeAI, your copilot at VibeForge Digital Agency. How can I help you today? You can ask about Web Development, Poster Design, Video Editing, Android APKs, Pricing, or Founders' WhatsApp contacts!";
    suggestedActions = [
      { label: '🌐 Websites (₹250+)', action: '/services?group=website' },
      { label: '🎨 Posters (₹100+)', action: '/services?group=poster' },
      { label: '🎬 Video Reels (₹300+)', action: '/services?group=video' },
      { label: '📱 Android APK (₹300+)', action: '/services?group=app' },
    ];
  }

  // 3. FOUNDERS & TEAM INFO
  else if (/\b(founders?|team|who built|who owns|about|sanjay|rishi|madhavan)\b/i.test(lowerMsg)) {
    reply = `🚀 **VibeForge Digital Agency** was built by 3 college tech founders:

• **SANJAY SUNDAR S**: Mobile App & Android APK Specialist (+91 77084 47215)
• **RISHI NATHAN M**: Creative, Photo & Video Director (+91 81228 89631)
• **MADHAVAN J S**: Full-Stack Web Architect & Poster Lead (+91 99433 80320)

We empower students, event leads, and founders with high-performance digital builds!`;

    suggestedActions = [
      { label: '👥 About Founders', action: '/about' },
      { label: '💬 Chat on WhatsApp', action: 'whatsapp' },
    ];
  }

  // 4. PRICING, COST & 50% ADVANCE POLICY
  else if (/\b(price|pricing|cost|costs|rate|rates|fee|fees|cheap|discount|advance|50%|pay later|payment|pay)\b/i.test(lowerMsg)) {
    reply = `💰 **VibeForge Transparent Pricing & 50% Advance Scheme:**

• **Poster & Graphic Design**: Starts at ₹100
• **Web Development**: Starts at ₹250
• **Video Reel Editing**: Starts at ₹300
• **Android APK & Mobile Apps**: Starts at ₹300
• **Custom AI Chatbots**: Starts at ₹499

✨ **50% Advance Guarantee**: Pay only 50% upfront to start your project. Pay the remaining 50% after reviewing your live preview!`;

    suggestedActions = [
      { label: '📝 Get Custom Quote', action: '/quote' },
      { label: '💬 Chat on WhatsApp', action: 'whatsapp' },
    ];
  }

  // 5. ORDER TRACKING & STATUS
  else if (/\b(track|tracking|status|order|orders|stage|progress)\b/i.test(lowerMsg)) {
    reply = "📦 You can track your order in real-time through our 7-stage milestone system! View live progress on your Client Dashboard or enter your Order ID on the Track Order page.";
    suggestedActions = [
      { label: '🔍 Track Order Status', action: '/track' },
      { label: '👤 Client Dashboard', action: '/dashboard' },
    ];
  }

  // 6. WEBSITE DEV (Using exact word boundary so 'whatsapp' doesn't match 'app')
  else if (/\b(web|website|websites|portfolio|portfolios|e-commerce|mern|react|node|frontend|backend)\b/i.test(lowerMsg)) {
    reply = "🌐 **Web Development (Starts at ₹250)**: We build lightning-fast responsive websites, developer portfolios, symposium event portals, and full-stack MERN/E-Commerce applications with complete source code & 1-month free support!";
    suggestedActions = [
      { label: 'View Web Services', action: '/services?group=website' },
      { label: 'Book Website (₹250+)', action: '/services/portfolio-website' },
    ];
  }

  // 7. POSTER DESIGN
  else if (/\b(poster|posters|flyer|flyers|banner|banners|symposium|graphics?|canva|psd|infographic)\b/i.test(lowerMsg)) {
    reply = "🎨 **Poster & Graphic Design (Starts at ₹100)**: We design high-converting HD posters for college symposiums, hackathons, event banners, Instagram flyers, and corporate cards with ultra-fast 4-6 hour delivery!";
    suggestedActions = [
      { label: 'View Poster Designs', action: '/services?group=poster' },
      { label: 'Book Poster (₹100)', action: '/services/symposium-hackathon-poster' },
    ];
  }

  // 8. VIDEO EDITING
  else if (/\b(video|videos|reel|reels|shorts|editing|sound|captions|premiere|after effects)\b/i.test(lowerMsg)) {
    reply = "🎬 **High-Retention Video & Reel Editing (Starts at ₹300)**: We craft viral Instagram Reels, YouTube Shorts, cinematic promo trailers, dynamic captions, color grading, and podcast edits in 4K resolution!";
    suggestedActions = [
      { label: 'View Video Services', action: '/services?group=video' },
      { label: 'Book Reel Edit (₹300)', action: '/services/instagram-reels-youtube-shorts' },
    ];
  }

  // 9. MOBILE APP & ANDROID APK (Using exact word boundary so 'whatsapp' NEVER triggers 'app')
  else if (/\b(app|apps|apk|apks|android|flutter|react native|mobile)\b/i.test(lowerMsg)) {
    reply = "📱 **Android APK & Mobile App Development (Starts at ₹300)**: We build native Android APKs and cross-platform Flutter/React Native mobile applications with Firebase backend, offline sync, and full mobile source code!";
    suggestedActions = [
      { label: 'View Mobile Apps', action: '/services?group=app' },
      { label: 'Book APK Build (₹300)', action: '/services/android-apk-college-app' },
    ];
  }

  // 10. AI SOLUTIONS & CHATBOTS
  else if (/\b(ai|chatbot|chatbots|automation|agent|agents|openai|gemini)\b/i.test(lowerMsg)) {
    reply = "🤖 **Custom AI Solutions & Chatbots (Starts at ₹499)**: We integrate custom-trained AI chatbots, OpenAI/Gemini workflow automations, AI resume tools, and smart customer support widgets!";
    suggestedActions = [
      { label: 'Explore AI Solutions', action: '/services?group=ai' },
      { label: 'Request Custom Quote', action: '/quote' },
    ];
  }

  // 11. GENERAL / UNMATCHED CHATGPT-LIKE AI ASSISTANT FALLBACK
  else {
    // If GEMINI_API_KEY exists in env, attempt live Gemini API completion
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `System Instruction: You are VibeAI, an intelligent, friendly AI assistant for VibeForge Digital Agency.
Agency Services & Rates: Poster ₹100, Web Dev ₹250, Video Reels ₹300, Android APK ₹300, AI Agents ₹499.
50% Advance payment allowed.
Founders WhatsApp Contacts:
Sanjay Sundar S (+91 77084 47215), Rishi Nathan M (+91 81228 89631), Madhavan J S (+91 99433 80320). Email: vibeforgemrs@gmail.com.

User Question: "${text}"

Answer accurately, concisely, and helpfully like ChatGPT in a friendly tone.`,
                  },
                ],
              },
            ],
          },
          { timeout: 4000 }
        );

        const geminiText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          return res.json({
            reply: geminiText,
            suggestedActions: [
              { label: 'Explore Services', action: '/services' },
              { label: 'Chat on WhatsApp', action: 'whatsapp' },
            ],
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call skipped or timed out, falling back to smart engine.');
      }
    }

    reply = `I'm VibeAI, your assistant at VibeForge Digital Agency! How can I help you today?

Here is what I can assist you with:
1. 🌐 **Websites & Portfolios** (₹250+)
2. 🎨 **Symposium Posters & Banners** (₹100+)
3. 🎬 **Video Reels & Editing** (₹300+)
4. 📱 **Android APK & Mobile Apps** (₹300+)
5. 🤖 **AI Chatbots & Solutions** (₹499+)
6. 💬 **Connect with Founders on WhatsApp**

Feel free to ask any specific question!`;

    suggestedActions = [
      { label: 'View All Services', action: '/services' },
      { label: 'Request Custom Quote', action: '/quote' },
      { label: 'Chat on WhatsApp', action: 'whatsapp' },
    ];
  }

  return res.json({
    reply,
    suggestedActions,
    whatsappNumber: '+917708447215',
  });
};

module.exports = { handleAIChat };
