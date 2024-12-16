const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const { storeReturnTo, isLoggedIn } = require('../middleware')
const users = require('../controllers/users');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

//login routes
router.route('/login')
    .get(users.loginForm)
    .post(storeReturnTo,passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);

//logout route
router.get('/logout', users.logout);

module.exports = router;

