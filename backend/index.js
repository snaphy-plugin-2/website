'use strict';
module.exports = function( server, databaseObj, helper, packageObj) {
	const Promise     = require("bluebird");
	const async         = require("async");
	const routes      = require("./routes")(server, databaseObj, helper, packageObj);
	const routeHelper = require("./routes/helper")(server, databaseObj, helper, packageObj);

	var init = function(){
		viewRenderer();
		routes.init();
	};




	/**
	 * Load all middlewares..before rendering a page..
	 */
	const loadMiddlewares = function(req, res, data, middlewares){
		return new Promise(function(resolve, reject){
			const promiseList = [
				function(callback){
					routeHelper.verifyPageAccess(req, res, data)
					.then(function(){
						callback();
					})
					.catch(function(error){
						callback(error);
					});
				}
			];
			if(middlewares){
				if(middlewares.length){
					middlewares.forEach(function(middleware){
						promiseList.push(function(callback){
								middleware(
									req, 
									res,
									data
								)
								.then(function(){
									callback();
								})
								.catch(function(error){
									callback(error);
								});
						});
					});
				}
			}

			//Load all promises one by one..
			async.waterfall(promiseList, function(error, data){
				if(error){
					console.error(error);
					reject(error);
				}else{
					resolve();
				}
			});
		});
	};


	



	/**
	 * Load customer view Renderer..
	 */
	const viewRenderer = function(){
		//https://stackoverflow.com/questions/21885377/change-express-view-folder-based-on-where-is-the-file-that-res-render-is-calle
		/**
		 * Custom renderer
		 * @param {*} root 
		 * @param {*} name 
		 * @param {*} opts 
		 */
		server.customRender = function (req, res, root, name, opts, middlewares) {
			return new Promise(function (resolve, reject) {
				//First load all middlewares..
				//Will only return if resolve has true value else not..
				loadMiddlewares(req, res, opts, middlewares)
				.then(function(){
					var engines = server.engines;
					var cache = server.cache;

					let view = cache[root + '-' + name];

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

						cache[root + '-' + name] = view;
					}

					try {
						view.render(opts, function (error, html) {
							if (error) {
								reject(error);
							} else {
								resolve(html);
							}
						});
					} catch (err) {
						reject(err);
					}
				})
				.catch(function(error){
					reject(error);
				});
				
			});
		};

	};
	


	//return all the methods that you wish to provide user to extend this plugin.
	return {
		init: init
	}
}; //module.exports
