const mongoose = require('mongoose');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')
mongoose.connect('mongodb://localhost:27017/yelp-camp')


const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log("Database Connceted")
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB =async ()=>{
    await Campground.deleteMany({});
    for(let i=0; i<200; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 200 ) + 10;
        const camp = new Campground({
          location:`${cities[random1000].city},${cities[random1000].state}`,  
          title:`${sample(descriptors)} ${sample(places)}`,
          author: '674dd62070403ab44b15758a',
          description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto doloribus neque beatae alias atque, eius culpa tempora necessitatibus, deserunt soluta maiores reiciendis, nesciunt veritatis accusamus magnam ipsum excepturi recusandae veniam!',
          price,
          geometry:{
            type: "Point",
            coordinates: [
              cities[random1000].longitude,
              cities[random1000].latitude,
            ]
          },
          images: [
            {
              url: 'https://res.cloudinary.com/dmgbecwzb/image/upload/v1733758409/YelpCamp/ijjhudlmqinpxo7syljt.png',
              filename: 'YelpCamp/ijjhudlmqinpxo7syljt',
            },
            {
              url: 'https://res.cloudinary.com/dmgbecwzb/image/upload/v1733758411/YelpCamp/saixf0cougdbgwy5kvjz.jpg',
              filename: 'YelpCamp/saixf0cougdbgwy5kvjz',
            }
          ],
        });
        // console.log(camp);
        await camp.save();
    }

}

seedDB().then(()=>{
    mongoose.connection.close();
});