const {Schema,model} = require('mongoose');

const reviewSchema = new Schema({
    body:String,
    rating:Number,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
})

module.exports = model("Review",reviewSchema);