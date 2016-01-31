
describe("Publisher", function () {
    
    var Promise = require("bluebird")

    var _revelioClientMock = {
        createSite: function () {},
        updateSite: function () {},
        setEndpoint: function () {}
    }
    var _proxyquire = require("proxyquire");
    

    var _publisher;
    
    beforeEach(function () {
        _publisher = _proxyquire("../lib/publisher", {
            "./revelioServiceClient": _revelioClientMock,
            "@noCallThru": true
        });
    })
    
    it("calls API if endpoints are present", function (done) {
        //Arrange
        spyOn(_revelioClientMock, "createSite").and
            .returnValue(getMockPromise({
                revision: "rev"
            }))
        spyOn(_revelioClientMock, "updateSite").and
            .returnValue(getMockPromise({}))
        spyOn(_revelioClientMock, "setEndpoint").and
            .returnValue(getMockPromise({}))
        
        //Act
        var promise = _publisher.publish("site path", "site url", [
            {
                name: "endpoint1"
            },
            {
                name: "endpoint2"
            }
        ]);
        
        //Assert
        promise.then(function () {
            expect(_revelioClientMock.createSite)
                .toHaveBeenCalledWith("site path", "site url")
            expect(_revelioClientMock.updateSite)
                .toHaveBeenCalledWith("site path", "rev", "site url", true)
            expect(_revelioClientMock.setEndpoint)
                .toHaveBeenCalledWith({
                    name: "endpoint1"
                }, "site path", "rev")
            expect(_revelioClientMock.setEndpoint)
                .toHaveBeenCalledWith({
                    name: "endpoint2"
                }, "site path", "rev")
        })
        .finally(assertPromiseWasFulfilled(promise, done));        
    });
    
    function assertPromiseWasFulfilled(promise, done) {
        return function () {
            if (!promise.isFulfilled()) throw "Promise not fulfilled"
            done();
        }
    }

    function getMockPromise(result) {
        return Promise.resolve(result);
    }
})