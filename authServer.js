require('dotenv').config();
const express = require('express')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const userModel = require('./models/user')
const RefreshToken = require('./models/refreshToken')
const geoLocation = require('./externalAPIs/geoLocation')
const app = express()
const cors = require('cors');


app.use(cors({
    origin: "*",
    credentials: "include"
}));

app.use(express.json())

app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to DB'))


//post method of user SignUp
app.post('/signup', async (req, res) =>{
  try{
        const salt = await bcrypt.genSalt();
        const {password, ...data} = req.body.data;
        const usernameExist = await userModel.find({username:data.username});
        if(usernameExist.length != 0) {
          return res.status(400).json({error: 'username already taken'});
        }
        const encryptedPassword = await bcrypt.hash(password, salt);
        const _geoLocation = await geoLocation(data.city);
        const {latitude, longitude} = _geoLocation[0];
        const newUser = {...data, password:encryptedPassword, latitude:latitude, longitude:longitude};
        const user = new userModel(newUser);
         
        await user.save();

        res.status(201).json({message: 'User Created!'});
    } catch(error){
        res.status(500).json({error:'Failure. User not created.'+ error});
    }
    
})

//post method of user login
app.post('/login', async (req, res) => {
    try {
      const {username, password} = req.body.data;
      const user = await userModel.findOne({username:username});
      if(user == null) {
        return res.status(400).json({error: 'User not found'});
      }
      if (await bcrypt.compare(password, user.password)){
        const _user = { _id: user._id, username : user.username};
        const accessToken = generateAccessToken(_user);
        const refreshTokenExist = await RefreshToken.find({username:_user.username});
        if(refreshTokenExist.length == 0) {
          const refreshToken = jwt.sign( _user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '10m' });
          _refreshToken = new RefreshToken({token: refreshToken, username: _user.username});
          await _refreshToken.save()
        }
        res.cookie('access_token', accessToken, { httpOnly: true })
        .status(200).json({ username: username });

      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user', error });
    }
  });


const getPayloadFromAccessToken = (accessToken) => {
    try {
      const decodedToken = jwt.decode(accessToken);
      return decodedToken;
    } catch (err) {
      throw new Error('Failed to decode access token');
    }
};


function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2m' })
}


//Method to refresh the expired token
app.post('/refresh_token', async (req, res) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    res.status(401).json({ message: 'Access token not found' });
    return;
  }

  const accessTokenPayload = getPayloadFromAccessToken(accessToken);
  
  try {
    const refreshToken = await RefreshToken.findOne({username: accessTokenPayload.username});
    jwt.verify(refreshToken.token, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken({ _id: accessTokenPayload._id, username: accessTokenPayload.username});
    res.cookie('access_token', newAccessToken, { httpOnly: true });

    res.status(200).json({ message: 'Access token refreshed' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired access token or refresh token',err });
  }
});

app.delete('/logout', async (req, res) => {
  
  
  const payLoad = getPayloadFromAccessToken(req.cookies.access_token);
  try{
   if(payLoad) await RefreshToken.deleteOne({username: payLoad.username});
    res.clearCookie('access_token')
    .status(204)
    .json({messafe: "Log Out was Success"})
  }catch(err){
    res.status(401).json({message: 'Something went wrong!',err})
  }
})

app.listen(5000)