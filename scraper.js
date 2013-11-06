var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var url = 'http://www.nhl.com/ice/playerstats.htm';
var data = [];

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

			// Handle first column
			if(column == " "){
				column = "Rank";
			}

			player[column] = value;
			console.log(column + ": " + value);
		});
		data.push(player);
	});
	
	fs.writeFile("scrapedata.json", JSON.stringify(data, null, 2), function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	}); 
});
