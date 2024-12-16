const express = require('express');
const router = express.Router();
const campground = require('../controllers/campground');
const { isLoggedIn,isAurthor,validateCampground } = require('../middleware');
const catchAsync = require('../utilities/catchAsync');
const { storage }= require('../cloudinary/index');
const multer = require('multer');
const upload = multer({storage});

//Home page

router.route('/')
    .get(catchAsync(campground.index))
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campground.createCampground))
    
   
router.get('/new', isLoggedIn,campground.renderNewForm);


router.route('/:id')
    .get(catchAsync(campground.showCampground))
    .put(isLoggedIn,isAurthor,upload.array('image'),validateCampground, catchAsync(campground.updateCampground))
    .delete(isLoggedIn,isAurthor,catchAsync(campground.deleteCampground));

//

 
router.get('/:id/edit',isLoggedIn,isAurthor,catchAsync(campground.editCampground));
 







module.exports = router;