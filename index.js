const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator')

const Books = Models.Book;
const Users = Models.User;

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a'});

//Connect to MongoDB
mongoose.connect(process.env.CONNECTION_URI || 'mongodb://localhost:27017/myBooksDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

/*
let allowedOrigins = [
    'https://mighty-falls-90534.herokuapp.com',
    'http://localhost:8080',
    'http://localhost:1234',
    'http://localhost:3000',
    'https://smmartin1.github.io'
];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);

    if(allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));
*/


app.get('/', (req, res) => {
    res.send('Sit down and read a good book!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//Add New User
app.post('/users', 
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);

        Users.findOne({ Username: req.body.Username }).then((users) => {
            if (users) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
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
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.find().then((users) => {
        res.status(201).json(users);
    }).catch((err) => {
        console.error(err);
        res.status.apply(500).send('Error: ' + err);
    });
});

//Get User by Username
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOne({ Username: req.params.Username }).then((users) => {
      res.json(users);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Update User
app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username cannot contain special characters.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);
            Users.findOneAndUpdate(
                { Username: req.params.Username },
                { $set:
                    {
                    Username: req.body.Username,
                    Password: hashedPassword,
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
app.post('/users/:Username/books/:bookID', passport.authenticate('jwt', {session: false}), (req, res) => {
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
app.delete('/users/:Username/books/:bookID', passport.authenticate('jwt', {session: false}), (req, res) => {
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

//Get User's Favorite Book(s)
app.get('/users/:Username/books', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOne({ Username: req.params.Username}).then((user) => {
        if (user) {
            res.status(200).json(user.FavoriteBooks);
        } else {
            res.status(400).send('Could not find favorite movies or user does not have any');
        }
    })
});

//Delete A User
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
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
app.get('/books', passport.authenticate('jwt', {session: false}), (req, res) => {
    Books.find().then((book) => {
        res.status(201).json(book);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get Info on a Book
app.get('/books/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Books.findOne({ Title: req.params.Title }).then((book) => {
        res.json(book);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get Author
app.get('/authors/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Books.find({ 'Author.Name': req.params.Name }).then((book) => {
        res.json(book);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
})

//Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//Port Number
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});