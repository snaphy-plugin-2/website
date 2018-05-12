'use strict';
module.exports = function( server, databaseObj, helper, packageObj) {
    const path = require('path');
    const Promise = require("bluebird");

    //Will load the controller
	const controller = require("../controller")(server, databaseObj, helper, packageObj);
    const routeHelper = require("./helper")(server, databaseObj, helper, packageObj);
    
    const viewPath = path.join(__dirname, "../views/");


	var init = function(){
        controller.init();
    };
    
    // Home Route
    server.get('/', function (req, res) {
        let userId;
        if (req.accessToken && req.accessToken.userId) {
            userId = req.accessToken.userId;
        }
        server.customRender(req, res,  viewPath, 'index', {
            page: {
                path: "pages/home"
            },
            data: userId,
            seo: {
                title: "",
                description: "",
                "headerBar": true,
                header: true,
                footer: true
            }
        }, [
            //Middleware names..
            routeHelper.getHeaderData,
        ])
            .then(function (html) {
                res.status(200).send(html);
            })
            .catch(function (error) {
                server.logger.error(error);
                //TODO: Redirect to Error Page..
                res.status(500).json({ error: "Internal server error" });
            });
    });

	//return all the methods that you wish to provide user to extend this plugin.
	return {
		init: init
	}
}; //module.exports
