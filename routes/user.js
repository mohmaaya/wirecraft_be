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
    const friendUsername = req.body.friendUsername;
    const userUsername = req.user.username;

    const user = await userModel.findOne({ username: userUsername });
    const friend = await userModel.findOne({ username: friendUsername });

    if (user && friend) {
      user.friends.push(friend._id);
      friend.friends.push(user._id);

      user.pendingRequests = user.pendingRequests.filter(request => !request._id.equals(friend._id));
      friend.sentRequests = friend.sentRequests.filter(request => !request._id.equals(user._id));

      await Promise.all([user.save(), friend.save()]);
      res.json({ message: "Successfully added" });
    } else {
      res.status(404).json({ error: 'user or friend not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});


// get method for user details
router.get('/myprofile', authenticateToken, async (req, res) => {
  try {
    const userUsername = req.user.username;

    const user = await userModel.findOne({username: userUsername});

    if (user) {
     const userDetails = {
      name: user.name, dob: user.dob, city: user.city, latitude: user.latitude,
      longitude: user.longitude, designation:user.designation, friends: user.friends.length
      }
      res.json(userDetails);
    } else {
      res.status(404).json({ error: 'user not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

  // post method to accept the pending requests
  router.post('/sendrequest', authenticateToken, async (req, res) => {
    try {
      const friendUsername = req.body.friendUsername;
      const username= req.user.username
      const userId = req.user._id
  
      const user = await userModel.findOne({username: username});
      const friend = await userModel.findOne({username: friendUsername});
 
      if (user && friend) {
        friend.pendingRequests.push(userId);
        user.sentRequests.push(friend._id);

        await Promise.all([user.save(), friend.save()]);
        res.json({message: "Successfully sent request"});
      } else {
        res.status(404).json({ error: 'Friend not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
  });

  //method to remove a friend
  router.post('/removefriend', authenticateToken, async (req, res) => {
    try {
      const friendUsername = req.body.friendUsername;
      const userUsername = req.user.username;
  
      const user = await userModel.findOne({username: userUsername});
      const friend = await userModel.findOne({username: friendUsername});
 
      if (user && friend) {
        user.friends = user.friends.filter(eachFriend => !eachFriend._id.equals(friend._id))
        friend.friends = friend.friends.filter(eachFriend => !eachFriend._id.equals(user._id))

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
      const friendUsername = req.body.friendUsername;
      const userUsername = req.user.username;
      const user = await userModel.findOne({username: userUsername});
      const friend = await userModel.findOne({username: friendUsername});
      
      if (user && friend) {
        user.pendingRequests = user.pendingRequests.filter(request => !request._id.equals(friend._id))
        friend.sentRequests = friend.sentRequests.filter(request => !request._id.equals(user._id))

        await Promise.all([user.save(), friend.save()]);
        res.json({message: "Request succesfully declined"});
      } else {
        res.status(404).json({ error: 'user or friend not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user or friend', error });
    }
  });

  //method to cancel a friend request
  router.post('/cancelrequest', authenticateToken, async (req, res) => {
    try {
      const friendUsername = req.body.friendUsername;
      const userUsername = req.user.username;
  
      const user = await userModel.findOne({username: userUsername});
      const friend = await userModel.findOne({username: friendUsername});
      
      if (user && friend) {
        friend.pendingRequests = friend.pendingRequests.filter(request => !request._id.equals(user._id))
        user.sentRequests = user.sentRequests.filter(request => !request._id.equals(friend._id))

        await Promise.all([user.save(), friend.save()]);
        res.json({message: "Request succesfully cancelled"});
      } else {
        res.status(404).json({ error: 'user or friend not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user or friend', error });
    }
  });

  //method to get all users who can be added
  router.get('/addfriends', authenticateToken, async (req, res) => {
    const username = req.user.username;
  
    try {
      const currentUser = await userModel.findOne({ username });
      const sentRequests = currentUser.sentRequests;
      const friends = currentUser.friends;
      const pendingRequests = currentUser.pendingRequests;
  
      const users = await userModel.find({
        username: { $ne: username },
        _id: { $nin: [...sentRequests, ...friends, ...pendingRequests] }
      });
  
      const friendsFilteredDetails = users.map(user => ({
        username: user.username,
        name: user.name,
        city: user.city
      }));
  
      res.json(friendsFilteredDetails);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  })
  
    // get method to view all sent requests
router.get('/sentrequests', authenticateToken,  async (req, res) => {

  const username = req.user.username;
    try {
      const user = await userModel.findOne({ username: username }).populate('sentRequests', 'name username');
      const sentRequests = user.sentRequests.map(req => req)
      res.json(sentRequests);
    } catch (error) {
      
      res.status(500).json({ error: 'Failed to retrieve sent requests' });
    }
  })


  // get method to view all added friends
router.get('/myfriends', authenticateToken,  async (req, res) => {

  const username = req.user.username;
    try {
      const user = await userModel.findOne({ username: username }).populate('friends', 'name username dob city ');
      const myFriends = user.friends.map(friend =>friend);
      res.json(myFriends);
    } catch (error) {
      
      res.status(500).json({ error: 'Failed to retrieve friends' });
    }
  })

  // get method to send the pending requests
router.get('/checkpending', authenticateToken,  async (req, res) => {

  const username = req.user.username;
    try {
      const user = await userModel.findOne({ username: username }).populate('pendingRequests', 'name username');
      const pendingRequests = user.pendingRequests.map(request => ({ username: request.username, name: request.name }));
      res.json(pendingRequests);
    } catch (error) {
      
      res.status(500).json({ error: 'Failed to retrieve pending requests' });
    }
  })

  //get method to receive the closest distance friend(s)
  router.get('/friends/closest/:number', authenticateToken, async (req, res) => {
    try {
     
      const number = req.params.number;
      const username = req.user.username;
     
      const user = await userModel.findOne({ username: username }).populate('friends', 'name latitude longitude city');

      if (user) {
        const userLatitude = user.latitude;
        const userLongitude = user.longitude;
        const friendCoordinates = user.friends.map(friend => friend);
        const distances = findGeoLocationDistances(userLatitude, userLongitude, friendCoordinates);

        const closestFriends = distances.slice(0, number);
        res.json({ city: user.city, closestFriends });
      } 
    } catch (error) {
      res.status(500).json({ error: "Failed to recieve friend's distances" });
    }
  });



  function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const accessToken = authHeader && authHeader.split(' ')[1]
    try {
      const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = user;
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Access token expired' });
      } else {
        console.log(err);
        res.status(403).json({ message: 'Invalid access token' });
      }
    }
  };
  
module.exports = router