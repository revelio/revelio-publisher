var crypto = require("crypto")
var date = require("./date")

function getHmacValue(request, publicKey, privateKey) {
    var requestHash = sha256(JSON.stringify(request));
    var dt = date.getUnixTime();
    var hmac = sha256(concat(publicKey, privateKey, dt, requestHash))
    var token = concat(publicKey, dt, hmac)
    return base64(token)
}

function base64(val) {
    return new Buffer(val).toString("base64")
}

function sha256(val) {
    return crypto.createHash("sha256")
        .update(val, "utf8").digest("base64")
}

function concat() {
    return Array.prototype.slice.call(arguments).join(".");
}

function createHandler(publicKey, privateKey) {
    if (publicKey == null) throw "Public key is required"
    if (privateKey == null) throw "Private key is required"
    
    this.onRequest = onRequest
    
    function onRequest(req, reqBody) {
        var hmacValue = getHmacValue(reqBody, publicKey, privateKey);
        req.headers.authorization = "hmac " + hmacValue;
    }
}

module.exports = createHandler