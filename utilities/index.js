const invModel = require('../models/inventory-model')
const accntModel = require('../models/account-model')
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
    grid = '<form class="update-form" action="/account/update/' + data.account_id + '" method="post">'
    grid += '<label for="accountfirstname">First Name:</label>'
    grid += '<input type="text" name="account_firstname" id="accountfirstname" required value="' + data.account_firstname + '">'
    grid += '<label for="accountlastname">Last Name:</label>'
    grid += '<input type="text" id="accountlastname" name="account_lastname" required value="' + data.account_lastname + '">'
    grid += '<label for="accountemail">Email:</label>'
    grid += '<input type="email" id="accountemail" name="account_email" required value="' + data.account_email + '">'
    grid += '<input type="hidden" name="account_id" value="' + data.account_id + '">'
    grid += '<button type="submit" name="accountUpdate">Update Now</button>'
    grid += '</form>'


    grid += '<h2 class="passForm">Change Password</h2>'
    grid += '<form class="password-form" action="/account/updates/' + data.account_id + '" method="post">'
    grid += '<label for="accountpassword">Password:</label>'
    grid += '<input type="password" id="accountpassword" name="account_password" required pattern="^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\\s).{12,}$">'
    grid +=  '<input type="hidden" name="account_id" value="' + data.account_id + '">'
    grid += '<button type="submit" name="passwordUpdate">Change Password</button>'
    grid += '<div>'
    grid += '<p class="info">Passwords must have at least:</p>'
    grid += '<ol>'
    grid += '<li>a minimum of 12 characters</li>'
    grid += '<li>one capital letter</li>'
    grid += '<li>one lower case letter</li>'
    grid += '<li>one number</li>'
    grid += '<li>one non-alphanumeric character</li>'
    grid += '</ol>'
    grid += '</div>'
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

/* **************************************
* Build the new message form
* ************************************ */
Util.buildNewMessage = async function (data, message_from, account_id = null) {
  let group = await accntModel.getAllAccounts()
  let list 

  if (message_from) {
    group.rows.forEach((row) => {
      if (row.account_id == message_from ) {
      list = '<h2 name="' + row.account_id + '"'
      list += ">" + row.account_firstname + ' ' + row.account_lastname + "</h2>"}
      console.log(row.account_id, list)
  })
  } else {
    list = '<select name="message_to" id="accountList" required>'  
    list += "<option value=''>Choose a Recipient</option>"
    group.rows.forEach((row) => {
      list += '<option value="' + row.account_id + '"'
      if ( account_id != null && 
        row.account_id == account_id ) {
      list += " selected "}
      list += ">" + row.account_firstname + ' ' + row.account_lastname + "</option>"})
      list += "</select>"
    }

  let form
  if (data) {
    form =  '<form class="newMessage-form" action="/account/inbox/send/' + data.account_id + '" method="post">'
    form +=  list
    form += '<label for="messageSubject">Subject:</label>'
    form += '<input type="text" name="message_subject" id="messageSubject" required >'
    form += '<label for="messageBody">Message:</label>'
    form += '<textarea name="message_body" id="messageBody" required ></textarea>'
    form += '<input type="hidden" name="message_from" id="messageFrom" value="' + data.account_id + '">'
    form += '<input type="hidden" name="message_read" value="false">'
    form += '<input type="hidden" name="message_archived" value="false">'
    form += '<button type="submit" name="newMessage">Send</button>'
    form += '</form>'

  } else {
    form += '<p class="notice">Sorry, new message could not be created.</p>'
  }
  return form
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
  header = `<a title="Go to account" class="headerLoggedin" href="/account/">Welcome ${accountData.account_firstname} </a>`
      header +=  '<a class="headerLoggedin" title="Click to log out" href="/account/logout">Logout</a>'
  }else{
  header = '<a class="headerLoggedout" title="Click to log in" href="/account/login">My Account</a>'
  }
  return header
}

/* ****************************************
 *  Build Greeting by account login 
 * ************************************ */ 
Util.buildGreetingView = async function (req, res, internalMessages) {
  let greeting;
  let accountData = res.locals.accountData
  if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
    greeting = `<h2 class="greeting">Welcome ${accountData.account_firstname} </h2>`
      greeting += `<a class="modify" title="Click to update accounts" href="/account/update/${accountData.account_id}">Edit Account Information</a>` 
      greeting += `${internalMessages}`
      greeting += '<h3>Inventory Manage</h3>'
      greeting += '<a class="modify" title="Click to edit inventory" href="/inv">Manage Inventory</a>' 
  }else if (accountData.account_type === "Client") {
  greeting = `<h2 class="greeting">Welcome ${accountData.account_firstname} </h2>`
    greeting += '<a class="modify" title="Click to update accounts" href="/account/update/'+ accountData.account_id + '">Edit Account Information</a>'
    greeting +=  `${internalMessages}`
  }
  return greeting
}

