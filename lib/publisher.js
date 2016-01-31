var Promise = require("bluebird")
var _serviceClient = require("./revelioServiceClient")

function publish(sitePath, siteUrl, endpoints) {
    var revision;
    return _serviceClient.createSite(sitePath, siteUrl)
        .then(function (createSiteResp) {
            revision = createSiteResp.revision;
            return Promise.each(endpoints, function (endpoint) {
                return _serviceClient.setEndpoint(endpoint, sitePath, revision)
            })
        })
        .then(function () {
            return _serviceClient.updateSite(sitePath, revision, siteUrl, true)
        })
}


module.exports = {
    setRevelioUrl: _serviceClient.setRevelioUrl,
    setApiKey: _serviceClient.setApiKey,
    publish: publish
}