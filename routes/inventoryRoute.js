// Needed Resources
const express = require('express')
const router = new express.Router()
const invController = require('../controllers/invController')
const utilities = require('../utilities/')
const regValidate = require('../utilities/account-validation')

// Route to build inventory by classification view
router.get('/type/:classificationId', utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory by detail view
router.get('/detail/:inv_id', utilities.handleErrors(invController.buildByInventoryId))

// Route to build inventory by classification view
router.get('/', utilities.handleErrors(invController.buildMangementView))

// Route to build add new classification
router.get('/add-classification', utilities.handleErrors(invController.addNewClassificationView))

// Route to build add new inventory 
router.get('/add-inventory', utilities.handleErrors(invController.addNewInventoryView))

// Route to register account
router.post('/add-classification', regValidate.checkClassificationData, utilities.handleErrors(invController.createClassification))

// Route to build add new inventory 
router.post('/add-inventory', regValidate.checkVehicleData, utilities.handleErrors(invController.addInventory))

module.exports = router
