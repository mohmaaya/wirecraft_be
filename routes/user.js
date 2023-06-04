const express = require('express')
const userModel = require('../models/user')
const router = express.Router()
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

router.use(cookieParser());

// get user by username
router.get('/users/:username', authenticateToken, async (req, res) => {
    try {
      const username = req.params.username;
      console.log(username)
      const user = await userModel.find({username: username});
      
      console.log("user",user);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user', error });
    }
  });

// get all users
router.get('/users', async (req, res) => {
    try {
      const users = await userModel.find();
  
      res.json(users);
    } catch (error) {
      
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  })

//delete a user
router.delete('/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
  
      const deletedUser = await userModel.findByIdAndDelete(userId);

      if (deletedUser) {
        res.json({ message: 'User deleted successfully' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {

      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  //update query for address or/and description
  router.put('/users/:id', async (req, res) => {
    try {
     
      const userId = req.params.id;
      const { address, description } = req.body;
      const updateFields = {};
  
      if (address) {
        updateFields.address = address;
      }
      if (description) {
        updateFields.description = description;
      }

      const updatedUser = await userModel.findByIdAndUpdate(userId, updateFields, { new: true });
  
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });



  function authenticateToken(req, res, next) {
    
    const accessToken = req.cookies.access_token;
    console.log("token",accessToken)
    try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403).json({message : err})
      console.log("user", user)
      next();
    });
    } catch (err){
        res.status(401).json({ message: 'Invalid or expired access token'+err });
      }
  };

module.exports = router