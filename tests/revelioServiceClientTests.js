describe("Revelio service client", function () { 
var AssertChain = require("assertchain-jasmine")
var _proxyquire = require("proxyquire").noPreserveCache();
var _ = require("underscore");

var _httpClientMock = {
    get: function () {},
    post: function () {},
    put: function () {},
    addHandler: function () {}
}
var _httpClientFactoryMock = {
    getClient: function () {
        return _httpClientMock;
    }
}

var _client

beforeEach(function() {
    _client = 
    _proxyquire("../lib/revelioServiceClient", {
        "http-client-factory": _httpClientFactoryMock,
        "@noCallThru": true
    });
    _client.setRevelioUrl("http://www.baserevelio.com/path")
})

describe("Create site", function () {
    
    it("calls post and returns data", function () {
        //Arrange
        setResponse("post", 200, { 'revision': 'revision val' })
        
        //Act
        var result = _client.createSite("site/path", "http://www.siteurl.com").value()
        
        //Assert
        AssertChain.with(result, function (obj) {
            this.areEqual("revision val", obj.revision);
        })
        expect(_httpClientMock.post).toHaveBeenCalledWith(
            "http://www.baserevelio.com/path/api/site",
            {
                path: "site/path",
                url: "http://www.siteurl.com"
            })
    })
    
    it("returns error on 401", function () {
        //Arrange
        setResponse("post", 401, {})
        
        //Act
        var result = _client.createSite("site/path", "http://www.siteurl.com").reason()
        
        //Assert
        expect(result.message).toBe("Unauthorized: server requires API key authentication")
        expect(_httpClientMock.post).toHaveBeenCalledWith(
            "http://www.baserevelio.com/path/api/site",
            {
                path: "site/path",
                url: "http://www.siteurl.com"
            })
    })
    
    it("returns error on 401 if credentials are bad", function () {
        //Arrange
        _client.setApiKey("public", "private")
        setResponse("post", 401, {})
        
        //Act
        var result = _client.createSite("site/path", "http://www.siteurl.com").reason()
        
        //Assert
        expect(result.message).toBe("Unauthorized: invalid API credentials")
        expect(_httpClientMock.post).toHaveBeenCalledWith(
            "http://www.baserevelio.com/path/api/site",
            {
                path: "site/path",
                url: "http://www.siteurl.com"
            })
    })
    
})

describe("setEndpoint", function () {
    it("calls put to set the endpoint", function () {
        //Arrange
        setResponse("put", 200, {})
        var endpoint = { method: "get", name: "test", route: "some route"}
        
        //Act
        var result = _client.setEndpoint(endpoint, "sitePath", "revision").value()
        
        //Assert
        expect(_httpClientMock.put).toHaveBeenCalledWith(
            "http://www.baserevelio.com/path/api/endpoint",
            _.extend({
            revision: "revision",
            sitePath: "sitePath"
        }, endpoint))
        
    });
    
    it("returns error on non-200", function () {
        //Arrange
        setResponse("put", 404, {})
        var endpoint = { method: "get", name: "test", route: "some route"}
        
        //Act
        var result = _client.setEndpoint(endpoint, "sitePath", "revision").reason()
        
        //Assert
        expect(result.message).toBe("Set endpoint failed")
    })
})

describe("updateSite", function () {
    
    it("calls put to update the site", function () {
        //Arrange
        setResponse("put", 200, { })
        
        //Act
        var result = _client.updateSite("site/path", "revision", "http://www.siteurl.com", true).value()
        
        //Assert
        expect(_httpClientMock.put).toHaveBeenCalledWith(
            "http://www.baserevelio.com/path/api/site",
            {
                isActive: true,
                path: "site/path",
                revision: "revision",
                url: "http://www.siteurl.com"
            })
    })
    
    it("returns error on 401", function () {
        //Arrange
        setResponse("put", 401, {})
        
        //Act
        var result = _client.updateSite("site/path", "revision", "http://www.siteurl.com", true).reason()
        
        //Assert
        expect(result.message).toBe("Update site failed")
    })
})


function setResponse(method, statusCode, responseObj) {
    var promise = {
        then: function(cb) {
            cb({
                statusCode: statusCode,
                body: JSON.stringify(responseObj)
            })
        }
    }
    // var promise = Promise.resolve({
    //     statusCode: statusCode,
    //     body: JSON.stringify(responseObj)
    // });
    spyOn(_httpClientMock, method).and.returnValue(promise)
}
})