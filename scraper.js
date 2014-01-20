var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');

var season = '20132014';
var teams = ["ANA", "BOS", "BUF", "CGY", "CAR", "CHI", "COL", "CBJ", "DAL", "DET", "EDM", "FLA", "LAK", "MIN", "MTL", "NSH", "NJD", "NYI", "NYR", "OTT", "PHI", "PHX", "PIT", "SJS", "STL", "TBL", "TOR", "VAN", "WSH", "WPG", ];

var data = [];

var requests = [];

for(var i in teams){
	requests.push(getTeamData.bind({}, teams[i]));	
}

async.series(requests, saveScrapeData);

function getTeamData(team, callback){
	var url = 'http://www.nhl.com/ice/playerstats.htm?season=' + season + '&gameType=2&team=' + team + '&position=S&country=&status=&viewName=summary';

	request(url, function(err, resp, body){
		if(err){
			throw err;
		}
		$ = cheerio.load(body);
		$(".data tbody tr").each(function(i, row){
		 	var player = {};
			$(row).find("td").each(function(j, cell){
				var column = $($(".data thead th")[j]).text().replace(/\n/g, "");
				var value = $(cell).text().replace(/\n/g, "");

				// Don't scrape the rank column
				if(column != String.fromCharCode(160)){
					player[column] = value;
				}
			});
			data.push(player);
		});
		console.log("Stats downloaded for " + team + ".");
		callback();
	});
}

function saveScrapeData(){
	fs.writeFile("scrapedata.json", JSON.stringify(data, null, 2), function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("Data scraped!");
		}
	});
}
