const express = require('express');
const pool = require('./connection');
const { authenticateToken } = require('./middlewares/auth');

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

// POST method to create a new user
app.post('/users', (req, res) => {
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


// PUT method to update a user
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { username } = req.body;

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL database connection:', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      connection.query(
        'UPDATE users SET username = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [username, userId],
        (error, results) => {
          connection.release();
          if (error) {
            console.error('Error executing query:', error.stack);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          res.json({ message: 'User updated successfully', affectedRows: results.affectedRows });
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH method to partially update a user
app.patch('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { username } = req.body;

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL database connection:', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      const updateFields = [];
      const updateValues = [];

      if (username) {
        updateFields.push('username = ?');
        updateValues.push(username);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update provided' });
      }

      updateValues.push(userId);

      connection.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
        updateValues,
        (error, results) => {
          connection.release();
          if (error) {
            console.error('Error executing query:', error.stack);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          res.json({ message: 'User updated successfully', affectedRows: results.affectedRows });
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// DELETE method to delete a user
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL database connection:', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      connection.query(
        'DELETE FROM users WHERE user_id = ?',
        [userId],
        (error, results) => {
          connection.release();
          if (error) {
            console.error('Error executing query:', error.stack);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          res.json({ message: 'User deleted successfully', affectedRows: results.affectedRows });
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
