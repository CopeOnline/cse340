// Needed Resources
const express = require('express')
const router = new express.Router()
const accountController = require('../controllers/accountController')
const utilities = require('../utilities')
const regValidate = require('../utilities/account-validation')

// Route to login view
router.get('/login', utilities.handleErrors(accountController.buildLogin))

// Route to registration view
router.get('/register', utilities.handleErrors(accountController.buildRegister))

// Route to register account
router.post('/register', regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login attempt 
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin))

//Process account
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

//Process to update user account
router.get('/update/:id', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdateView))

//Process to update user account
router.post('/update/:id', utilities.checkLogin, utilities.handleErrors(accountController.accountUpdate))

//Process to update user password
router.post('/updates/:id', utilities.checkLogin, utilities.handleErrors(accountController.changePassword))

//Process to logout
router.get('/logout', utilities.handleErrors(accountController.buildLogout))

//Route to account inbox
router.get('/inbox/:id', utilities.checkLogin, utilities.handleErrors(accountController.buildInboxView))

//Route to new message view
router.get('/inbox/message/:id', utilities.checkLogin, utilities.handleErrors(accountController.buildMessageView))

//Route to new message view
router.get('/inbox/new/:id', utilities.checkLogin, utilities.handleErrors(accountController.buildNewMessageView))

//Route to arechived message view
router.get('/inbox/archived/:id', utilities.checkLogin, utilities.handleErrors(accountController.buildArchivedMessageView))

//Process to send message
router.post('/inbox/send/:id', utilities.checkLogin, utilities.handleErrors(accountController.processNewMessage))

//Process to mark message as read 
router.post('/inbox/read/:id', utilities.checkLogin, utilities.handleErrors(accountController.updateMessageToReadView))

//Process to mark message as read 
router.post('/inbox/archived/:id', utilities.checkLogin, utilities.handleErrors(accountController.updateMessageToArchivedView))

//Process to delete message
router.post('/inbox/delete/:id', utilities.checkLogin, utilities.handleErrors(accountController.buildDeleteMessageView))

//Process to confirm delete message
router.post('/inbox/confirm/:id', utilities.checkLogin, utilities.handleErrors(accountController.confirmDeleteMessageView))

//Process to reply to message
router.post('/inbox/new/:id', utilities.checkLogin, utilities.handleErrors(accountController.buildReplyMessageView))

module.exports = router
