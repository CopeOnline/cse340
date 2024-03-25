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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management-view", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.updateInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData[0].classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    classification_id: itemData[0].classification_id,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_price: itemData[0].inv_price
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.removeInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
  } = req.body
  const deleteResult = await invModel.removeInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
  )

  if (deleteResult) {
    const itemName = deleteResult.rows[0].inv_make + " " + deleteResult.rows[0].inv_model
    req.flash("notice", `The ${itemName} was removed.`)
    res.redirect("/inv")
  } else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-confirm", {
    title: "Edit " + itemName,
    nav,
    classification_id,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    })
  }
}


module.exports = invCont
