const { MongoClient } = require('mongodb');
const config = require('./dbconfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('startup');
const userCollection = db.collection('user');
const groupCollection = db.collection('group');
const scoreCollection = db.collection('score');

async function connect() {
  await db.command({ ping: 1 });
  console.log('Connect to database');
}

function getUser(email) {
  return userCollection.findOne({ email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

async function updateUserRemoveAuth(user) {
  await userCollection.updateOne({ email: user.email }, { $unset: { token: 1 } });
}

function getGroup(code) {
  return groupCollection.findOne({ code });
}

function getGroups() {
  return groupCollection.find({}).toArray();
}

async function addGroup(group) {
  await groupCollection.insertOne(group);
}

async function updateGroup(group) {
  await groupCollection.replaceOne({ id: group.id }, group);
}

async function deleteGroup(id) {
  await groupCollection.deleteOne({ id });
}

async function addScore(score) {
  await scoreCollection.insertOne(score);
}

function scoreExists(groupId, email) {
  return scoreCollection.findOne({ groupId, email });
}

function getHighScores() {
  return scoreCollection.find({}).sort({ score: -1 }).limit(10).toArray();
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
