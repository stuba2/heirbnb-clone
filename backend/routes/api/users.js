const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth, restoreUser, isGetUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const { validateSignup, validateLogin } = require('../../utils/validators/users');

const router = express.Router();



// Sign up
router.post('/', validateSignup, async (req, res) => {
    const { email, password, username, firstName, lastName } = req.body;
    const hashedPassword = bcrypt.hashSync(password);

    // User already exists errors
    let errors = {}
    const userExistsEmail = await User.findAll({
      where: {
        email: email
      }
    })
    const userExistsUsername = await User.findAll({
      where: {
        username: username
      }
    })

    if (userExistsEmail[0]) {
      errors.email = "User with that email already exists"
    }
    if (userExistsUsername[0]) {
      errors.username = "User with that username already exists"
    }
    if (errors.email || errors.username) {
      res.status(500)
      return res.json({
        message: "User already exists",
        errors
      })
    }


    // Validation errors
    if (!email.includes('@')) {
      errors.email = "The provided email is invalid"
    }
    if (!email) {
      errors.email = "The provided email is invalid"
    }
    if (username.includes('@')) {
      errors.username = "Username cannot be an email"
    }
    if (username.length < 4) {
      errors.username = "Please provide a username with at least 4 characters"
    }
    if (!username) {
      errors.username = "Username is required"
    }
    if (password.length < 6) {
      errors.password = "Password must be 6 characters of more"
    }
    if (!password) {
      errors.password = "Password is required"
    }
    if (!firstName) {
      errors.firstName = "First Name is required"
    }
    if (!lastName) {
      errors.lastName = "Last Name is required"
    }

    if (errors.email || errors.username || errors.password || errors.firstName || errors.lastName) {
      res.status(400)
      return res.json({
        message: "Bad Request",
        errors
      })
    }


    const user = await User.create({ email, username, hashedPassword, firstName, lastName });

    const safeUser = user.toSafeUser();

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser
    });
  }
);


// // Log in
// router.post('/login', validateLogin, async (req, res, next) => {
//   const { credential, password } = req.body;

//   const user = await User.unscoped().findOne({
//       // allows either username or password to log in
//       where: {
//         [Op.or]: {
//           username: credential,
//           email: credential
//         }
//       }
//     });

//     if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
//       res.status(401)
//       return res.json({
//         message: "Invalid credentials"
//       })
//     }

//     const safeUser = {
//       id: user.id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       username: user.username,
//     };

//     await setTokenCookie(res, safeUser);

//     return res.json({
//       user: safeUser
//     });
//   }
// );

// // Get Current User
// router.get('/', restoreUser, requireAuth, isGetUser, async (req, res) => {

//   const user = req.user
//   const currentUser = await User.findOne({
//     where: {
//       id: user.id
//     },
//     attributes: ['id','firstName','lastName','email','username']
//   });

//   res.json({user: currentUser})
// })

module.exports = router;
