var express = require('express');
var fs = require('fs');
var dataFile = "scrapedata.json";
var teamsFile = "teams.json";
var saveFile = "HockeyPoolTool.json";

var app = express();
app.use(express.static(__dirname + "/"));
app.use(express.bodyParser());

app.get('/', function (req, res) {
    res.sendfile('HockeyPoolTool.html');
});

app.get("/players", function (request, response) {
    getData(function (data) {
        var players = data.Stats;
        for (var i in players) {
            players[i] = {
                Name: players[i].Player,
                Team: players[i].Team
            };
        }
        if(players) {
		    response.json(players.sort(function (a, b) {
		        if (a.Name > b.Name) {
		            return 1;
		        }
		        if(a.Name < b.Name) {
		            return -1;
		        }
		        return 0;
		    }));
	    } else {
	    	response.json([]);
    	}
    });
});

app.get("/myteam", function(request, response){
    getTeam(function (team) {
        response.json(team);
    });
});

app.post("/myteam", function (request, response) {
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

function getData(callback) {
    fs.readFile(dataFile, 'utf8', function(err, data){
	    var nhlData = {};
    	nhlData.Stats = JSON.parse(data);
	    fs.readFile(teamsFile, 'utf8', function(err, data){
	    	nhlData.Teams = JSON.parse(data);
	        callback(nhlData);
		});
    });
}

function getTeam(callback) {
    fs.readFile(saveFile, 'utf8', function (err, data) {
        callback(JSON.parse(data));
    });
}

app.listen(3000);
console.log("Server running");
