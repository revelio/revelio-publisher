
function getUnixTime() {
    return Math.floor(new Date() / 1000)
}

module.exports = {
    getUnixTime: getUnixTime
}