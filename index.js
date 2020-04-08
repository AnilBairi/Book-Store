const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const config = require('./config/database');
const passport = require('passport');

//Bring Books Model
const Books = require('./models/books');

//DB Connection
mongoose.connect(config.database);
let db = mongoose.connection;

//Check Connection
db.once('open', () => console.log('Connected to DB...'));

//Check DB errors
db.on('error', err => console.log(err));

// Init App
const app = express();

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false
}))

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Express Validator Middleware --> No longer require.
// app.use(expressValidator({
//     errorFormatter: function (param, msg, value) {
//         var namespace = param.split('.'),
//             root = namespace.shift(),
//             formParam = root;

//         while (namespace.length) {
//             formParam += '[' + namespace.shift() + ']';
//         }

//         return {
//             param: formParam,
//             msg: msg,
//             value: value
//         };
//     }
// }));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Load view Engine
var handlebars = require('./helpers/handlebars.js')(exphbs);
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//Passport Config
require('./config/passport')(passport)
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Store User Globally
app.get('*', function (req, res, next) {
    console.log(`Current user: ${req.user}: ${new Date()}`);
    res.locals.user = req.user || null;
    next();
})

// Home Route
app.get('/', (req, res) => {
    Books.find({}, (err, books) => {
        if (err) {
            console.log(err);
        } else {
            res.render('home', {
                title: 'Books',
                books: books
            });
        }

    });
});

// Books Router
let books = require('./routes/books');
// Route Files
app.use('/books', books);

// Users Router
let users = require('./routes/users');
// Route Files
app.use('/users', users);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`server started on port ${PORT}`)
);