require('dotenv').config();
const express = require('express')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const userModel = require('./models/user')

const app = express()
const cors = require('cors');


app.use(cors({
    origin: "*"
}));

app.use(express.json())

let refreshTokens = []


app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to DB'))


//post method of user SignUp
app.post('/users/signup', async (req, res) =>{
  try{
        const salt = await bcrypt.genSalt();
        const {password, ...data} = req.body.data;
        console.log(password);
        console.log(data);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const newUser = {...data, password:encryptedPassword};
        console.log(newUser);
        const user = new userModel(newUser);
         
        await user.save();

        res.status(201).json({message: 'User Created!'});
    } catch(error){
        res.status(500).json({error:'Failure. User not created.'+ error});
    }
    
})

//post method of user login
app.post('/users/login', async (req, res) => {
    try {
      const {username, password} = req.body.data;
      const user = await userModel.find({username:username});
      if(user == null) {
        return res.status(400).json({error: 'User not found'});
      }
      if (await bcrypt.compare(password, user[0].password)){
        const _user = {username : user.username};
        const accessToken = generateAccessToken(_user);
        const refreshToken = jwt.sign(_user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '10d' });

        res.cookie('access_token', accessToken, { httpOnly: true });

        refreshTokens.push(refreshToken)
        res.status(200).json({ message: 'Logged In' });

      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user', error });
    }
  });


function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' })
}

app.post('/refresh_token', (req, res) => {
    const accessToken = req.cookies.access_token;

  if (!accessToken) {
    res.status(401).json({ message: 'Access token not found' });
    return;
  }

  
  try {
    const refreshToken = refreshTokens.find(token => token._user.username === accessToken._user.username);

    if (!refreshToken) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    jwt.verify(refreshToken.token, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = generateAccessToken();

    res.cookie('access_token', newAccessToken, { httpOnly: true });

    res.status(200).json({ message: 'Access token refreshed' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired access token or refresh token',err });
  }
});

app.listen(5000)