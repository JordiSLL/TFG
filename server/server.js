const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//const multer = require('multer');
const cors = require('cors')
//const fs = require('fs');

const config = require('./config/config');
const UserRouter = require("./routes/user.route");
const UrlRouter = require('./routes/url.route');
const PacientRouter = require('./routes/pacient.route');

const port = config.PORT; 

//app.use(cors());
//const upload = multer({ dest: 'uploads/' });
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api/users', UserRouter);

app.use('/api/users', (req, res, next) => {
  const origin = req.get('origin');
  if (origin === 'http://localhost:3000') { 
    next();
  } else {
    res.redirect('/');
  }
}, UserRouter);

app.use('/api/pacient', PacientRouter);

app.use('/', UrlRouter);

app.use((req, res) => {
    res.redirect('/');
  });

app.listen(port, () => {
    console.log("Listening on port "+port)
})