/* ****************************************
 *  Build Notifications for account management view
 * ************************************ */ 
Util.buildMessageNotifications = async function (account_id) {
  const messages = await accntModel.getMessageByRecipient(account_id)
  let count = 0
  messages.rows.forEach((row) => {
    if (row.message_read == false) {
      if (row.message_archived == false){
        count += 1
      }     
    }
  })
  
  let notification = '<h2 class="messageCenter" >Message Center</h2>'
    notification += '<ol>'
    notification += '<li>'
    notification += `<p class="messageCount">You have ${count} unread message(s).</p>`
    notification += '</li>' + '<li>'
    notification += '<p class="inbox">Go to</p>'
    notification += `<a class="modify" id="inboxLink" title="Got to inbox" href="/account/inbox/${account_id}">Inbox</a>` + '</li>'
    notification += '</ol>'
  return notification
}

/* ****************************************
 *  Build inbox list for internal messages
 * ************************************ */ 
Util.buildMessageList = async function (req, res) {
    const { account_id } = res.locals.accountData
    const results = await accntModel.getMessageByRecipient(account_id)
    let data = await accntModel.getAllAccounts()
    let count = 0;

    await results.rows.forEach((row) => {
      if (row.message_archived == true) {
        count += 1
      }
    }) 

    let messageList = `<a class="newMessage" title="Create new message" href="/account/inbox/new/${account_id}">Create New Message</a>`
    messageList += `<a class="archivedMessage" title="View archived messages" href="/account/inbox/archived/${account_id}">View `
    messageList += `${count}` +  ' Archived Message(s) </a>'
    messageList += '<table class="inboxView">' + '<thead><tr><th scope="col">Recieved</th>' + '<th scope="col">Subject</th>' + '<th scope="col">From</th>'
    messageList += '<th scope="col">Read</th></tr></thead>' 
    results.rows.forEach((row) => {
      if (row.message_archived != true) {
      messageList += '<tbody><tr><th scope="row">' + `${row.message_created.toLocaleDateString('en-US')}` + ' '    
      messageList += `${row.message_created.toLocaleTimeString('en-US')}` + '</th>' + '<td>' + `<a href="/account/inbox/message/${row.message_id}"> ${row.message_subject}</a>` + '</td>' + '<td>' 
      data.rows.forEach((account) => {
        if (account.account_id === row.message_from) {
          messageList += `${account.account_firstname}` + ' ' + `${account.account_lastname}` + '</td>'
        }})
      messageList +=   '<td>' + `${row.message_read}` + '</td>' + '</tr>' 
      }
    })
    messageList += '</table>'
    
    return messageList
  }

  /* ****************************************
 * Middleware building dropdown for message recipient
 **************************************** */ 
Util.buildAccountList = async function (account_id = null) {
  let data = await accntModel.getAllAccounts()
  let accountList =
    '<select name="account_id" id="accountList" required>'
  accountList += "<option value=''>Choose a Recipient</option>"
  data.rows.forEach((row) => {
    accountList += '<option value="' + row.account_id + '"'
    if (
      account_id != null &&
      row.account_id == account_id
    ) {
      accountList += " selected "
    }
    accountList += ">" + row.account_firstname + ' ' + row.account_lastname + "</option>"
  })
  accountList += "</select>"
  return accountList
}

/* ****************************************
 * Middleware building message viewer
 **************************************** */ 
Util.buildMessageView = async function (data) {
  let sender = await accntModel.getAllAccounts()
  let fromFirstName
  let fromLastName
  sender.rows.forEach((account) => {
    if (account.account_id === data.message_from) {
      fromFirstName = account.account_firstname
      fromLastName = account.account_lastname 
    }})
  let message = '<div class="messageLayout">'
  message += '<h2 class="messageView" >Subject:</h2>'
  message += '<p class="messageSubject">' + data.message_subject + '</p>'
  message += '<h2 class="messageView" >From:</h2>' + '<p class="messageFrom">' 
  message +=  fromFirstName + ' ' + fromLastName + '</p>'
  message += '<h2 class="messageView" >Message:</h2>'
  message += '<p class="messageBody">' + data.message_body + '</p>'
  message +=  '</div>' + '<hr>' 
  message +=  `<a class="returnInbox" title="Return to Inbox" href="/account/inbox/${data.message_to}">Return to Inbox</a>`
  message +=  '<form class="reply-form" action="/account/inbox/new/' + data.message_id + '" method="post">'
  message +=  `<button type="submit" name="message_id" value="${data.message_id}">Reply</button>`
  message +=  `<input type="hidden" name="message_from" value="${data.message_from}">`
  message +=  '</form>'
  message +=  '<form class="updateRead-form" action="/account/inbox/read/' + data.message_id + '" method="post">'
  message +=  `<button type="submit" name="message_id" value="${data.message_id}">Mark as Read</button>`
  message +=  '<input type="hidden" name="message_read" value="true">'
  message +=  '</form>'
  message +=  '<form class="updateArchived-form" action="/account/inbox/archived/' + data.message_id + '" method="post">'
  message +=  `<button type="submit" name="message_id" value="${data.message_id}">Archive Message</button>`
  message +=  '<input type="hidden" name="message_archived" value="true">'
  message +=  '</form>'
  message +=  '<form class="updateDelete-form" action="/account/inbox/delete/' + data.message_id + '" method="post">'
  message +=  `<button type="submit" name="message_id" value="${data.message_id}">Delete Message</button>`
  message +=  '</form>' 

return message

}

