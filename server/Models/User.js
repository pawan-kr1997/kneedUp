const mongoose= require('mongoose');
const Schema= mongoose.Schema;

const userSchema= new Schema({
    emailId:{
        type:String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    category:{
        type: Object
    },
    bookmark:{
        type:Array
    }

});

module.exports= mongoose.model('User', userSchema);

