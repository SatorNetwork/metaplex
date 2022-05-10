const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = 3500

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

app.post('/post-test', (req, res) => {
  console.log('Got body:', req.req);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
