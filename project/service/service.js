const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

// Users and groups are stored in memory for now. They are reset when the service restarts.
const users = [];
const groups = [];

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.post('/auth/create', async (req, res) => {
  const email = normalizeString(req.body.email);
  const password = req.body.password;

  if (!email || typeof password !== 'string' || password.length < 1) {
    res.status(400).send({ msg: 'Email and password are required' });
    return;
  }

  if (await findUser('email', email)) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }

  const user = await createUser(email, password);
  setAuthCookie(res, user.token);
  res.status(201).send({ email: user.email });
});

apiRouter.post('/auth/login', async (req, res) => {
  const email = normalizeString(req.body.email);
  const user = await findUser('email', email);

  if (user && typeof req.body.password === 'string' && await bcrypt.compare(req.body.password, user.password)) {
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
    return;
  }

  res.status(401).send({ msg: 'Unauthorized' });
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

apiRouter.get('/auth/me', verifyAuth, (req, res) => {
  res.send({ email: req.user.email });
});

// Create a group and add the authenticated player as its host and first member.
apiRouter.post('/groups', verifyAuth, (req, res) => {
  const name = normalizeString(req.body.name);
  if (!name || name.length > 50) {
    res.status(400).send({ msg: 'Group name must be between 1 and 50 characters' });
    return;
  }

  const group = {
    id: uuid.v4(),
    code: createGroupCode(),
    name,
    host: req.user.email,
    players: [req.user.email],
    status: 'lobby',
    createdAt: new Date().toISOString(),
  };
  groups.push(group);
  res.status(201).send(publicGroup(group));
});

// Return groups without exposing authentication data.
apiRouter.get('/groups', verifyAuth, (_req, res) => {
  res.send(groups.map(publicGroup));
});

apiRouter.get('/groups/:code', verifyAuth, (req, res) => {
  const group = findGroup(req.params.code);
  if (!group) {
    res.status(404).send({ msg: 'Group not found' });
    return;
  }
  res.send(publicGroup(group));
});

apiRouter.post('/groups/:code/join', verifyAuth, (req, res) => {
  const group = findGroup(req.params.code);
  if (!group) {
    res.status(404).send({ msg: 'Group not found' });
    return;
  }
  if (group.status !== 'lobby') {
    res.status(409).send({ msg: 'Game has already started' });
    return;
  }

  if (!group.players.includes(req.user.email)) {
    group.players.push(req.user.email);
  }
  res.send(publicGroup(group));
});

apiRouter.post('/groups/:code/start', verifyAuth, (req, res) => {
  const group = findGroup(req.params.code);
  if (!group) {
    res.status(404).send({ msg: 'Group not found' });
    return;
  }
  if (group.host !== req.user.email) {
    res.status(403).send({ msg: 'Only the host can start the game' });
    return;
  }
  if (group.status !== 'lobby') {
    res.status(409).send({ msg: 'Game has already started' });
    return;
  }

  group.status = 'started';
  group.startedAt = new Date().toISOString();
  res.send(publicGroup(group));
});

apiRouter.delete('/groups/:code/leave', verifyAuth, (req, res) => {
  const groupIndex = groups.findIndex((group) => group.code === req.params.code.toUpperCase());
  if (groupIndex === -1) {
    res.status(404).send({ msg: 'Group not found' });
    return;
  }

  const group = groups[groupIndex];
  if (group.host === req.user.email) {
    groups.splice(groupIndex, 1);
  } else {
    group.players = group.players.filter((email) => email !== req.user.email);
  }
  res.status(204).end();
});

// Middleware to verify that the user is authorized to call an endpoint.
async function verifyAuth(req, res, next) {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function createGroupCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () =>
      String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    ).join('');
  } while (findGroup(code));
  return code;
}

function findGroup(code) {
  return groups.find((group) => group.code === normalizeString(code).toUpperCase());
}

function publicGroup(group) {
  return {
    id: group.id,
    code: group.code,
    name: group.name,
    host: group.host,
    players: [...group.players],
    status: group.status,
    createdAt: group.createdAt,
    ...(group.startedAt ? { startedAt: group.startedAt } : {}),
  };
}

async function createUser(email, password) {
  const user = {
    email,
    password: await bcrypt.hash(password, 10),
    token: uuid.v4(),
  };
  users.push(user);
  return user;
}

async function findUser(field, value) {
  if (!value) return null;
  return users.find((user) => user[field] === value);
}

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Keep API errors JSON-shaped, as in the Simon service.
app.use((err, _req, res, _next) => {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});