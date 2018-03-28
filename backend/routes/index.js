'use strict';
module.exports = function( server, databaseObj, helper, packageObj) {
    const path = require('path');
    const Promise = require("bluebird");

    //Will load the controller
	const controller = require("../controller")(server, databaseObj, helper, packageObj);
    const viewPath = path.join(__dirname, "../views/");

	var init = function(){
        controller.init();


    };
    
    //https://stackoverflow.com/questions/21885377/change-express-view-folder-based-on-where-is-the-file-that-res-render-is-calle
    /**
     * Custom renderer
     * @param {*} root 
     * @param {*} name 
     * @param {*} opts 
     */
    server.customRender = function (root, name, opts) {
        return new Promise(function(resolve, reject){
            var engines = server.engines;
            var cache = server.cache;
        
            let view = cache[root+'-'+name];
        
            if (!view) {
                view = new (server.get('view'))(name, {
                    defaultEngine: server.get('view engine'),
                    root: root,
                    engines: engines
                });
        
                if (!view.path) {
                    var err = new Error('Failed to lookup view "' + name + '" in views directory "' + root + '"');
                    err.view = view;
                    return reject(err);
                }
            
                cache[root+'-'+name] = view;
            }
        
            try {
                view.render(opts, function(error, html){
                    if(error){
                        reject(error);
                    }else{
                        resolve(html);
                    }
                });
            } catch (err) {
                reject(err);
            }      
        });
    };


    // Home Route
    server.get('/', function(req, res){
        server.customRender(viewPath, 'index', {
            page:{
                path: "pages/home"
            },
            data:{
                name: "Robins"
            }
        })
        .then(function(html){
            res.send(200, html);
        })
        .catch(function(error){
            server.logger.error(error);
            res.send(404);
        });
    });


    //Fabric Route
    server.get('/fabric/:fabricId', function(req, res){
        const fabricId = req.params.fabricId;
        controller.getFabricPageData(fabricId)
        .then(function(fabricObj){
            return server.customRender(viewPath, 'index', {
                page:{
                    path: "pages/fabric"
                },
                data: fabricObj
            })    
        })
        .then(function(html){
            res.send(200, html);
        })
        .catch(function(error){
            console.error(error);
            res.send(404);
        });
    });

	//return all the methods that you wish to provide user to extend this plugin.
	return {
		init: init
	}
}; //module.exports
