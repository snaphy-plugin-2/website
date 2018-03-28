'use strict';
module.exports = function( server, databaseObj, helper, packageObj) {
	
	const routes = require("./routes")(server, databaseObj, helper, packageObj);

	var init = function(){
		routes.init();
	};


	//return all the methods that you wish to provide user to extend this plugin.
	return {
		init: init
	}
}; //module.exports
