var express = require('express');
var fs = require('fs');
var dataFile = "C:\\Webpages\\nhldata.json";
var saveFile = "HockeyPoolTool.json";

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
        response.json(data.sort(function (a, b) {
            if (a.Name > b.Name) {
                return 1;
            }
            if(a.Name < b.Name) {
                return -1;
            }
            return 0;
        }));
    });
});

app.post("/players", function (request, response) {
    fs.writeFile(saveFile, request.body, function (err) {
        console.log(request.body);
        if (err) {
            console.log(err);
        } else {
            response.send("Team data saved.");
        }
    });
});

app.get('/knockout-2.3.0.js', function (req, res) {
    res.sendfile('knockout-2.3.0.js');
});

function getData(callback) {
    fs.readFile(dataFile, 'utf8', function(err, data){
        callback(JSON.parse(data));
    });
}

app.listen(3000);
console.log("Server running");