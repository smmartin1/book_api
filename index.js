//JavaScript Document

const express = require('express'),
        morgan = require('morgan');

const app = express();

app.use(morgan('common'));

//10 books
let bookList = [
    {
        title: 'The Lightning Thief',
        genre: 'Young Abult'
    },
    {
        title: 'The Last Wish',
        genre: 'Fantasy'
    },
    {
        title: 'Paradise Lost',
        genre: 'Poetry'
    },
    {
        title: 'Taming of The Shrew',
        genre: 'Drama'
    },
    {
        title: 'It',
        genre: 'Horror'
    },
    {
        title: 'The Notebook',
        genre: 'Romance'
    },
    {
        title: 'Dune',
        genre: 'Sci Fi'
    },
    {
        title: 'The Boy From Baby House 10',
        genre: 'Non Fiction'
    },
    {
        title: 'Maus',
        genre: 'Graphic Novel'
    },
    {
        title: 'The Lord of The Flies',
        genre: 'Fiction'
    }
];

app.get('/', (req, res) => {
    res.send('Sit down and read a good book!'); //I suck at slogans
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/books', (req, res) => {
    res.json(bookList);
});

//Morgan log
app.get('/', (req, res) => {
    res.send('Come and read books!');
});

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