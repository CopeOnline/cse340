const utilities = require('.')
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}


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
    *  Inventory Data Validation Rules
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
  
/* ******************************
 * Check classisfication data
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      const statusHeader = await utilities.buildStatusHeader(req, res)
      res.render("./inventory/add-classification", {
        errors,
        title: "Add Classification",
        statusHeader,
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
      const statusHeader = await utilities.buildStatusHeader(req, res)
      res.render("./inventory/add-inventory", {
        errors,
        title: "Add Inventory",
        statusHeader,
        nav,
        dropdown,
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id 
      })
      return
    }
    next()
  }

  /* ******************************
   * Check data and return errors 
   * ***************************** */
  validate.checkUpdateData = async (req, res, next) => {
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      let nav = await utilities.getNav()
      const statusHeader = await utilities.buildStatusHeader(req, res)
      res.render("./inventory/edit-inventory", {
        errors,
        title: "Edit " + itemName,
        statusHeader,
        nav,
        classificationSelect,
        inv_id,
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image, 
        inv_thumbnail, 
        inv_price, 
        inv_miles, 
        inv_color
      })
      return
    }
    next()
  }
   
  
  module.exports = validate