/* ****************************************
 *  Build archived list for internal messages
 * ************************************ */ 
Util.buildArchivedMessageList = async function (req, res) {
  const { account_id } = res.locals.accountData
  const results = await accntModel.getMessageByRecipient(account_id)
  let data = await accntModel.getAllAccounts()
  let count = 0;

  await results.rows.forEach((row) => {
    if (row.message_archived == true) {
      count += 1
    }
  }) 

  let messageList = `<a class="newMessage" title="Create new message" href="/account/inbox/new/${account_id}">Create New Message</a>`
  messageList += `<a class="archivedMessage" title="Go to Inbox" href="/account/inbox/${account_id}">`
  messageList += ' Got to Inbox</a>'
  messageList += '<table class="inboxView">' + '<thead><tr><th scope="col">Recieved</th>' + '<th scope="col">Subject</th>' + '<th scope="col">From</th>'
  messageList += '<th scope="col">Read</th></tr></thead>' 
  results.rows.forEach((row) => {
    if (row.message_archived != false) {
    messageList += '<tbody><tr><th scope="row">' + `${row.message_created.toLocaleDateString('en-US')}` + ' '    
    messageList += `${row.message_created.toLocaleTimeString('en-US')}` + '</th>' + '<td>' + `<a href="/account/inbox/message/${row.message_id}"> ${row.message_subject}</a>` + '</td>' + '<td>' 
    data.rows.forEach((account) => {
      if (account.account_id === row.message_from) {
        messageList += `${account.account_firstname}` + ' ' + `${account.account_lastname}` + '</td>'
      }})
    messageList +=   '<td>' + `${row.message_read}` + '</td>' + '</tr>' 
    }
  })
  messageList += '</table>'
  
  return messageList
}

/* ****************************************
 *  Build full list for internal messages
 * ************************************ */ 
Util.buildMessageDeleteList = async function (res, message_id) {
  const { account_id } = res.locals.accountData
  const results = await accntModel.getMessageById(message_id)
  let data = await accntModel.getAllAccounts()

  let messageList = `<a class="archivedMessage" title="Go to Inbox" href="/account/inbox/${account_id}">`
  messageList += ' Got to Inbox</a>'
  if (results) {
  messageList += '<h2 class="finalDelete">Deletion is permanent, messages cannot be recovered!</h2>'
  messageList += '<table class="inboxView">' + '<thead><tr><th scope="col">Recieved</th>' + '<th scope="col">Subject</th>' + '<th scope="col">From</th>'
  messageList += '<th scope="col">Read</th>' + '<th scope="col">Delete Confirmation</th>' + '</tr></thead>' 
  messageList += '<tbody><tr><th scope="row">' + `${results.message_created.toLocaleDateString('en-US')}` + ' '    
  messageList += `${results.message_created.toLocaleTimeString('en-US')}` + '</th>' + '<td>' + `<a href="/account/inbox/message/${results.message_id}">`
  messageList += ` ${results.message_subject}</a>` + '</td>' + '<td>' 
  data.rows.forEach((account) => {
      if (account.account_id === results.message_from) {
        messageList += `${account.account_firstname}` + ' ' + `${account.account_lastname}` + '</td>' 
      }})
  messageList +=   '<td>' + `${results.message_read}` + '</td>' + '<td>' + `<a class="reply" name="delete" Title="Delete Message"` 
  messageList +=  '<td>' + '<form class="updateDelete-form" action="/account/inbox/confirm/' + results.message_id + '" method="post">'
  messageList +=  `<button type="submit" name="message_id" value="${results.message_id}">Delete Message</button></a>`
  messageList +=  '</form>'
  messageList +=  '</td>' + '</tr>' 
  messageList += '</table>'
    }
  return messageList
}




module.exports = Util
