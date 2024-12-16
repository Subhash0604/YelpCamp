const express = require('express');
const router = express.Router({mergeParams: true}); 

const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const { validateReview,isLoggedIn,isReviewAurthor } = require('../middleware'); 
const reviews = require('../controllers/reviews')
const Campground = require('../models/campground');
const Review = require('../models/review'); 



router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview));

router.delete('/:reviewId',isLoggedIn,isReviewAurthor,catchAsync(reviews.deleteReview))

module.exports = router;