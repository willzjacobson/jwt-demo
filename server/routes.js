const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');

const User = require('./user-model');
const router = express.Router();
const jwtSecret = 'stringOfGibberishFedInAsAnEnvironmentVariable';


const asyncWrapper = fn => (req, res, next) =>
	Promise.resolve(fn(req, res, next))
		.catch(err => {
      console.log('Error caught by asyncWrapper', err);
      res.status(500).json(err)
    });


// This route is just for us to be able to see what's in the db
// A client app acting as a single user would NOT be able to access it
router.get('/user', asyncWrapper(async (req, res) => {
  res.json(await User.find({}));
}));

router.post('/auth/signup', asyncWrapper(async (req, res) => {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (user) {
      return res.status(401).json({
        success: false,
        message: 'Username taken'
      });
    }

    // generate salt
    // create hash from plaintext pw + salt, 
		// store hash pw (do not save plaintext pw)

		const newUser = new User({
			username,
			password,
    });

    await newUser.save();

		res.status(201).json(newUser);
}));

router.post('/auth/signin', asyncWrapper(async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // find user by username.
    // if one exists, hash the pw and match with stored hash
    // if hashes match, return a valid jwt
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect un/pw combination'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect un/pw combination'
      });
    }

    // Successful login -- generate & send JWT
    // 'exp' : expiration time - automatically respected by 'express-jwt' middleware
    const token = jwt.sign({
      username: user.username,
      user_id: user._id,
      scope: user.scope,
      exp: Math.round(Date.now() / 1000) + 8 * 60 * 60, // 8 hours from now, measured in seconds after 1970-01-01T00:00:00Z UTC
    }, jwtSecret);

    res.status(201).json({ success: true, token});
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}));


// Here we use the express-jwt middleware to require a jwt in the Authentication header
// Decode the jwt and try to match the signature using our secret
// If signatures match, attach the decoded jwt as `req.user`
// The user should have the scope 'read:resource', so access to this route should be granted
router.get('/protected-resource',
  expressJwt({ secret: jwtSecret }),
  jwtAuthz([ 'read:resource' ]),
  asyncWrapper(async (req, res) => {
    console.log('"req.user" is the decoded JWT:', req.user);

    // Lets pretend this route is for fetching financial info specific to this user
    // To insure we dont give someone's financial info to a user logged in as someone else,
    // we would confirm that the user's identity (from the JWT) matches the subject of the request
    // (as specified in the request param/body, etc.)

    res.json('Looks like you\'re legit, so here ya go...');
  })
);

// The user will not have the scope 'write:resource', so access to this route will be denied
// unless you include that scope in the payload to '/auth/signup`
router.post('/protected-resource',
  expressJwt({ secret: jwtSecret }),
  jwtAuthz([ 'write:resource' ]),
  asyncWrapper(async (req, res) => {
	  res.json('Now performing a very sensitive action');
  })
);

module.exports = router;
