const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const insecureHandlebars = allowInsecurePrototypeAccess(Handlebars)
const fileUpload = require('express-fileupload')
const {generateDate, limit, truncate, paginate} = require('./helpers/hbs')
const expressSession = require('express-session')
const MongoStore = require('connect-mongo')(expressSession)
const methodOverride = require('method-override')

// APP SETTINGS
app.use(express.static('public'))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.engine('handlebars', expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
        generateDate: generateDate,
        limit: limit,
        truncate: truncate,
        paginate: paginate
    }
}))
app.use(fileUpload())
app.use(expressSession({
    secret: 'testsecret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))
app.use(methodOverride('_method'))

// DB CONNECTION
mongoose.connect('mongodb://127.0.0.1/node_blog_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

// NAVBAR LINKS MIDDLEWARE
app.use((req, res, next) => {
    const { userId } = req.session
    if(userId) {
        res.locals = {
            displayLink: true
        }
    } else {
        res.locals = {
            displayLink: false
        }
    }
    next()
})

// FLASH MESSAGE & MIDDLEWARE
app.use((req, res, next) => {
    res.locals.sessionFlash = req.session.sessionFlash
    delete req.session.sessionFlash
    next()
})

const main = require('./routes/main')
const posts = require('./routes/posts')
const users = require('./routes/users')
const admin = require('./routes/admin/index')
const contact = require('./routes/contact')
app.use('/', main)
app.use('/posts', posts)
app.use('/users', users)
app.use('/admin', admin)
app.use('/contact', contact)

// SERVER SETTINGS
const port = 3000
const hostname = '127.0.0.1'
app.listen(port, hostname, () => {
    console.log(`Server running at: http://${hostname}:${port}`)
})