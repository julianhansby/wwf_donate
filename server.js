const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const path = require('path');
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// static / public dir
app.use(express.static(path.join(__dirname, '/public')));

// route to index file
app.get('/', function(){
	res.sendFile(path.join(__dirname,'/public/index.html'))
})

app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});

module.exports = app;