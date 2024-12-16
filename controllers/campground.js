const Campground = require('../models/campground');
const { cloudinary} = require('../cloudinary');

const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
}

module.exports.renderNewForm = (req, res) =>{
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next) =>{
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location);
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    // res.send(campground.geometry);
    campground.images = req.files.map(f =>({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    console.log(campground);
    await campground.save();
    req.flash('success','Successfully added a new Campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async(req, res)=>{
    const campground = await  Campground.findById( req.params.id ).populate({
        path:'reviews',
         populate:{
            path:'author'
         }
  }).populate('author');
    if(!campground){
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{ campground })
}

module.exports.editCampground = async (req, res) => { 
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground }); 
}

module.exports.updateCampground = async(req, res)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate( id, { ...req.body.campground});
    campground.images.push(...req.files.map(f =>({url: f.path, filename: f.filename})));
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
    await campground.updateOne({$pull:{ images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash('success', 'Succesfully Updated the Campground..!');  
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req, res) =>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    console.log("Deleted")
    req.flash('success', 'Successfully Deleted the Campground');
    res.redirect('/campgrounds')
}