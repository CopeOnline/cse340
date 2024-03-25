const pool = require('../database/')

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications () {
  return await pool.query('SELECT * FROM public.classification ORDER BY classification_name')
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId (classificationId) {
  try {
    const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classificationId]
    )
    console.log(data.rows)
    return data.rows
  } catch (error) {
    console.error('getclassificationsbyid error ' + error)
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryById (invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      WHERE i.inv_id = $1`,
      [invId]
    )
    console.log(data.rows, 'data.rows')
    return data.rows
  } catch (error) {
    console.error('getinventorybyid error ' + error)
  }
}

/* *****************************
*   Add new classification
* *************************** */
async function addClassification(classification_name){
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    console.error('addclassification error ' + error)
    return error
  }
}


/* *****************************
*   Add new vehicle
* *************************** */
async function addVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id){
  try {
    const sql = "INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id])
  } catch (error) {
    console.error('addVehicle error ' + error)
    return error
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(inv_id, inv_make, inv_model,  inv_description,  inv_image,  inv_thumbnail,  inv_price,  inv_year,  inv_miles,  inv_color,  classification_id) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* *****************************
*   Delete vehicle
* *************************** */
async function removeInventory(inv_id){
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1  RETURNING *"
    return await pool.query(sql, [inv_id])
  } catch (error) {
    console.error('removeInventory error ' + error)
    return error
  }
}

module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getInventoryById, 
  addClassification, 
  addVehicle,
  updateInventory,
  removeInventory 
}
