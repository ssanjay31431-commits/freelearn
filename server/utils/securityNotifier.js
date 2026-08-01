const useragent = require('useragent');
const { sendEmail } = require('./sendEmail');

const sendAdminLoginAlert = async (req, adminUser) => {
  try {
    const targetEmail = 'ssanjay31431@gmail.com';
    const agent = useragent.parse(req.headers['user-agent']);
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const browser = `${agent.family} ${agent.major}.${agent.minor}`;
    const os = agent.os.toString();
    const device = agent.device.toString() || 'Desktop';
    const location = req.headers['cf-ipcountry'] || req.headers['x-appengine-country'] || 'India (Detected)';

    const emailContent = `
==================================================
⚠️ VIBEFORGE ADMIN LOGIN SECURITY ALERT
==================================================

An admin user successfully logged into VibeForge Admin Dashboard.

👤 Admin Details:
- Name: ${adminUser.name}
- Email: ${adminUser.email}
- Role: ${adminUser.role.toUpperCase()}

📍 Session Information:
- Login Time: ${loginTime}
- IP Address: ${ipAddress}
- Location: ${location}
- Browser: ${browser}
- Operating System: ${os}
- Device: ${device}

If this was not authorized by you, please immediately lock the account or revoke credentials.
==================================================
`;

    console.log(`\n🔔 [SECURITY ALERT SENT TO ${targetEmail}]`);
    console.log(emailContent);

    await sendEmail({
      to: [targetEmail],
      subject: `🚨 Admin Login Security Alert: ${adminUser.email}`,
      text: emailContent,
      html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${emailContent}</pre>`,
    });

    return {
      ipAddress,
      browser,
      os,
      device,
      location,
      loginTime
    };
  } catch (error) {
    console.error('Failed to send security alert email:', error.message);
  }
};

module.exports = { sendAdminLoginAlert };
