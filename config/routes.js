const axios = require('axios');
const bcrypt = require('bcryptjs');
const db = require('../database/dbConfig.js')
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
  server.get('/',(req,res)=>{res.send('Server Running')})//test if running
};

function generateToken(user) {
  const payload = {
      // subject: user.id,
      username: user.username
  };

  // const secret = "Q948573-4958EPOIRJG;LSKFGJQ948TU49387OIJ;LJT9J4";
  const options = {
      expiresIn: '1h',
  }
  return jwt.sign(payload, secret, options);
}

function register(req, res) {
  // implement user registration
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.password, 14);
  creds.password = hash;
  db('users').insert(creds)
  .then(userId => {
    res.status(200).json(userId)
  })
  .catch(err => {
    res.json(err)
  })
}

function login(req, res) {
  // implement user login
  const creds = req.body;
  if(creds.username && creds.password){
    db('users')
    .where({username : creds.username})
    .then(user => {
      if(user && bcrypt.compareSync(creds.password,user[0].password)){
        const token = generateToken(user[0])
        res.status(200).json({Token : token});
      }else{
        res.status(401).json({Error : "You shall not pass!"})
      }
    })
    .catch(err =>{
      res.json({Error : err})
    })
  }else{
    res.send('Must include username and password in request')
  }
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
