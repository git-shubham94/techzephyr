const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.userId}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });


// Serve static avatar files
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

// In-memory storage
const users = [];
const projects = [];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};


// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SkilLink API is running!',
    timestamp: new Date().toISOString()
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all projects
app.get('/api/projects', (req, res) => {
  try {
    const projectsWithUsers = projects.map(project => {
      const creator = users.find(u => u.id === project.creatorId);
      return {
        ...project,
        creatorName: creator?.name || 'Unknown',
      };
    });
    res.json(projectsWithUsers);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create new project (protected)
app.post('/api/projects', verifyToken, (req, res) => {
  try {
    const { title, description, skills, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const newProject = {
      id: Date.now().toString(),
      title,
      description,
      skills: skills || [],
      location: location || '',
      creatorId: req.userId,
      members: [req.userId],
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    projects.push(newProject);

    const creator = users.find(u => u.id === req.userId);

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        ...newProject,
        creatorName: creator?.name || 'Unknown',
      },
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Join a project (protected)
app.post('/api/projects/:id/join', verifyToken, (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.userId;

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({ error: 'Already a member of this project' });
    }

    project.members.push(userId);

    res.json({
      message: 'Successfully joined project',
      project,
    });
  } catch (error) {
    console.error('Join project error:', error);
    res.status(500).json({ error: 'Failed to join project' });
  }
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
  try {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const creator = users.find(u => u.id === project.creatorId);
    res.json({
      ...project,
      creatorName: creator?.name || 'Unknown',
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});
// Update user profile (protected route)
app.put('/api/users/profile', verifyToken, async (req, res) => {
  try {
    const { name, bio, location, phone, avatar } = req.body;
    
    const userIndex = users.findIndex(u => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      bio: bio || users[userIndex].bio,
      location: location || users[userIndex].location,
      phone: phone || users[userIndex].phone,
      avatar: avatar || users[userIndex].avatar,
      updatedAt: new Date().toISOString()
    };

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: users[userIndex].id,
        email: users[userIndex].email,
        name: users[userIndex].name,
        bio: users[userIndex].bio,
        location: users[userIndex].location,
        phone: users[userIndex].phone,
        avatar: users[userIndex].avatar,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
// Upload avatar (protected route)
app.post('/api/users/avatar', verifyToken, upload.single('avatar'), (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.avatar = req.file.filename;

  res.json({
    message: 'Avatar uploaded successfully',
    avatarUrl: `/uploads/avatars/${req.file.filename}`
  });
});


// In-memory skills storage
const userSkills = []; // { userId, skillName, type: 'offering'/'seeking', proficiency: 1-5 }

// Add skill (protected route)
app.post('/api/skills', verifyToken, (req, res) => {
  try {
    const { skillName, type, proficiency } = req.body;

    if (!skillName || !type) {
      return res.status(400).json({ error: 'Skill name and type are required' });
    }

    if (!['offering', 'seeking'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "offering" or "seeking"' });
    }

    // Check if skill already exists
    const existingSkill = userSkills.find(
      s => s.userId === req.userId && s.skillName === skillName && s.type === type
    );

    if (existingSkill) {
      return res.status(400).json({ error: 'Skill already added' });
    }

    const newSkill = {
      id: Date.now().toString(),
      userId: req.userId,
      skillName,
      type,
      proficiency: proficiency || 3,
      createdAt: new Date().toISOString()
    };

    userSkills.push(newSkill);

    res.status(201).json({
      message: 'Skill added successfully',
      skill: newSkill
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

// Get user skills (protected route)
app.get('/api/skills', verifyToken, (req, res) => {
  try {
    const skills = userSkills.filter(s => s.userId === req.userId);
    
    const offering = skills.filter(s => s.type === 'offering');
    const seeking = skills.filter(s => s.type === 'seeking');

    res.json({
      offering,
      seeking
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Delete skill (protected route)
app.delete('/api/skills/:id', verifyToken, (req, res) => {
  try {
    const skillIndex = userSkills.findIndex(
      s => s.id === req.params.id && s.userId === req.userId
    );

    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    userSkills.splice(skillIndex, 1);

    res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// Search users by skills
app.get('/api/users/search', (req, res) => {
  try {
    const { skill, type, location } = req.query;

    let filteredSkills = userSkills;

    // Filter by skill name
    if (skill) {
      filteredSkills = filteredSkills.filter(s => 
        s.skillName.toLowerCase().includes(skill.toLowerCase())
      );
    }

    // Filter by type
    if (type) {
      filteredSkills = filteredSkills.filter(s => s.type === type);
    }

    // Get unique users
    const userIds = [...new Set(filteredSkills.map(s => s.userId))];
    
    const results = userIds.map(userId => {
      const user = users.find(u => u.id === userId);
      const skills = filteredSkills.filter(s => s.userId === userId);
      
      return {
        id: user.id,
        name: user.name,
        bio: user.bio,
        location: user.location,
        avatar: user.avatar,
        skills: skills.map(s => ({
          name: s.skillName,
          type: s.type,
          proficiency: s.proficiency
        }))
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});
// In-memory bookings storage
const bookings = [];

// Create booking (protected route)
app.post('/api/bookings', verifyToken, (req, res) => {
  try {
    const { providerId, skillId, date, time, duration, message } = req.body;

    if (!providerId || !date || !time) {
      return res.status(400).json({ error: 'Provider, date, and time are required' });
    }

    // Check if provider exists
    const provider = users.find(u => u.id === providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Check for time conflicts
    const requestedDateTime = new Date(`${date}T${time}`);
    const requestedEndTime = new Date(requestedDateTime.getTime() + (duration || 60) * 60000);

    const hasConflict = bookings.some(b => {
      if (b.status === 'cancelled') return false;
      
      const bookingStart = new Date(`${b.date}T${b.time}`);
      const bookingEnd = new Date(bookingStart.getTime() + b.duration * 60000);
      
      return (
        (b.providerId === providerId || b.seekerId === req.userId) &&
        ((requestedDateTime >= bookingStart && requestedDateTime < bookingEnd) ||
         (requestedEndTime > bookingStart && requestedEndTime <= bookingEnd) ||
         (requestedDateTime <= bookingStart && requestedEndTime >= bookingEnd))
      );
    });

    if (hasConflict) {
      return res.status(400).json({ error: 'Time slot conflict detected' });
    }

    const newBooking = {
      id: Date.now().toString(),
      providerId,
      seekerId: req.userId,
      skillId: skillId || null,
      date,
      time,
      duration: duration || 60,
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);

    const seeker = users.find(u => u.id === req.userId);

    res.status(201).json({
      message: 'Booking request sent successfully',
      booking: {
        ...newBooking,
        providerName: provider.name,
        seekerName: seeker.name
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings (protected route)
app.get('/api/bookings', verifyToken, (req, res) => {
  try {
    const userBookings = bookings.filter(
      b => b.providerId === req.userId || b.seekerId === req.userId
    );

    const bookingsWithDetails = userBookings.map(booking => {
      const provider = users.find(u => u.id === booking.providerId);
      const seeker = users.find(u => u.id === booking.seekerId);
      
      return {
        ...booking,
        providerName: provider?.name || 'Unknown',
        seekerName: seeker?.name || 'Unknown',
        isProvider: booking.providerId === req.userId
      };
    });

    res.json(bookingsWithDetails);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status (protected route)
app.patch('/api/bookings/:id', verifyToken, (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[bookingIndex];

    // Only provider can confirm, both can cancel, only after session can complete
    if (status === 'confirmed' && booking.providerId !== req.userId) {
      return res.status(403).json({ error: 'Only provider can confirm bookings' });
    }

    bookings[bookingIndex] = {
      ...booking,
      status,
      updatedAt: new Date().toISOString()
    };

    res.json({
      message: `Booking ${status} successfully`,
      booking: bookings[bookingIndex]
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});
// In-memory reviews storage
const reviews = [];

// Add review (protected route - only after completed session)
app.post('/api/reviews', verifyToken, (req, res) => {
  try {
    const { revieweeId, bookingId, rating, comment, skillId } = req.body;

    if (!revieweeId || !rating) {
      return res.status(400).json({ error: 'Reviewee and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify booking exists and is completed
    if (bookingId) {
      const booking = bookings.find(b => 
        b.id === bookingId && 
        b.status === 'completed' &&
        (b.providerId === revieweeId || b.seekerId === revieweeId) &&
        (b.providerId === req.userId || b.seekerId === req.userId)
      );

      if (!booking) {
        return res.status(400).json({ error: 'Invalid booking or not completed yet' });
      }

      // Check if already reviewed
      const existingReview = reviews.find(r => 
        r.bookingId === bookingId && r.reviewerId === req.userId
      );

      if (existingReview) {
        return res.status(400).json({ error: 'Already reviewed this session' });
      }
    }

    const newReview = {
      id: Date.now().toString(),
      reviewerId: req.userId,
      revieweeId,
      bookingId: bookingId || null,
      skillId: skillId || null,
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);

    const reviewer = users.find(u => u.id === req.userId);

    res.status(201).json({
      message: 'Review submitted successfully',
      review: {
        ...newReview,
        reviewerName: reviewer?.name || 'Anonymous'
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Get user reviews
app.get('/api/reviews/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    
    const userReviews = reviews.filter(r => r.revieweeId === userId);

    const reviewsWithDetails = userReviews.map(review => {
      const reviewer = users.find(u => u.id === review.reviewerId);
      return {
        ...review,
        reviewerName: reviewer?.name || 'Anonymous'
      };
    });

    // Calculate stats
    const totalReviews = userReviews.length;
    const avgRating = totalReviews > 0
      ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    const ratingDistribution = {
      5: userReviews.filter(r => r.rating === 5).length,
      4: userReviews.filter(r => r.rating === 4).length,
      3: userReviews.filter(r => r.rating === 3).length,
      2: userReviews.filter(r => r.rating === 2).length,
      1: userReviews.filter(r => r.rating === 1).length,
    };

    res.json({
      reviews: reviewsWithDetails,
      stats: {
        totalReviews,
        avgRating: parseFloat(avgRating),
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get user reputation score
app.get('/api/users/:userId/reputation', (req, res) => {
  try {
    const userId = req.params.userId;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get reviews
    const userReviews = reviews.filter(r => r.revieweeId === userId);
    const avgRating = userReviews.length > 0
      ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
      : 0;

    // Get completed sessions
    const completedSessions = bookings.filter(
      b => (b.providerId === userId || b.seekerId === userId) && b.status === 'completed'
    ).length;

    // Get endorsements (skills)
    const userSkillsList = userSkills.filter(s => s.userId === userId);

    // Calculate reputation score (weighted)
    // 50% avg rating, 30% completed sessions (max 100), 20% skills count (max 20)
    const reputationScore = (
      (avgRating * 10 * 0.5) +
      (Math.min(completedSessions / 10, 10) * 0.3 * 100) +
      (Math.min(userSkillsList.length / 2, 10) * 0.2 * 100)
    ) / 10;

    // Determine level
    let level = 'Newcomer';
    if (reputationScore >= 80) level = 'Expert';
    else if (reputationScore >= 60) level = 'Advanced';
    else if (reputationScore >= 40) level = 'Intermediate';
    else if (reputationScore >= 20) level = 'Beginner';

    res.json({
      userId,
      userName: user.name,
      reputationScore: parseFloat(reputationScore.toFixed(1)),
      level,
      stats: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: userReviews.length,
        completedSessions,
        totalSkills: userSkillsList.length
      }
    });
  } catch (error) {
    console.error('Get reputation error:', error);
    res.status(500).json({ error: 'Failed to fetch reputation' });
  }
});

/* ---------------------------
   CREDITS SYSTEM (ADDED HERE)
   --------------------------- */

// Initialize user credits (add to existing users on first access)
const initializeUserCredits = (userId) => {
  const user = users.find(u => u.id === userId);
  if (user && user.creditBalance === undefined) {
    user.creditBalance = 100; // Starting credits
  }
};

// In-memory credit transactions
const creditTransactions = [];

// Credit actions with values
const CREDIT_ACTIONS = {
  SESSION_COMPLETE_PROVIDER: 20,
  SESSION_COMPLETE_SEEKER: -10,
  PROFILE_COMPLETE: 10,
  FIRST_REVIEW: 5,
  PROJECT_CREATE: -5,
  PROJECT_JOIN: 0,
  SKILL_ADD: 2,
  REFERRAL: 15,
  SIGNUP_BONUS: 50
};

// Add credits transaction
const addCreditTransaction = (userId, amount, reason, relatedId = null) => {
  const user = users.find(u => u.id === userId);
  if (!user) return;

  initializeUserCredits(userId);

  const transaction = {
    id: Date.now().toString() + Math.random(),
    userId,
    amount,
    reason,
    relatedId,
    balanceBefore: user.creditBalance,
    balanceAfter: user.creditBalance + amount,
    createdAt: new Date().toISOString()
  };

  user.creditBalance += amount;
  creditTransactions.push(transaction);

  return transaction;
};

// Get user credits (protected route)
app.get('/api/credits', verifyToken, (req, res) => {
  try {
    initializeUserCredits(req.userId);
    
    const user = users.find(u => u.id === req.userId);
    const userTransactions = creditTransactions
      .filter(t => t.userId === req.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      balance: user.creditBalance,
      transactions: userTransactions
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

// Award credits for action (protected route)
app.post('/api/credits/award', verifyToken, (req, res) => {
  try {
    const { action, relatedId } = req.body;

    if (!CREDIT_ACTIONS[action]) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const amount = CREDIT_ACTIONS[action];
    const transaction = addCreditTransaction(
      req.userId,
      amount,
      action,
      relatedId
    );

    const user = users.find(u => u.id === req.userId);

    res.json({
      message: `${amount > 0 ? 'Earned' : 'Spent'} ${Math.abs(amount)} credits`,
      transaction,
      newBalance: user.creditBalance
    });
  } catch (error) {
    console.error('Award credits error:', error);
    res.status(500).json({ error: 'Failed to award credits' });
  }
});

// Redeem credits (protected route)
app.post('/api/credits/redeem', verifyToken, (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    initializeUserCredits(req.userId);
    const user = users.find(u => u.id === req.userId);

    if (user.creditBalance < amount) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    const transaction = addCreditTransaction(
      req.userId,
      -amount,
      reason || 'CREDIT_REDEMPTION',
      null
    );

    res.json({
      message: `Redeemed ${amount} credits`,
      transaction,
      newBalance: user.creditBalance
    });
  } catch (error) {
    console.error('Redeem credits error:', error);
    res.status(500).json({ error: 'Failed to redeem credits' });
  }
});

// Update booking completion to award credits
app.patch('/api/bookings/:id/complete', verifyToken, (req, res) => {
  try {
    const bookingId = req.params.id;
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[bookingIndex];

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Booking already completed' });
    }

    // Update status
    bookings[bookingIndex].status = 'completed';
    bookings[bookingIndex].updatedAt = new Date().toISOString();

    // Award credits
    addCreditTransaction(
      booking.providerId,
      CREDIT_ACTIONS.SESSION_COMPLETE_PROVIDER,
      'SESSION_COMPLETE_PROVIDER',
      bookingId
    );

    addCreditTransaction(
      booking.seekerId,
      CREDIT_ACTIONS.SESSION_COMPLETE_SEEKER,
      'SESSION_COMPLETE_SEEKER',
      bookingId
    );

    res.json({
      message: 'Booking completed and credits awarded',
      booking: bookings[bookingIndex]
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
});
// Update user location (protected route)
app.put('/api/users/location', verifyToken, (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const userIndex = users.findIndex(u => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].latitude = parseFloat(latitude);
    users[userIndex].longitude = parseFloat(longitude);
    users[userIndex].location = address || users[userIndex].location;

    res.json({
      message: 'Location updated successfully',
      location: {
        latitude: users[userIndex].latitude,
        longitude: users[userIndex].longitude,
        address: users[userIndex].location
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Search users by location and skills
app.get('/api/users/nearby', verifyToken, (req, res) => {
  try {
    const { skill, radius = 50, latitude, longitude } = req.query;

    const currentUser = users.find(u => u.id === req.userId);
    const userLat = latitude ? parseFloat(latitude) : currentUser?.latitude;
    const userLon = longitude ? parseFloat(longitude) : currentUser?.longitude;

    if (!userLat || !userLon) {
      return res.status(400).json({ error: 'Location not set. Please update your location.' });
    }

    // Get users with skills
    let matchingUsers = [];

    if (skill) {
      const skillMatches = userSkills.filter(s => 
        s.skillName.toLowerCase().includes(skill.toLowerCase()) &&
        s.type === 'offering'
      );
      const userIds = [...new Set(skillMatches.map(s => s.userId))];
      matchingUsers = userIds.map(id => users.find(u => u.id === id)).filter(Boolean);
    } else {
      matchingUsers = users.filter(u => u.id !== req.userId);
    }

    // Calculate distances and filter by radius
    const usersWithDistance = matchingUsers
      .filter(user => user.latitude && user.longitude)
      .map(user => {
        const distance = calculateDistance(userLat, userLon, user.latitude, user.longitude);
        return {
          id: user.id,
          name: user.name,
          bio: user.bio,
          location: user.location,
          latitude: user.latitude,
          longitude: user.longitude,
          distance: parseFloat(distance.toFixed(1)),
          skills: userSkills
            .filter(s => s.userId === user.id && s.type === 'offering')
            .map(s => ({ name: s.skillName, proficiency: s.proficiency }))
        };
      })
      .filter(user => user.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json(usersWithDistance);
  } catch (error) {
    console.error('Nearby search error:', error);
    res.status(500).json({ error: 'Failed to search nearby users' });
  }
});


/* ---------------------------
   END CREDITS SYSTEM
   --------------------------- */

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Registered users: ${users.length}`);
});
