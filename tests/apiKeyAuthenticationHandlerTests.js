var _proxyquire = require("proxyquire");
var Handler;


var _cryptoMock = {
    createHash: function () { return this },
    update: function () { return this },
    digest: function () {}
}
var _dateMock = {
    getUnixTime: function () {}
}
_proxyquire("../lib/apiKeyAuthenticationHandler", {
    "crypto": _cryptoMock,
    "./date": _dateMock,
    "@noCallThru": true
});

beforeEach(function () {
    Handler = require("../lib/apiKeyAuthenticationHandler")    
})

describe("Handler tests", function () {
    
    it("throws exception if public key is null", function () {
        //Arrange
        
        //Act
        try {
            new Handler(null, "private")
            fail()
        }
        catch (ex) {
        //Assert
            expect(ex).toBe("Public key is required")
        }
    });
    
    it("throws exception if private key is null", function () {
        //Arrange
        
        //Act
        try {
            new Handler("public", null)
            fail()
        }
        catch (ex) {
        //Assert
            expect(ex).toBe("Private key is required")
        }
    });
    
    it("correctly adds authorization header", function () {
        //Arrange
        spyOn(_cryptoMock, "createHash").and.callThrough();
        spyOn(_cryptoMock, "update").and.callThrough();
        spyOn(_cryptoMock, "digest").and.returnValues("hash1", "hash2")
        spyOn(_dateMock, "getUnixTime").and.returnValue(123456)
        var handler = new Handler("public", "private")
        var request = { headers: {}}
        
        //Act
        handler.onRequest(request, { body: 'request body' })
        
        //Assert
        expect(_cryptoMock.update).toHaveBeenCalledWith("{\"body\":\"request body\"}", "utf8")
        expect(_cryptoMock.update)
            .toHaveBeenCalledWith("public.private.123456.hash1", "utf8")
        expect(request.headers.authorization).toBe("hmac " + new Buffer("public.123456.hash2").toString("base64"))
        
    });
    
    
})