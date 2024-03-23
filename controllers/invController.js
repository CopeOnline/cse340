const invModel = require('../models/inventory-model')
const utilities = require('../utilities/')

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classificationId = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classificationId)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render('./inventory/classification', {
    title: className + ' vehicles',
    nav,
    grid
  })
}

/* ***************************
 *  Build inventory by details view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const invId = req.params.inv_id
  const data = await invModel.getInventoryById(invId)
  const grid = await utilities.buildDetailsView(data)
  const nav = await utilities.getNav()
  const viewName = `${data[0].inv_year} ` + `${data[0].inv_make} ` + `${data[0].inv_model}`
  res.render('./inventory/details', {
    title: viewName,
    nav,
    grid
  })
}

/* ****************************************
*  Deliver Management view
* *************************************** */
invCont.buildMangementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management-view", {
    title: "Vehicle Management",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver new classification view
* *************************************** */
invCont.addNewClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver new inventory view
* *************************************** */
invCont.addNewInventoryView = async function (req, res, next) {
  let dropdown = await utilities.buildClassificationList()
  let nav = await utilities.getNav()
  console.log(dropdown)
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    dropdown,
    errors: null,
  })
}

/* ****************************************
*  Create new classification
* *************************************** */
invCont.createClassification = async function (req, res) {
const { classification_name } = req.body

const regResult = await invModel.addClassification(
  classification_name
)
let nav = await utilities.getNav()
console.log(regResult)
if (regResult) {
  req.flash(
    "notice",
    `Success, ${classification_name} created.`
  )
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
} else {
  req.flash("notice", `Failed, to create ${classification_name}.`)
  res.status(501).render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
  })
}
}

/* ****************************************
*  Add new Inventory
* *************************************** */
invCont.addInventory = async function (req, res, next) {
const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

const regResult = await invModel.addVehicle(
  inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
)
let dropdown = await utilities.buildClassificationList()
let nav = await utilities.getNav()
console.log(regResult)
if (regResult) {
  req.flash(
    "notice",
    `Success, ${inv_year} ${inv_make} ${inv_model} added.`
  )
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    dropdown,
    errors: null,
  })
} else {
  req.flash("notice", `Failed, to add ${inv_year} ${inv_make} ${inv_model} .`)
  res.status(501).render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    dropdown
  })
}
}


module.exports = invCont
