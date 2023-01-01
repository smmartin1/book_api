//JavaScript Document

const express = require('express'),
        bodyParser = require('body-parser'),
        uuid = require('uuid'),
        morgan = require('morgan');

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));

let users = [
    {
        id: 1,
        name: 'Shannon',
        favoriteBooks: ['The Lightning Thief']
    },
    {
        id: 2,
        name: 'Kathryn',
        favoriteBooks: ['It']
    }
];

//10 books
let bookList = [
    {
        title: 'The Lightning Thief',
        synopsis: '...',
        genre: {
            name: 'Young Abult',
            description: '...'
        },
        author: {
            name: 'Rick Riordan',
            bio: '...',
            birth: '1970',
            death: null
        },
        imageURL: '...'
    },
    {
        title: 'The Last Wish',
        synopsis: '...',
        genre: {
            name: 'Fantasy',
            description: '...'
        },
        author: {
            name: 'Andrez S',
            bio: '...',
            birth: '1970',
            death: null
        },
        imageURL: '...'
    },
    {
        title: 'Paradise Lost',
        synopsis: '...',
        genre: {
            name: 'Poetry',
            description: '...'
        },
        author: {
            name: 'John M',
            bio: '...',
            birth: '1970',
            death: null
        },
        imageURL: '...'
    },
    {
        title: 'Taming of The Shrew',
        synopsis: '...',
        genre: {
            name: 'Drama',
            description: '...'
        },
        author: {
            name: 'William Shakespeare',
            bio: '...',
            birth: '1970',
            death: null
        },
        imageURL: '...'
    },
    {
        title: 'It',
        synopsis: '...',
        genre: {
            name: 'Horror',
            description: '...'
        },
        author: {
            name: 'Stephen King',
            bio: '...',
            birth: '1970',
            death: null
        },
        imageURL: '...'
    },
    {
        title: 'The Notebook',
        synopsis: '...',
        genre: {
            name: 'Romance',
            description: '...'
        },
        author: {
            name: 'Nicholas Sparks',
            bio: '...',
            birth: '1970',
            death: null
        },
        imageURL: '...'
    },
    {
        title: 'Dune',
        synopsis: '...',
        genre: {
            name: 'Sci Fi',
            description: '...'
        },
        author: {
            name: 'uhhhhhhh',
            bio: '...',
            birth: '1970',
            death: null
        },
        imageURL: '...'
    },
    {
        title: 'The Boy From Baby House 10',
        synopsis: '...',
        genre: {
            name: 'Non Fiction',
            description: '...'
        },
        author: {
            name: 'Alan',
            bio: '...',
            birth: '1970',
            death: null
        },
        imageURL: '...'
    },
    {
        title: 'Maus',
        synopsis: '...',
        genre: {
            name: 'Graphic Novel',
            description: '...'
        },
        author: {
            name: 'Uhhhhh',
            bio: '...',
            birth: '1970',
            death: null
        },
        imageURL: '...'
    },
    {
        title: 'The Lord of The Flies',
        synopsis: '...',
        genre: {
            name: 'Fiction',
            description: '...'
        },
        author: {
            name: 'Forgot',
            bio: '...',
            birth: '1970',
            death: null
        },
        imageURL: '...'
    }
];

app.get('/', (req, res) => {
    res.send('Sit down and read a good book!'); //I suck at slogans
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//Add New User
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('User needs a name');
    }
});

app.get('/users', (req, res) => {
    res.status(200).json(users);
});

//Update User
app.put('/users/:id', (req, res) => {
	const { id } = req.params;
	const updatedUser = req.body;

	let user = users.find ( user => user.id == id);

	if (user) {
		user.name = updatedUser.name;
		res.status(200).json(user);
	} else {
		res.status(400).send('No such user')
	}
});

//Add Books to Favorites
app.post('/users/:id/:bookTitle', (req, res) => {
	const { id, bookTitle } = req.params;

	let user = users.find ( user => user.id == id);

	if (user) {
		user.favoriteBooks.push(bookTitle);
		res.status(200).send(bookTitle + ' has been added to user ' + id + '\'s arrary');
	} else {
		res.status(400).send('No such user')
	}
});

//Remove A Book from Favorites
app.delete('/users/:id/:bookTitle', (req, res) => {
	const { id, bookTitle} = req.params;

	let user = users.find ( user => user.id == id);

	if (user) {
		user.favoriteBooks = user.favoriteBooks.filter(title => title !== bookTitle);
		res.status(200).send(bookTitle + ' has been removed from user ' + id + '\'s arrary');
	} else {
		res.status(400).send('No such user')
	}
});

//Delete A User
app.delete('/users/:id', (req, res) => {
	const { id } = req.params;

	let user = users.find ( user => user.id == id);

	if (user) {
		users = users.filter(user => user.id != id);
		res.status(200).send('User ' + id + ' has been deleted.');
	} else {
		res.status(400).send('No such user')
	}
});

//Get List of Books
app.get('/books', (req, res) => {
    res.status(200).json(bookList);
});

//Get Info on a Book
app.get('/books/:title', (req, res) => {
    const { title } = req.params;
    const book = bookList.find(book => book.title === title);

    if (book) {
        res.status(200).json(book);
    } else {
        req.status(400).send('Book does not exist');
    }
});

//Get Genre
app.get('/books/genre/:name', (req, res) => {
    const { name } = req.params;
    const genre = bookList.find(book => book.genre.name === name).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No such genre');
    }
});

//Get Author
app.get('/books/author/:name', (req, res) => {
    const { name } = req.params;
    const author = bookList.find(book => book.author.name === name).author;

    if (author) {
        res.status(200).json(author);
    } else {
        res.status(400).send('No such author');
    }
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