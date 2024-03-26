const utilities = require('../utilities/')
const baseController = {}

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav()
  const statusHeader = await utilities.buildStatusHeader(req, res)
  res.render('index', { title: 'Home', statusHeader, nav })
}

module.exports = baseController
