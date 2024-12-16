const {campgroundSchema,reviewSchema } = require('./schemas');
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    
    if(!req.isAuthenticated()){
        //this will return the url back to the user where was he intially visited after login
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be Signed In');
        return res.redirect('/login');
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const result = error.details.map(el => el.message).join(',')
        throw new ExpressError(result,400)
    }else{
        next();
    } 
}

module.exports.isAurthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have any permissions to update campground');
        return res.redirect(`/campgrounds/${campground._id}`);
    }else{
        next();
    }
}

module.exports.isReviewAurthor = async(req, res, next) => {
    const { id,reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have any permissions to update campground');
        return res.redirect(`/campgrounds/${campground._id}`);
    }else{
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const result = error.details.map(el => el.message).join(',')
        throw new ExpressError(result,400)
    }else{
        next();
    } 
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
        console.log("return to")
    }
    next();
}