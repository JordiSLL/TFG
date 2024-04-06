const express = require('express')
const app = express()
const bodyParser = require('body-parser');
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

app.use('/api/users', UserRouter);
app.use('/api/users', (req, res, next) => {
  const origin = req.get('origin');
  if (origin === 'http://localhost:3000') { // Cambia esto según la URL de tu aplicación
    next();
  } else {
    res.redirect('/');;
  }
}, UserRouter);
//app.use('/api/pacient', PacientRouter);

app.use('/', UrlRouter);

//Si se añade alguna URL no valida vamos directamente al loginRegister
app.use((req, res) => {
    res.redirect('/');
  });

app.listen(port, () => {
    console.log("Listening on port "+port)
})