const User = require('../models/users');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async(req, res) => {
    try{const { email, username, password} = req.body;
    const user = new User({email, username});
    const registerUser = await User.register(user, password); 
    req.login(registerUser, err => {
        if(err) return next(err);
        req.flash('success','Welcome to the YepCamp'); 
        res.redirect('/campgrounds');
    });   
}
    catch (e){
        req.flash('error', e.message);
        res.redirect('/register')
    }
    
}

module.exports.loginForm = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome To YelpCamp')
    const redirectUrl = res.locals.returnTo || '/campgrounds'; 
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {

    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash('success', 'Successfully logged out');
        res.redirect('/campgrounds');
    });
}