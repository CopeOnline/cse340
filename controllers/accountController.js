const utilities = require('../utilities')
const accountModel = require('../models/account-model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  res.render("account/login", {
    title: "Login",
    statusHeader,
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver logout view
* *************************************** */
async function buildLogout(req, res, next) {

  res.clearCookie('jwt');
  res.locals.loggedin = 0
  console.log(res.url)
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  res.redirect('/')
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  res.render("account/register", {
    title: "Register",
    statusHeader,
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreeting(req, res)
  res.render("./account/account-management", {
    errors: null,
    title: "Account",
    statusHeader,
    nav,
    greeting,
    
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdateView(req, res, next) {
  const accntId = req.params.id
  const data = await accountModel.getAccountById(accntId)
  const grid = await utilities.buildAccountUpdateGrid(data)
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreeting(req, res)
  res.render("./account/update", {
    title: "Update Account",
    statusHeader,
    nav,
    greeting,
    grid,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      statusHeader,
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      statusHeader,
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    statusHeader,
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }
 
 /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    statusHeader,
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildAccountUpdateView, buildLogout }