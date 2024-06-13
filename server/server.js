const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors')

const config = require('./config/config');
const UserRouter = require("./routes/user.route");
const UrlRouter = require('./routes/url.route');
const PacientRouter = require('./routes/pacient.route');

const port = config.PORT; 

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use('/api/users', (req, res, next) => {
  const origin = req.get('origin');
  if (origin === 'http://localhost:3000') { 
    next();
  } else {
    res.redirect('/');
  }
}, UserRouter);

app.use('/api/users', UserRouter);
app.use('/api/pacient', PacientRouter);
app.use('/', UrlRouter);

app.use((req, res) => {
    res.redirect('/main');
  });

app.listen(port, () => {
    console.log("Listening on port "+port)
})