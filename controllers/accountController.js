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

  res.clearCookie('jwt')
  res.locals.loggedin = 0
  req.session.destroy((err) => {
  res.redirect('/') // will always fire after session is destroyed
  })
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
  const account_id  = res.locals.accountData.account_id
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const internalMessages = await utilities.buildMessageNotifications(account_id)
  const greeting = await utilities.buildGreetingView(req, res, internalMessages)
  res.render("./account/account-management", {
    errors: null,
    title: "Account",
    statusHeader,
    nav,
    greeting,
  })
}

/* ****************************************
*  Deliver account inbox view
* *************************************** */
async function buildInboxView(req, res, next) {
  const { account_id, account_firstname, account_lastname } = res.locals.accountData
  let titleDef = `${account_firstname}` + ' ' + `${account_lastname}` + ' Inbox'
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreetingView(req, res)
  const grid = await utilities.buildMessageList(req, res)
  res.render("./account/inbox", {
    errors: null,
    title: titleDef,
    statusHeader,
    nav,
    greeting,
    grid,
  })
}

/* ****************************************
*  Deliver new message view
* *************************************** */
async function buildNewMessageView(req, res, next) {
  let nav = await utilities.getNav()
  let data = res.locals.accountData
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreetingView(req, res)
  const form = await utilities.buildNewMessage(data)
  res.render("./account/message/new_message", {
    errors: null,
    title: "New Message",
    statusHeader,
    nav,
    greeting,
    form,
  })
}

/* ****************************************
*  Deliver message view
* *************************************** */
async function buildMessageView(req, res, next) {
  const Id = parseInt(req.params.id)
  let data = await accountModel.getMessageById(Id)
  let subject = data.message_subject
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreetingView(req, res)
  const grid = await utilities.buildMessageView(data)
  res.render("./account/message/view_message", {
    errors: null,
    title: subject,
    statusHeader,
    nav,
    greeting,
    grid,
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
  const greeting = await utilities.buildGreetingView(req, res)
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
  const greeting = await utilities.buildGreetingView(req, res)
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

 /* ****************************************
 *  Process new message
 * ************************************ */
 async function processNewMessage(req, res) {
  const { message_subject, message_body, message_to, message_from} = req.body
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreetingView(req, res)
  let data = res.locals.accountData
  const regResult = await accountModel.createNewMessage(message_subject, message_body, message_to, message_from)
  const form = await utilities.buildNewMessage(data)
    if (regResult) {
      req.flash(
        "notice",
        `Success, message sent.`
      )
      res.render("./account/message/new_message", {
        title: "New Message",
        statusHeader,
        nav,
        greeting,
        form,
        errors: null,
      })
    } else {
      req.flash("notice", `Failed, to send message .`)
      res.status(501).render("./account/message/new_message", {
        title: "New Message",
        statusHeader,
        nav,
        greeting,
        form,
        errors,
      })
    }   
  return
 }

/* ****************************************
*  Deliver archived message view
* *************************************** */
async function buildArchivedMessageView(req, res, next) {
  const { account_id, account_firstname, account_lastname } = res.locals.accountData
  let titleDef = `${account_firstname}` + ' ' + `${account_lastname}` + ' Archived Messages'
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreetingView(req, res)
  const grid = await utilities.buildArchivedMessageList(req, res)
  res.render("./account/message/archived_message", {
    errors: null,
    title: titleDef,
    statusHeader,
    nav,
    greeting,
    grid,
  })
}

 /* ****************************************
 *  Process delete message view
 * ************************************ */
 async function buildDeleteMessageView(req, res) {
  const { message_id } = req.body
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreetingView(req, res)
  const form = await utilities.buildMessageDeleteList(res, message_id)
      res.render("./account/message/delete_message", {
        title: "Delete Message",
        statusHeader,
        nav,
        greeting,
        form,
        errors: null,
      })
  return
 }

 /* ****************************************
*  Update message status view
* *************************************** */
async function updateMessageToReadView(req, res, next) {
  const { message_id, message_read } = req.body
  let data = await accountModel.getMessageById(message_id)
  let subject = data.message_subject
  const regResult = await accountModel.updateMessageReadStatus(message_id, message_read)
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreetingView(req, res)
  const grid = await utilities.buildMessageView(data)
  if (regResult) {
    req.flash(
      "notice",
      `Success, message status set to read.`
    )
    res.render("./account/message/view_message", {
      title: subject,
      statusHeader,
      nav,
      greeting,
      grid,
      errors: null,
    })
  } else {
    req.flash("notice", `Failed, to update message .`)
    res.status(501).redirect("./account/message/view_message", {
      title: subject,
      statusHeader,
      nav,
      greeting,
      grid,
      errors,
    })
  }   
return
}

 /* ****************************************
*  Update message archived view
* *************************************** */
async function updateMessageToArchivedView(req, res, next) {
  const { message_id, message_archived } = req.body
  console.log(message_id, message_archived)
  let data = await accountModel.getMessageById(message_id)
  let subject = data.message_subject
  const regResult = await accountModel.updateMessageArchivedStatus(message_id, message_archived)
  let nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreetingView(req, res)
  const grid = await utilities.buildMessageView(data)
  if (regResult) {
    req.flash(
      "notice",
      `Success, message archived.`
    )
    res.render("./account/message/view_message", {
      title: subject,
      statusHeader,
      nav,
      greeting,
      grid,
      errors: null,
    })
  } else {
    req.flash("notice", `Failed, to archive message .`)
    res.status(501).redirect("./account/message/view_message", {
      title: subject,
      statusHeader,
      nav,
      greeting,
      grid,
      errors,
    })
  }   
return
}

 /* ****************************************
 *  Confirm delete message view
 * ************************************ */
 async function confirmDeleteMessageView(req, res) {
  const { message_id } = req.body
  let nav = await utilities.getNav()
  const regResult = await accountModel.deleteMessage(message_id)
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreetingView(req, res)
  const form = await utilities.buildMessageDeleteList(res, message_id)
  if (regResult) {
    const grid = await utilities.buildMessageList(req, res)
    req.flash(
      "notice",
      `Success, message deleted.`
    )
    res.render("./account/inbox", {
      title: "Inbox",
      statusHeader,
      nav,
      greeting,
      grid,
      errors: null,
    })
  } else {
    req.flash("notice", `Failed, to delete message .`)
    res.status(501).redirect("./account/message/delete_message", {
      title: subject,
      statusHeader,
      nav,
      greeting,
      form,
      errors,
    })
  }   
return
}

/* ****************************************
*  Deliver reply message view
* *************************************** */
async function buildReplyMessageView(req, res, next) {
  const { message_from } = req.body
  let account_id = null
  let nav = await utilities.getNav()
  let data = res.locals.accountData
  const statusHeader = await utilities.buildStatusHeader(req, res)
  const greeting = await utilities.buildGreetingView(req, res)
  const form = await utilities.buildNewMessage(data, message_from, account_id)
  res.render("./account/message/new_message", {
    errors: null,
    title: "New Message",
    statusHeader,
    nav,
    greeting,
    form,
  })
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
  changePassword,
  buildInboxView,
  buildNewMessageView,
  buildMessageView,
  processNewMessage, 
  buildArchivedMessageView,
  buildDeleteMessageView,
  updateMessageToReadView,
  updateMessageToArchivedView,
  confirmDeleteMessageView,
  buildReplyMessageView,
}