// Needed Resources
const express = require('express')
const router = new express.Router()
const invController = require('../controllers/invController')
const utilities = require('../utilities/')
const regValidate = require('../utilities/inventory-validation')
const accntValidate = require('../utilities/account-validation')

// Route to build inventory by classification view
router.get('/type/:classificationId', utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory by detail view
router.get('/detail/:inv_id', utilities.handleErrors(invController.buildByInventoryId))

// Route to build inventory by classification view
router.get('/', utilities.checkLogin, accntValidate.checkAccountType, utilities.handleErrors(invController.buildMangementView))

// Route to build add new classification
router.get('/add-classification', utilities.checkLogin, accntValidate.checkAccountType, utilities.handleErrors(invController.addNewClassificationView))

// Route to build add new inventory 
router.get('/add-inventory', utilities.checkLogin, accntValidate.checkAccountType, utilities.handleErrors(invController.addNewInventoryView))

// Route to register account
router.post('/add-classification', utilities.checkLogin, accntValidate.checkAccountType, regValidate.classificationNameRules(), regValidate.checkClassificationData, utilities.handleErrors(invController.createClassification))

// Route to build add new inventory 
router.post('/add-inventory', utilities.checkLogin, accntValidate.checkAccountType, regValidate.checkVehicleData, utilities.handleErrors(invController.addInventory))

// Route to get inventory for management view table
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to edit inventory item
router.get("/edit/:inv_id", utilities.checkLogin, accntValidate.checkAccountType, utilities.handleErrors(invController.updateInventoryView))

// Route to submit edits to inventory
router.post("/update/", utilities.checkLogin, accntValidate.checkAccountType, regValidate.inventoryRules(), regValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))

// Route to delete confirm
router.get("/delete/:inv_id", utilities.checkLogin, accntValidate.checkAccountType, utilities.handleErrors(invController.deleteInventoryView))

// Route to submit inventory to delete
router.post("/delete/", utilities.checkLogin, accntValidate.checkAccountType, utilities.handleErrors(invController.removeInventory))

module.exports = router
