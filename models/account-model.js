const pool = require('../database/')

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Get existing accounts
 * ********************* */
async function getAllAccounts(){
  try {
    const sql = "SELECT * FROM account"
    const accounts = await pool.query(sql, [])
    return accounts
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using id
* ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

/* *****************************
* Update account data using id
* ***************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql =
      "UPDATE public.account SET account_firstname = $2, account_lastname = $3, account_email = $4 WHERE account_id = $1 RETURNING *"
    const data = await pool.query(sql, [account_id, account_firstname, account_lastname, account_email])
    return data.rows[0]
  } catch (error) {
    console.error("account error: " + error)
  }
}

/* *****************************
* Update password using id
* ***************************** */
async function updatePassword(account_id, account_password) {
  try {
    const sql =
      "UPDATE public.account SET  account_password = $2 WHERE account_id = $1 RETURNING *"
    return await pool.query(sql, [account_id, account_password])
  } catch (error) {
    console.error("password error: " + error)
  }
}

/* *****************************
* Return account data using  id
* ***************************** */
async function getMessageById(message_id) {
  try {
    const result = await pool.query(
      'SELECT message_id, message_subject, message_body, message_created, message_to, message_from, message_read, message_archived FROM message WHERE message_id = $1',
      [message_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No message found")
  }
}

/* *****************************
* Return messages by recipient
* ***************************** */
async function getMessageByRecipient(message_to) {
  try {
    const result = await pool.query(
      'SELECT message_id, message_subject, message_body, message_created, message_from, message_read, message_archived FROM message WHERE message_to = $1',
      [message_to])
    return result
  } catch (error) {
    return new Error("No message found")
  }
}

/* *****************************
* Create new message using id
* ***************************** */
async function createNewMessage(message_subject, message_body, message_created, message_to, message_from){
  try {
    const sql = "INSERT INTO message (message_subject, message_body, message_created, message_to, message_from, message_read, message_archived) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
    return await pool.query(sql, [message_subject, message_body, message_created, message_to, message_from])
  } catch (error) {
    return error.message
  }
}

  module.exports = { 
    registerAccount, 
    checkExistingEmail, 
    getAccountByEmail, 
    getAccountById, 
    updateAccount, 
    updatePassword, 
    getMessageById,
    getAllAccounts, 
    createNewMessage,
    getMessageByRecipient
   }