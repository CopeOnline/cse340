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

// Process the login attempt *******temporary******
router.post(
    "/login",
    (req, res) => {
      res.status(200).send('login process not implemented yet')
    }
  )

module.exports = router
