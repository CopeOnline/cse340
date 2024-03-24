const utilities = require('.')
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
          }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/*  **********************************
  *  Classification Name Validation Rules
  * ********************************* */
validate.classificationNameRules = () => {
  return [
    // firstname is required and must be string
    body("classification_name")
      .notEmpty()
      .isAlpha()
      .withMessage("Must have a valid name.") // on error this message is sent.
    ]
  }

/*  **********************************
  *  INvemtopry Data Validation Rules
  * ********************************* */
validate.inventoryRules = () => {
  return [
    // make is required and must be string
    body("inv_make")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."), // on error this message is sent.

    // model is required and must be string
    body("inv_model")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a model."), // on error this message is sent.
     
    // year is required and must be number
    body("inv_year")
      .trim()
      .notEmpty()
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .withMessage("Please provide a year."), // on error this message is sent.
      
    // description is required and must be string
    body("inv_description")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a description."), // on error this message is sent.
      
    // image is required and must be string
    body("inv_image")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a image path."), // on error this message is sent.
      
    // thumbnail is required and must be string
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a thumbnail path."), // on error this message is sent.
      
    // price is required and must be number
    body("inv_price")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide the price."), // on error this message is sent.
      
    // miles is required and must be a number
    body("inv_miles")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide the miles."), // on error this message is sent.
      
    // color is required and must be string
    body("inv_color")
      .trim()
      .notEmpty()
      .isAlpha()
      .withMessage("Please provide a color."), // on error this message is sent.
      
    // classification_id is required and must be a number
    body("classification_id")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Classification is required."), // on error this message is sent.  
  ]
}
  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name
    })
    return
  }
  next()
}

/* ******************************
 * Check data and return errors 
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let dropdown = await utilities.buildClassificationList()
    let nav = await utilities.getNav()
    res.render("./inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      dropdown,
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id 
    })
    return
  }
  next()
}
  
  module.exports = validate