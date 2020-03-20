var mongoose = require('mongoose')
var bcryt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;

var nameValidator = [
    validate({
        validator: "matches",
        arguments:  /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{0,20})+)*$/,
        message: 'Please enter a valid First name.'
    })
]

var emailValidator = [
    validate({
        validator: "isEmail",
        message: 'Please enter a valid Email ID.'
    }),
    validate({
        validator: "isLength",
        arguments:  [3,50],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters.'
    })
]

var usernameValidator = [
    validate({
        validator: "isAlphanumeric",
        message: 'Please enter a valid Username.'
    }),
    validate({
        validator: "isLength",
        arguments:  [7,20],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters.'
    })

]

var passwordValidator = [
    validate({
        validator: "matches",
        arguments: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/,
        message: 'Please enter a valid password.'
    }),
]



var userSchema = new Schema({
    firstname: {type: String, required: true, validate: nameValidator},
    lastname: {type: String, validate: nameValidator},
    username : {type: String, required: true, lowercase: true, unique: true, validate: usernameValidator},
    password: {type: String, required: true, validate: passwordValidator},
    email: {type: String, required: true, lowercase: true, unique: true, validate: emailValidator},
    permission: {type: String, required: true, default:'user'},
    status: {type: String, required: true, default: 'Inactive'},
    group: {type: String, default: ''},
    subGroup: {type: String, default: ''},
    role: {type: String, default:''}
});

userSchema.pre('save', function(next){
    var user = this;
    bcryt.hash(user.password, null, null, function(err, hash){
        if(err){
            next(err);
        }
        user.password = hash;
        next();
    })

})

userSchema.plugin(titlize, {
    paths: ['firstname', 'lastname']
})


userSchema.methods.comparePassword = function(password) {
    return bcryt.compareSync(password, this.password);
}


var groupSchema = new Schema({
    group: {type: String,unique: true },
    subGroups : [
        {
            name: {type: String},
            count: {type: Number}
        }
    ]
});

const Group = mongoose.model('Group', groupSchema);
const User = mongoose.model('User', userSchema);



module.exports = {
    User:User,
    Group:Group
}