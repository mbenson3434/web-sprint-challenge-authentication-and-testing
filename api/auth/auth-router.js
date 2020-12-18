const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secrets = require("../../config/secrets");
const db = require("./auth-model");


router.post('/register', checkClient, (req, res) => {
  db.getUserByUsername(req.body.username)
    .then(data => {
      if (data) {
        res.status(400).json("username taken");
      } else {
        const credentials = req.body;
        const hash = bcrypt.hashSync(credentials.password, 14);
        credentials.password = hash;
        db.addUser(credentials)
          .then(data => {
            res.status(201).json(data);
          });
      }
    });
});

router.post('/login', checkClient, (req, res) => {
  db.getUserByUsername(req.body.username)
    .then(data => {
      if (!data || !bcrypt.compareSync(req.body.password, data.password)) {
        res.status(401).json("invalid credentials");
      } else {
        const token = makeToken(data);
        res.status(200).json({
          message: `Welcome ${data.username}! Here is your token: `,
          token,
        });
      }
    });
});

function checkClient(req, res, next) {
  if (!req.body.password || !req.body.username) {
    res.status(500).json("username and password required");
  } else {
    next();
  }
}

function makeToken(user) {
  const payload = {
    subject: user.username
  };
  const options = {
    expiresIn: '2d'
  };
  return jwt.sign(payload, secrets.jwtSecret, options);
}

module.exports = router;
