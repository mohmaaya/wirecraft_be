const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
})

module.exports = mongoose.model('RefreshToken', tokenSchema)