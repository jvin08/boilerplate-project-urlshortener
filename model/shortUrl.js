const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const urlSchema = new Schema({
  originalUrl: String,
  shorterUrl: String
})

const ModelClass = mongoose.model('shortUrl', urlSchema)

module.exports = ModelClass;
