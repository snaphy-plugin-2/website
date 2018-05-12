/**
 * Created by Robins Gupta
 * 4th May 2018
 * @param {*} server 
 * @param {*} databaseObj 
 * @param {*} helper 
 * @param {*} packageObj 
 */


module.exports = function (server, databaseObj, helper, packageObj) {
    'use strict';
    const slug = require('slug');
    const Promise = require("bluebird");
    /**
     * Middleware will fetch the header data from the server..
     */
    const getHeaderData = function (req, res, data) {
        return new Promise(function (resolve, reject) {
            resolve();
        });

    };


    /**
     * Will generate the slug values
     * @param {*} value 
     */
    const getSlug = function (value) {
        return slug(value, { lower: true });
    };



    /**
     * Middleware for verifying page access..
     */
    const verifyPageAccess = function (req, res, data) {
        return new Promise(function (resolve, reject) {
            const pageAccessObj = packageObj.pageAccess;
            //Check whether the user is authorised or not..
            let $authorised = false;
            let $unauthorised = true;
            let userId, path = req.path;
            //Get the current page..
            const page = data.page.path;

            if (req.accessToken) {
                if (req.accessToken.userId) {
                    $authorised = true;
                    $unauthorised = false;
                    userId = req.accessToken.userId;
                }
            }

            //Check if page found..
            if (pageAccessObj[page]) {
                const accessObj = pageAccessObj[page];
                let allowed = false;
                //Check if matches..
                if ($authorised) {
                    if (accessObj["$authorised"]) {
                        allowed = true;
                    }
                }

                if ($unauthorised) {
                    if (accessObj["$unauthorised"]) {
                        allowed = true;
                    }
                }

                if (allowed) {
                    resolve();
                } else {
                    ///Redirect to new Page..
                    var old_path = encodeURIComponent(path);

                    let redirectPath = accessObj.redirect;
                    //Also add referral to the path..
                    res.redirect(`${redirectPath}?ref=${old_path}`);
                    //Now throw error to stop the promise checking here only..
                    reject(new Error("Already Redirected"));
                }
            } else {
                //Allow page..now access found..
                resolve();
            }
        });
    };


    return {
        getHeaderData: getHeaderData,
        verifyPageAccess: verifyPageAccess
    };
};