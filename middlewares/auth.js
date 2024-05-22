const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    console.error('Unauthorized: Token not provided');
    return res.status(401).json({ error: 'Unauthorized: Token not provided' });
  }

  // Remove 'Bearer ' prefix from token string
  const tokenString = token.replace('Bearer ', '');

  jwt.verify(tokenString, 'rafiki', (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    console.log('Token verified. User:', user);
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
