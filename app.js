const express = require('express');
const pool = require('./connection');
const { authenticateToken } = require('./middlewares/auth');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(express.json());

// Middleware to authenticate token for protected routes
app.use('/users', authenticateToken);

// GET route to fetch and display users in a table format
app.get('/users', (req, res) => {
  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL database connection:', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      connection.query('SELECT user_id, username, role_id, created_at FROM users', (error, results) => {
        connection.release();
        if (error) {
          console.error('Error executing query:', error.stack);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results);
      });
      
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST method to create a new user (secured with authenticateToken middleware)
app.post('/users', authenticateToken, (req, res) => {
  const { username, role_id } = req.body;
  const created_at = new Date(); // Get the current timestamp

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL database connection:', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      connection.query(
        'INSERT INTO users (username, role_id, created_at) VALUES (?, ?, ?)',
        [username, role_id, created_at],
        (error, results) => {
          connection.release();
          if (error) {
            console.error('Error executing query:', error.stack);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          res.json({ message: 'User created successfully', userId: results.insertId });
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/auth', (req,res)=>{ 
  try {
    const {username, password} = req.body; 
  
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL database connection:', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      connection.query('SELECT username, password FROM users', (error, results) => {
        connection.release();
        if (error) {
          console.error('Error executing query:', error.stack);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results == [] || results.length <= 0) {
          return res.status(404).json({ error: 'User not found' });

        } 

        const token = jwt.sign({ user: results}, 'rafiki', {
          expiresIn: '1h',
          });

          res.json({data:results, token: token});
      });
      
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})


app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
