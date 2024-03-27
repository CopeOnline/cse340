const invModel = require('../models/inventory-model')
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  const data = await invModel.getClassifications()
  let list = '<ul>'
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += '<li>'
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      '</a>'
    list += '</li>'
  })
  list += '</ul>'
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +
        '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model +
        ' details"><img src="' + vehicle.inv_thumbnail +
        '" alt="' + vehicle.inv_make + ' ' + vehicle.inv_model +
        ' on CSE Motors" ></a>'
      grid += '<div class="namePrice">'
      grid += '<hr >'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' +
        vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' +
        vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' +
        new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the update view
* ************************************ */
Util.buildAccountUpdateGrid = async function (data) {
  let grid
  if (data) {
    grid = '<form class="update-form" action="/account/register" method="post">'
    grid += '<label for="firstname">First Name:</label>'
    grid += '<input type="text" name="account_firstname" id="accountFirstname" required value="' + data.rows[0].account_firstname + '">'
    grid += '<label for="lastname">Last Name:</label>'
    grid += '<input type="text" id="accountlastname" name="account_lastname" required value="' + data.rows[0].account_lastname + '">'
    grid += '<label for="email">Email:</label>'
    grid += '<input type="email" id="accountemail" name="account_email" required value="' + data.rows[0].account_email + '">'
    grid += '<input type="hidden" name="account_id" value="' + data.rows[0].account_id + '">'
    grid += '<button type="submit">Update Now</button>'
    grid += '</form>'



    grid += '<form class="password-form" action="/account/register" method="post"></form>'
    grid += '<h2>Change Password</h2>'
    grid += '<label for="password">Password:</label>'
    grid += '<input type="password" id="accountpassword" name="account_password" required pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$">'
    grid +=  '<input type="hidden" name="account_id" value="' + data.rows[0].account_id + '">'
    grid += '<div>'
    grid += '<p>Passwords must have at least:</p>'
    grid += '<ol>'
    grid += '<li>a minimum of 12 characters</li>'
    grid += '<li>one capital letter</li>'
    grid += '<li>one lower case letter</li>'
    grid += '<li>one number</li>'
    grid += '<li>one non-alphanumeric character</li>'
    grid += '</ol>'
    grid += '</div>'
    grid += '<button type="submit">Change Password</button>'
    grid += '</form>'
  } else {
    grid += '<p class="notice">Sorry, no matching accounts could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the details view HTML
* ************************************ */
Util.buildDetailsView = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-details">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<img src="' + vehicle.inv_image +
      '" alt="' + vehicle.inv_make + ' ' + vehicle.inv_model +
      ' on CSE Motors" >'
      grid += '<div class="vehicleDetails">'
      grid += '<hr >'
      grid += '<h2>'
      grid += vehicle.inv_make + ' ' + vehicle.inv_model + ' Details '
      grid += '</h2>'
      grid += '<h2 class="price">'
      grid += 'Price: $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</h2>'
      grid += '<div class="desc">' + '<p id="desc">' + '<b>'
      grid += 'Description: '
      grid += '</b>' + vehicle.inv_description + '</p>' + '</div>'
      grid += '<div class="color">' + '<b>'
      grid += 'Color: '
      grid += '</b>' + vehicle.inv_color + '</div>'
      grid += '<div class="miles">' + '<b>'
      grid += 'Mileage: '
      grid += '</b>' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</div>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
 * Middleware building dropdown for classification options
 **************************************** */ 
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Build Header by login status
 * ************************************ */ 
Util.buildStatusHeader = async function (req, res) {
  let header;
  if (res.locals.loggedin) {
    let accountData = res.locals.accountData
  header = `<a title="Go to account" href="/account/">Welcome ${accountData.account_firstname} </a>`
      header +=  '<a title="Click to log out" href="/account/logout">Logout</a>'
  }else{
  header = '<a title="Click to log in" href="/account/login">My Account</a>'
  }
  return header
}

Util.buildGreeting = async function (req, res) {
  let greeting;
  let accountData = res.locals.accountData
  if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
    greeting = `<h2 class="greeting">Welcome ${accountData.account_firstname} </h2>`
      greeting += '<a title="Click to update accounts" href="/account/update">Edit Account Information</a>' 
      greeting += '<h3>Inventory Manage</h3>'
      greeting += '<a title="Click to edit inventory" href="/inv">Manage Inventory</a>' 
  }else if (accountData.account_type === "Client") {
  greeting = `<h2 class="greeting">Welcome ${accountData.account_firstname} </h2>`
    greeting += '<a title="Click to update accounts" href="/account/update/'
                 + accountData.account_id + '">Edit Account Information</a>' 
  }
  return greeting
}


module.exports = Util
