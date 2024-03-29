// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');

app.use(cors());
app.use(bodyParser.json({ strict: false }));

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.get('/', function (req, res) {
  console.log('DX :: hello world');
  res.send('Hello World!')
})

// Get User endpoint
app.get('/users/:userId', function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get user' });
    }
    if (result.Item) {
      const {userId, name} = result.Item;
      console.log('GET ONE USER :: ', { userId, name });
      res.json({ userId, name });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
})

app.get('/users', function (req,res){
  const params = {
    TableName: USERS_TABLE,
  }
  dynamoDb.scan(params,(error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get user' });
    }
    if (result) {
      console.log('GET ALL USERS :: ', result);
      res.json(result);
    } else {
      res.status(404).json({ error: "No users found" });
    }
  })
})

// Create User endpoint
app.post('/users', function (req, res) {
  const { userId, name } = req.body;
  if (typeof userId !== 'string') {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== 'string') {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: userId,
      name: name,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create user' });
    }
    console.log('CREATE USER :: ', { userId, name });
    res.json({ userId, name });
  });
})

module.exports.handler = serverless(app);
