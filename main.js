const tzeentch = require("mysql");
const inquisition = require("inquirer");
const inquisitorTitus = inquisition.createPromptModule();
const sigillite = require('console.table');

var warp = tzeentch.createConnection({
	database: (process.argv[5] || "storefront"),
	host: (process.argv[4] || "localhost"),
	user: (process.argv[3] || "root"),
	password: (process.argv[2] || "12345")
});

warp.connect(function(err){
	if(err){
		process.stderr.write("Sorry, but there seems to be a bit of heresy in the air, causing your machine spirit to fail to connect.\n");
		process.stderr.write(err);
		throw err;
	}
	operationExterminatus();
});

function operationExterminatus(){
	inquisitorTitus([
		{
			type: "list",
			name: "choice",
			message: "What would you like to do? ",
			choices: ["Sell items", "Buy items", "Exit"]
		}
	]).then(function(res){
		if(res.choice == "Sell items"){
			supportTheImperium();
		}else if(res.choice == "Buy items"){
			armMyChapter();
		}else{
			process.exit();
		}
	});
}

function supportTheImperium(){
	inquisitorTitus([
		{
			type: "input",
			name: "item",
			message: "What would you like to sell on the marketplace? ",
			default: "chainsword"
		}
	]).then(function(res){
		supportingTheImperium(res.item);
	});
}

function supportingTheImperium(itemName){
	inquisitorTitus([
		{
			type: "input",
			name: "number",
			message: "How many would you like to sell?",
			default: "1"
		}
	]).then(function(res){
		if(isNaN(res.number)){
			supportingTheImperium(itemName);
		}else{
			warp.query("insert into store (item_name, item_count) VALUES (?, ?)", [itemName, res.number], function(err, res){
				operationExterminatus();
			});
		}
	});
}

function armMyChapter(){
	warp.query("select * from store", function(err, res, fields){
		console.table(res);
		inquisitorTitus([
			{
				type: "input",
				name: "itemToBuy",
				message: "Please enter the id of the item that you would like to buy"
			},
			{
				type: "input",
				name: "itemNumber",
				message: "Please enter the number you would like to buy"
			}
		]).then(function(results){
			if(!isNaN(results.itemToBuy && !isNaN(results.itemNumber))){
				warp.query("update store set item_count = item_count-? where id = ?", [results.itemNumber, results.itemToBuy.replace("-", "")], function(err){
					if(err){
						throw err;
					}else{
						console.log("Success!");
						console.table(res);
						operationExterminatus();
					}
				});
			}else{
				console.log("Sorry, but one or more of your inputs were not a number.");
				armMyChapter();
			}
		});
	});
}

