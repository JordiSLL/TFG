const express = require('express')
const app = express()
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

app.use('/api/users', UserRouter);

//app.use('/api/pacient', PacientRouter);

//app.use('/api/urls', UrlRouter);

app.listen(port, () => {
    console.log("Listening on port "+port)
})