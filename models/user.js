const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    name: {
        type:String,
        required:true
    },
    dob: {
        type:Date,
        required:true
    },
    city: {
        type:String,
        required:true
    },
    latitude: {
        type:String,
        required:true
    },
    longitude: {
        type:String,
        required:true
    },
    designation: {
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    pendingRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    sentRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

})

module.exports = mongoose.model('User', userSchema)