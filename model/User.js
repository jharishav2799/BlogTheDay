const mongoose    =  require('mongoose');
const Schema  =  mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

//Create Schema
const UserSchema  =  new Schema({

   
    username:{
        type: String
        
    },
   
    
    name:{
        type: String       
    },

    password:{
        type: String
     
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = User = mongoose.model('user' , UserSchema);