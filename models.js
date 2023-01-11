const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let bookSchema = mongoose.Schema({
    Title: {type: String, require: true},
    Synopsis: {
        Paragraph1: {type: String, require: true},
        Paragraph2: {type: String, require: true}
    },
    Published: {type: Number, required: true},
    Genre: String,
    Author: {
        Name: String,
        Bio: String
    },
    ImagePath: String
});

let userSchema = mongoose.Schema({
    Username: {type: String, require: true},
    Password: {type: String, require: true},
    Email: {type: String, require: true},
    Birthdate: Date,
    FavoriteBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Books'}]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

let Book = mongoose.model('Books', bookSchema);
let User = mongoose.model('Users', userSchema);

module.exports.Book = Book;
module.exports.User = User;