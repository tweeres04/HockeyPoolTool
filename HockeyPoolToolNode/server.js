//var express = require('express');
//var app = express();

//app.get('/', function (req, res) {
//    res.send('hello world');
//});

//app.listen(3000);


var express = require('express');
var fs = require('fs');
var dataFile = "C:\\Webpages\\nhldata.json";

var app = express();
app.configure = function () {
    app.use(express.bodyParser());
};

app.get('/', function (req, res) {
    res.sendfile('HockeyPoolTool.html');
});

app.get("/players", function (request, response) {
    getData(function (data) {
        for (var i in data) {
            data[i] = {
                Name: data[i].Name,
                Team: data[i].Team
            };
        }
        response.json(data);
    });
});

function getData(callback) {
    fs.readFile(dataFile, 'utf8', function(err, data){
        callback(JSON.parse(data));
    });
}

app.listen(3000);
console.log("Server running");