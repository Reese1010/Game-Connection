const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/offerRoutes');

const path = require('path');
const app = express();

let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');



const mongUri = 'mongodb+srv://admin:changeme@cluster0.9ynqe.mongodb.net/project5?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongUri)
.then(()=>{
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

})
.catch(err=>console.log(err.message));

app.use(session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: mongUri }),
    cookie: {maxAge: 60*60*1000}
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.get('/', (req, res) =>{
    res.render('index');
});

app.use('/items', itemRoutes);

app.use('/users', userRoutes);

app.use('/offers', offerRoutes);


app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);

});

app.use((err, req, res, next) => {
    console.log(err.stack);
    if (!err.status) {
        err.status = 500;
        err.message = "Internal Server Error";
    }
    res.status(err.status);
    res.render('error', { message: err.message, error: err }); 
});







