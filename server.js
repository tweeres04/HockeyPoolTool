﻿var express = require('express');
var fs = require('fs');
var dataFile = "C:\\Webpages\\nhldata.json";
var saveFile = "HockeyPoolTool.json";

var app = express();
app.use(express.bodyParser());

app.get('/', function (req, res) {
    res.sendfile('HockeyPoolTool.html');
});

app.get("/players", function (request, response) {
    getData(function (data) {
        var players = data.Data;
        for (var i in players) {
            players[i] = {
                Name: players[i].Name,
                Team: players[i].Team
            };
        }
        response.json(players.sort(function (a, b) {
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

app.get("/myteam", function(request, response){
    getTeam(function (team) {
        response.json(team);
    });
});

app.post("/myteam", function (request, response) {
    debugger;
    fs.writeFile(saveFile, JSON.stringify(request.body, null, 2), function (err) {
        if (err) {
            console.log(err);
        } else {
            response.send("Team data saved.");
        }
    });
});

app.get("/teams", function (request, response) {
    getData(function (data) {
        response.json(data.Teams);
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

function getTeam(callback) {
    fs.readFile(saveFile, 'utf8', function (err, data) {
        callback(JSON.parse(data));
    });
}

app.listen(3000);
console.log("Server running");