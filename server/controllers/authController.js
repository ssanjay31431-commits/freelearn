const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// In-memory store for users if DB connection fails
let mockUsers = [
  {
    _id: 'usr_admin_123',
    name: 'VibeForge Admin',
    email: 'admin@vibeforge.com',
    phone: '9876543210',
    password: 'adminpassword123',
    role: 'admin',
  },
  {
    _id: 'usr_client_456',
    name: 'Demo Client',
    email: 'client@vibeforge.com',
    phone: '9123456789',
    password: 'clientpassword123',
    role: 'client',
  },
];

const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
    let existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email. Please sign in instead.' });
    }

    const user = await User.create({
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: cleanPassword,
      phone: phone || '',
      role: 'client',
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    // Fallback mode if DB is not connected
    let existingMock = mockUsers.find((u) => u.email === cleanEmail);
    if (existingMock) {
      return res.status(400).json({ message: 'User already exists with this email. Please sign in instead.' });
    }

    const newUser = {
      _id: 'usr_' + Date.now(),
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: cleanPassword,
      phone: phone || '',
      role: 'client',
    };
    mockUsers.push(newUser);

    const token = generateToken(newUser._id, newUser.role);
    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      token,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      const isMatch = await user.matchPassword(cleanPassword);
      if (isMatch) {
        const token = generateToken(user._id, user.role);
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token,
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password. Incorrect password.' });
      }
    }
  } catch (error) {
    // DB query error fallback
  }

  // Check in-memory store for registered users
  let foundMock = mockUsers.find((u) => u.email === cleanEmail);

  if (foundMock) {
    // STRICT PASSWORD MATCH ENFORCEMENT
    if (foundMock.password && foundMock.password !== cleanPassword) {
      return res.status(401).json({ message: 'Invalid email or password. Incorrect password.' });
    }

    const token = generateToken(foundMock._id, foundMock.role);
    return res.json({
      _id: foundMock._id,
      name: foundMock.name,
      email: foundMock.email,
      phone: foundMock.phone,
      role: foundMock.role,
      token,
    });
  }

  // Account does not exist in DB or mock store
  return res.status(401).json({ message: 'Account not found with this email. Please register first.' });
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      return res.json(user);
    }
  } catch (error) {}

  const foundMock = mockUsers.find((u) => u._id === req.user.id);
  if (foundMock) {
    return res.json({
      _id: foundMock._id,
      name: foundMock.name,
      email: foundMock.email,
      phone: foundMock.phone,
      role: foundMock.role,
    });
  }

  res.json({
    _id: req.user.id,
    name: req.user.role === 'admin' ? 'VibeForge Admin' : 'Demo Client',
    email: req.user.role === 'admin' ? 'admin@vibeforge.com' : 'client@vibeforge.com',
    role: req.user.role,
  });
};

const updateUserProfile = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const cleanPassword = (password || '').trim();

  try {
    const user = await User.findById(req.user.id);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email.trim().toLowerCase();
      if (phone !== undefined) user.phone = phone;
      if (cleanPassword) user.password = cleanPassword;

      const updatedUser = await user.save();
      const token = generateToken(updatedUser._id, updatedUser.role);

      // Sync mock user store as well
      let foundMock = mockUsers.find((u) => u._id === req.user.id || u.email === req.user.email);
      if (foundMock) {
        if (name) foundMock.name = name;
        if (email) foundMock.email = email.trim().toLowerCase();
        if (phone !== undefined) foundMock.phone = phone;
        if (cleanPassword) foundMock.password = cleanPassword;
      }

      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        token,
      });
    }
  } catch (error) {}

  // Fallback for mock users
  let foundMock = mockUsers.find((u) => u._id === req.user.id || u.email === req.user.email);
  if (foundMock) {
    if (name) foundMock.name = name;
    if (email) foundMock.email = email.trim().toLowerCase();
    if (phone !== undefined) foundMock.phone = phone;
    if (cleanPassword) foundMock.password = cleanPassword;

    const token = generateToken(foundMock._id, foundMock.role);
    return res.json({
      _id: foundMock._id,
      name: foundMock.name,
      email: foundMock.email,
      phone: foundMock.phone,
      role: foundMock.role,
      token,
    });
  }

  const updatedUser = {
    _id: req.user.id || 'usr_' + Date.now(),
    name: name || 'User',
    email: email || 'user@vibeforge.com',
    phone: phone || '',
    password: cleanPassword || 'password123',
    role: req.user.role || 'client',
  };
  mockUsers.push(updatedUser);

  const token = generateToken(updatedUser._id, updatedUser.role);
  return res.json({
    ...updatedUser,
    token,
  });
};

const googleLogin = async (req, res) => {
  const { email, name, avatar, password } = req.body;
  const cleanEmail = (email || `user_${Date.now()}@gmail.com`).trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  try {
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: cleanPassword || 'google_oauth_protected_' + Date.now(),
        avatar: avatar || '',
        phone: '',
        role: 'client',
      });
    } else if (cleanPassword) {
      user.password = cleanPassword;
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || avatar,
      role: user.role,
      token,
    });
  } catch (error) {
    let mockUser = mockUsers.find((u) => u.email === cleanEmail);
    if (!mockUser) {
      mockUser = {
        _id: 'usr_g_' + Date.now(),
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: cleanPassword || 'password123',
        avatar: avatar || 'https://lh3.googleusercontent.com/a/default-user',
        role: 'client',
      };
      mockUsers.push(mockUser);
    } else if (cleanPassword) {
      mockUser.password = cleanPassword;
    }

    const token = generateToken(mockUser._id, mockUser.role);
    return res.json({ ...mockUser, token });
  }
};

module.exports = { registerUser, loginUser, googleLogin, getUserProfile, updateUserProfile };
