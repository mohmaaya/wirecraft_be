const express = require('express')
const userModel = require('../models/user')
const router = express.Router()
const cookieParser = require('cookie-parser');
const {findGeoLocationDistances} = require('../externalAPIs/distanceCalc')
const jwt = require('jsonwebtoken');

router.use(cookieParser());

// post method to accept request
router.post('/acceptfriend', authenticateToken, async (req, res) => {
    try {
      const friendUsername = req.body.username;
      const userUsername = req.user.username;
  
      const user = await userModel.findOne({username: userUsername});
      const friend = await userModel.findOne({username: friendUsername});
 
      if (user && friend) {
        user.friends.push(friend._id);
        friend.friends.push(user._id);

        user.pendingRequests = user.pendingRequests.filter(request => (request._id == friend._id));
        await Promise.all([user.save(), friend.save()]);
        res.json({message: "Successfully added"});
      } else {
        res.status(404).json({ error: 'user or friend not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user', error });
    }
  });

  // post method to accept the pending requests
  router.post('/pendingrequest', authenticateToken, async (req, res) => {
    try {
      const friendUsername = req.body.username;
      const userId= req.user._id
  
      const friend = await userModel.findOne({username: friendUsername});
 
      if (friend) {
        friend.pendingRequests.push(userId);

        await friend.save();
        res.json({message: "Successfully sent request"});
      } else {
        res.status(404).json({ error: 'Friend not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user', error });
    }
  });

  //method to remove a friend
  router.post('/removefriend', authenticateToken, async (req, res) => {
    try {
      const friendUsername = req.body.username;
      const userUsername = req.user.username;
  
      const user = await userModel.findOne({username: userUsername});
      const friend = await userModel.findOne({username: friendUsername});
 
      if (user && friend) {
        user.friends = user.friends.filter(eachFriend => eachFriend._id == friend._id )
        friend.friends = friend.friends.filter(eachFriend => eachFriend._id == user._id )

        await Promise.all([user.save(), friend.save()]);
        res.json({message: "Successfully removed"});
      } else {
        res.status(404).json({ error: 'user or friend not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve useror friend', error });
    }
  });

   //method to decline a friend request
   router.post('/declinerequest', authenticateToken, async (req, res) => {
    try {
      const friendUsername = req.body.username;
      const userUsername = req.user.username;
  
      const user = await userModel.findOne({username: userUsername});
      const friend = await userModel.findOne({username: friendUsername});
      
      if (user && friend) {
        user.pendingRequests = user.pendingRequests.filter(request => request._id == friend._id)

        await user.save();
        res.json({message: "Request succesfully declined"});
      } else {
        res.status(404).json({ error: 'user or friend not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user or friend', error });
    }
  });


// get method to add friends
router.get('/addfriends', authenticateToken,  async (req, res) => {

  const username = req.user.username;
    try {
      const users = await userModel.find({ username: {$ne: username}});
      console.log(users);
      const friendsFilteredDetails = users.map(user => ({ username: user.username, name: user.name }));
      res.json(friendsFilteredDetails);
    } catch (error) {
      
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  })

  //get method to receive the closest distance friend(s)
  router.get('/friends/:number', authenticateToken, async (req, res) => {
    try {
     
      const number = req.params.number;
      const username = req.user.username;
     
      const user = await userModel.findOne({ username: username }).populate('friends', 'name latitude longitude city');

      if (user) {
        const userLatitude = user.latitude;
        const userLongitude = user.longitude;
        const friendCoordinates = user.friends.map(friend => friend);
        console.log(friendCoordinates);
        const distances = findGeoLocationDistances(userLatitude, userLongitude, friendCoordinates);

        const closestFriends = distances.slice(0, number);
        res.json({ city: user.city, closestFriends });
      } else {
          console.log('User not found');
        }
    } catch (error) {
      res.status(500).json({ error: "Failed to recieve friend's distances" });
    }
  });



  function authenticateToken(req, res, next) {
    
    const accessToken = req.cookies.access_token;

    try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403).json({message : err})

      req.user = user;
      next();
    });
    } catch (err){
        res.status(401).json({ message: 'Invalid or expired access token'+err });
      }
  };

module.exports = router