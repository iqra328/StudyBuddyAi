const { OAuth2Client } = require('google-auth-library')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ✅ Handle OPTIONS preflight request
router.options('/google', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.status(200).end()
})

// Google OAuth route
router.post('/google', async (req, res) => {
  // ✅ Add CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  
  try {
    const { credential } = req.body
    
    console.log('🔐 Google auth request received')
    
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    
    const payload = ticket.getPayload()
    const { email, name, picture } = payload
    
    console.log('✅ Google user verified:', email)
    
    let user = await User.findOne({ email })
    
    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email: email,
        password: 'google-auth-' + Date.now(),
        profilePicture: picture || '',
        createdAt: new Date()
      })
      await user.save()
      console.log('📝 New user created:', email)
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    })
  } catch (error) {
    console.error('❌ Google auth error:', error)
    res.status(500).json({ message: 'Google authentication failed', error: error.message })
  }
})