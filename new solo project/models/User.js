const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true }
});

// Подключение плагина passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
