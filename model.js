// This is a model file that contains functions to interact with the database according to the requirements of the application.

const pool = require('./config/db');
const { v4: uuidv4 } = require('uuid');
const { createEC2KeyPair } = require('./utils/AWS-SDK');
const { encrypt, decrypt, hashData } = require('./utils/encryption');

// This function registers a new user and creates an EC2 key pair for them
async function registerUser({ email, mobile, name, password }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const insertUserQuery = `
      INSERT INTO User (email, mobile, name, password)
      VALUES (?, ?, ?, ?)
    `;
    const [userResult] = await conn.execute(insertUserQuery, [
      email,
      mobile,
      name,
      hashData(password)
    ]);
    const userId = userResult.insertId;

    const keyName = uuidv4();  // Generate a unique key name for every user
    const keyPair = await createEC2KeyPair(keyName); // Create a new EC2 key pair using AWS SDK

    const insertKeyQuery = `
      INSERT INTO UserKeys (KeyPairId, KeyFingerprint, KeyName, KeyMaterial, userId)
      VALUES (?, ?, ?, ?, ?)
    `;
    await conn.execute(insertKeyQuery, [
      keyPair.KeyPairId,
      keyPair.KeyFingerprint,
      keyPair.KeyName,
      encrypt(keyPair.KeyMaterial), // Encrypt the key material before storing it
      userId
    ]);

    await conn.commit();
    return userId;
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      throw new Error('A user with that email or mobile already exists.');
    }
    throw err;
  } 
}

// The function to find a user by credentials (used for login)
async function findUserByCredentials(email, password) {
  const query = 'SELECT * FROM User WHERE email = ? AND password = ?';
  const [rows] = await pool.execute(query, [email, hashData(password)]);
  return rows[0];
}

// can be used in future to find user by id
async function findUserById(userId) {
  const query = 'SELECT * FROM User WHERE id = ?';
  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
}

// This function retrieves the encrypted key material for a user and decrypts it
async function getDecryptedUserKey(userId) {
  const query = 'SELECT KeyMaterial FROM UserKeys WHERE userId = ?';
  const [rows] = await pool.execute(query, [userId]);
  return rows.length ? decrypt(rows[0].KeyMaterial) : null;
}

async function getUserKeyName(userId) {
  const query = 'SELECT KeyName FROM UserKeys WHERE userId = ?';
  const [rows] = await pool.execute(query, [userId]);
  return rows.length ? rows[0].KeyName : null;
}

// This function retrieves all instances associated with a user
async function getUserInstances(userId) {
  try {
    const [rows] = await pool.query(
      'SELECT instanceId, instanceOS FROM Instance WHERE userId = ? ORDER BY createdAt ASC',
      [userId]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching user instances:', error);
    throw error;
  }
}

// This function inserts a new instance for a user
async function insertUserInstance({ instanceId, userId, instanceOS }) {
  const query = 'INSERT INTO Instance (instanceId, userId, instanceOS) VALUES (?, ?, ?)';
  const [result] = await pool.execute(query, [instanceId, userId, instanceOS]);
  return result.insertId;
}

// This function deletes instances by their instance IDs ( instanceIds is an array of instance IDs)
async function deleteInstanceByInstanceId(instanceIds) {
  if (!Array.isArray(instanceIds) || instanceIds.length === 0) {
    throw new Error('instanceIds must be a non-empty array');
  }

  const placeholders = instanceIds.map(() => '?').join(', ');
  const query = `DELETE FROM Instance WHERE instanceId IN (${placeholders})`;
  const [result] = await pool.execute(query, instanceIds);
  return result.affectedRows;
}

// This func checks ownership of an instance for a user
async function doesUserOwnInstance(userId, instanceId) {
  const query = 'SELECT 1 FROM Instance WHERE userId = ? AND instanceId = ? LIMIT 1';
  try {
    const [rows] = await pool.query(query, [userId, instanceId]);
    return rows.length > 0;
  } catch (err) {
    console.error('Error checking instance ownership:', err);
    throw err;
  }
}

module.exports = {
  registerUser,
  findUserByCredentials,
  findUserById,
  getDecryptedUserKey,
  getUserKeyName,
  getUserInstances,
  deleteInstanceByInstanceId,
  insertUserInstance,
  doesUserOwnInstance,
};
