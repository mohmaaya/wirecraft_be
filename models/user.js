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
    address: {
        type:String,
        required:true
    },
    description: {
        type:String
    },
    createdAt: {
        type: Date,
        default: Date.now
      }
})

module.exports = mongoose.model('User', userSchema)