/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require('express')
// const env = require('dotenv').config()
const app = express()
const staticView = require('./routes/static')
const inventoryRoute = require('./routes/inventoryRoute')
const expressLayouts = require('express-ejs-layouts')
const baseController = require('./controllers/baseController')
const utilities = require('./utilities/')
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require('./routes/accountRoute')

let message

/* ***********************
 * Routes
 *************************/
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', './layouts/layout') // not at views root

// Express Session Setup
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})


/* ***********************
 * Routes
 *************************/
app.use(staticView)

// Index.ejs route
app.get('/', utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use('/inv', inventoryRoute)

//Account Route
app.use('/account', accountRoute)


// File Not Found Route
app.use(async (req, res, next) => {
  next({ status: 404, message: '<p id="err" > Sorry, we appear to have lost that page. </p>' })
})


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav()
  if (`${req.originalUrl}` === "/error/" || `${req.originalUrl}` == "/inv/error/") {
    try {throw new Error(err.status = 500)} catch (err) {next(err)}}
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if (err.status === 404) { message = err.message } else { message = '<p id="err"> Oh no! There was a crash. Maybe try a different route? </p>' }
  res.render('errors/error', {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
