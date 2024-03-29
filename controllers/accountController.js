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
 *  Process update request
 * ************************************ */
async function accountUpdate(req, res) {
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreeting(req, res)
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  let data = await accountModel.getAccountById(account_id)
  let grid = await utilities.buildAccountUpdateGrid(data)
  if (account_email != data.account_email) {
   const checkEmail = await accountModel.getAccountByEmail(account_email)
    if (checkEmail){
      req.flash("notice", "Email already exists, try again.")
      res.status(400).render("account/update", {
        title: "Update",
        statusHeader,
        nav,
        greeting,
        grid,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
   })
   return
  }
  }
    const regResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
    data = await accountModel.getAccountById(account_id)
    grid = await utilities.buildAccountUpdateGrid(data)
    if (regResult) {
      req.flash(
        "notice",
        `Success, account updated.`
      )
      res.render("./account/update", {
        title: "Update",
        statusHeader,
        nav,
        greeting,
        grid,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
      })
    } else {
      req.flash("notice", `Failed, to update account .`)
      res.status(501).render("./account/update", {
        title: "Update",
        statusHeader,
        nav,
        greeting,
        grid,
        errors,
        account_firstname,
        account_lastname,
        account_email,
      })
    }   
  return
 }

 /* ****************************************
*  Change password
* *************************************** */
async function changePassword(req, res) {
  const{ account_id, account_password } = req.body
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreeting(req, res)
  let data = await accountModel.getAccountById(account_id)
  let grid = await utilities.buildAccountUpdateGrid(data)

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
      greeting,
      errors: null,
    })
  }

  const regResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (regResult) {
    req.flash(
      "notice",
      `Success, password changed.`
    )
    res.status(201).render("account/update", {
      title: "Update",
      statusHeader,
      nav,
      greeting,
      grid,
      errors: null,
    })
  } else {
    req.flash("notice", "Password was not changed.")
    res.status(501).render("account/update", {
      title: "Update",
      statusHeader,
      nav,
      greeting,
      grid,
      errors: null,
    })
  }
}


module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccountManagement, 
  buildAccountUpdateView, 
  buildLogout, 
  accountUpdate, 
  changePassword
}