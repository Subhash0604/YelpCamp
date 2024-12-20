if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const passport = require('passport');
const localPassport = require('passport-local'); 
const User = require('./models/users');
const mongoSanitize = require('express-mongo-sanitize'); 

const joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas');

const Campground = require('./models/campground');
const Review = require('./models/review'); 

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const userRoutes = require('./routes/user')

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp');


const app = express();

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log("Database Connceted");
})

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');

app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize());

const sessionOpt = {
    secret: 'SecretzIsSecret',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7 * 4 * 52,
        maxAge:1000 * 60 * 60 * 24 * 7 * 4 * 52,
    }
}
app.use(session(sessionOpt));   
app.use(flash());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localPassport(User.authenticate()));

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/fake', async(req, res) => {
    const user = new User({ email: 'subhash@gmail.com', username: 'subhash'});
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})


app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/review', reviewRoutes);
app.use('/', userRoutes)

app.get('/', (req, res) => {
    res.render('index');
})


app.all(/(.*)/, (req, res, next)=>{
    next(new ExpressError('Page not found',404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No..Something went wrong'
    res.status(statusCode).render('error',{ err });
})

app.listen(3000, ()=>{
    console.log("LISTENING ON THE PORT");
})
