//JavaScript Document

const express = require('express'),
        bodyParser = require('body-parser'),
        uuid = require('uuid'),
        morgan = require('morgan');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Books = Models.Book;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myBooksDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send('Sit down and read a good book!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//Add New User
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username }).then((users) => {
        if (users) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users.create({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }).then((users) => {
                res.status(201).json(users)
            }).catch((error) => {
                console.error(error);
                res.status.apply(500).send('Error: ' + error);
            })
        }
    }).catch((err) => {
        console.error(err);
        res.status.apply(500).send('Error: ' + err);
    });
});

//Get All Users
app.get('/users', (req, res) => {
    Users.find().then((users) => {
        res.status(201).json(users);
    }).catch((err) => {
        console.error(err);
        res.status.apply(500).send('Error: ' + err);
    });
});

//Get User by Username
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username }).then((users) => {
        res.json(users);
    }).catch((err) => {
        console.error(err);
        res.status.apply(500).send('Error: ' + err);
    });
})

//Update User
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set: 
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true },
    (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//Add Books to Favorites
app.post('/users/:Username/books/:bookID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: {FavoriteBooks: req.params.bookID}
    },
    { new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//Remove A Book from Favorites
app.delete('/users/:Username/books/:bookID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: {FavoriteBooks: req.params.bookID}
    },
    { new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//Delete A User
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username }).then((users) => {
        if (!users) {
            res.status(400).send(req.params.Username + ' was not found.');
        } else {
            res.status(200).send(req.params.Username + ' was deleted.');
        }
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get List of Books
app.get('/books', (req, res) => {
    Books.find().then((books) => {
        res.status(201).json(books);
        console.log(books);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get Info on a Book
app.get('/books/:Title', (req, res) => {
    Books.findOne({ Title: req.params.Title }).then((books) => {
        res.json(books);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get Author
app.get('/author/:Name', (req, res) => {
    Books.find({ 'Author.Name': req.params.Name }).then((books) => {
        res.json(books);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
})

//Express
app.use(express.static('public'));

//Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//Port Number
app.listen(8080, () => {
    console.log('This app is listening on port 8080');
});