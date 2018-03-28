'use strict';
module.exports = function( server, databaseObj, helper, packageObj) {
	const Promise = require("bluebird");


	var init = function(){
		
	};

	/**
	 * Will return the fabric page data..
	 * @param {*} fabricId 
	 */
	const getFabricPageData = function(fabricId){
		return new Promise(function(resolve, reject){
			const Fabric = databaseObj.Fabric;
			Fabric.findById(fabricId)
			.then(function(fabric){
				resolve({
					fabric: fabric,
					func: {
						getImage: getImage,
					}
					
				});
			})
			.catch(function(error){
				reject(error);
			});
		});
	};

	/**
	 * Get Image url
	 * @param {*} url 
	 */
	const getImage = function(url){
		var image = url;
		if(url){
			if(url.length){
				image = url[0];
			}
			if(image.url){
				if(image.url.unSignedUrl){
					return image.url.unSignedUrl;
				}
			}
		}
	}



	//return all the methods that you wish to provide user to extend this plugin.
	return {
		init: init,
		getFabricPageData: getFabricPageData,
	//	getImage         : getImage
	}
}; //module.exports
