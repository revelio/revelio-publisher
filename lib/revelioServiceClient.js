var Promise = require("bluebird")
var _factory = require('http-client-factory');
var _ = require("underscore")
var ApiKeyHandler = require("./apiKeyAuthenticationHandler")

var _baseUrl
function setRevelioUrl(url) {
    if (!url.endsWith("/")) url += "/"
    _baseUrl = url + "api/"
}

var _authHandler;
function setApiKey(publicKey, privateKey) {
    _authHandler = new ApiKeyHandler(publicKey, privateKey)
}

function createSite(sitePath, siteUrl) {
    var request = {
        path: sitePath,
        url: siteUrl
    }
    var promise = new Promise(function (resolve, reject) {
        getClient()
            .post(_baseUrl + "site", request)
            .then(function (response) {
                if (response.statusCode == 200) {
                    resolve(JSON.parse(response.body))
                }
                else if (response.statusCode == 401) {
                    if (_authHandler) {
                        reject(new Error("Unauthorized: invalid API credentials"))
                    } else {
                        reject(new Error("Unauthorized: server requires API key authentication"))
                    }
                } else {
                    reject(new Error("Unable to communicate with Revelio"))
                }
                return response;
            })
    })
    
    return promise
}

function setEndpoint(endpoint, sitePath, revision) {
    var request = _.extend({
        revision: revision,
        sitePath: sitePath
        }, endpoint);
        
    var promise = new Promise(function (resolve, reject) {
        getClient()
            .put(_baseUrl + "endpoint", request)
            .then(function (response) {
                if (response.statusCode == 200) {
                    resolve(JSON.parse(response.body))
                }
                else {
                    reject(new Error("Set endpoint failed"))
                }
            })
    })
            
     return promise
}

function updateSite(sitePath, revision, siteUrl, isActive) {
    var request = {
        isActive: isActive,
        path: sitePath,
        revision: revision,
        url: siteUrl
    }
    var promise = new Promise(function (resolve, reject) {
        getClient()
            .put(_baseUrl + "site", request)
            .then(function (response) {
                if (response.statusCode != 200) {
                    reject(new Error("Update site failed"))
                } else {
                    resolve(JSON.parse(response.body))
                }
            })
    })
    
    return promise;
}

function getClient() {
    var client = _factory.getClient({keepAlive: true});
    
    if (_authHandler) client.addHandler(_authHandler);
    
    return client;
}


module.exports = {
    setRevelioUrl: setRevelioUrl,
    setApiKey: setApiKey,
    createSite: createSite,
    setEndpoint: setEndpoint,
    updateSite: updateSite
};