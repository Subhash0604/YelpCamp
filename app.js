require('dotenv').config();

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
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const { campgroundSchema, reviewSchema } = require('./schemas');

const Campground = require('./models/campground');
const Review = require('./models/review');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const dbUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database Connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

// Session and Flash Configuration
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret,
    },
});

const sessionOptions = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, // Uncomment this when deploying with HTTPS
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(helmet());

// Helmet CSP Configuration
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = ["https://api.maptiler.com/"];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmgbecwzb/",
                "https://images.unsplash.com/",
                "https://images3.alphacoders.com/",
                "https://wallpaperaccess.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Passport Configuration
passport.use(new localPassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());

// Flash Messages and Current User Middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/review', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('index');
});

// Error Handling
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
