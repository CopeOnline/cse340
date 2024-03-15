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

module.exports = invCont
