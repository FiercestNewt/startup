const { MongoClient } = require('mongodb');
const config = require('./dbconfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const databaseName = process.env.MONGODB_DATABASE || config.database;
if (!databaseName) {
  throw new Error('MongoDB database name is not configured');
}
const db = client.db(databaseName);
const userCollection = db.collection('user');
const groupCollection = db.collection('group');
const scoreCollection = db.collection('score');

async function databaseOperation(description, operation) {
  try {
    return await operation();
  } catch (error) {
    console.error(`Database operation failed (${description}): ${error.message}`);
    throw error;
  }
}

async function connect() {
  await databaseOperation('connect', async () => {
    await db.command({ ping: 1 });
    console.log(`Connected to database "${databaseName}"`);
  });
}

function getUser(email) {
  return databaseOperation('get user', () => userCollection.findOne({ email }));
}

function getUserByToken(token) {
  return databaseOperation('get user by token', () => userCollection.findOne({ token }));
}

async function addUser(user) {
  await databaseOperation('add user', () => userCollection.insertOne(user));
}

async function updateUser(user) {
  await databaseOperation('update user', () =>
    userCollection.updateOne({ email: user.email }, { $set: user }));
}

async function updateUserRemoveAuth(user) {
  await databaseOperation('remove user auth', () =>
    userCollection.updateOne({ email: user.email }, { $unset: { token: 1 } }));
}

function getGroup(code) {
  return databaseOperation('get group', () => groupCollection.findOne({ code }));
}

function getGroups() {
  return databaseOperation('get groups', () => groupCollection.find({}).toArray());
}

async function addGroup(group) {
  await databaseOperation('add group', () => groupCollection.insertOne(group));
}

async function updateGroup(group) {
  await databaseOperation('update group', () =>
    groupCollection.replaceOne({ id: group.id }, group));
}

async function deleteGroup(id) {
  await databaseOperation('delete group', () => groupCollection.deleteOne({ id }));
}

async function addScore(score) {
  await databaseOperation('add score', () => scoreCollection.insertOne(score));
}

function scoreExists(groupId, email) {
  return databaseOperation('check score', () =>
    scoreCollection.findOne({ groupId, email }));
}

function getHighScores() {
  return databaseOperation('get high scores', () =>
    scoreCollection.find({}).sort({ score: -1 }).limit(10).toArray());
}

module.exports = {
  connect,
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  updateUserRemoveAuth,
  getGroup,
  getGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  addScore,
  scoreExists,
  getHighScores,
};
