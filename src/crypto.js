const createHash = require('create-hash');
const sha3 = require('js-sha3').keccak256;

function ripemd160(buffer) {
    return createHash('rmd160').update(buffer).digest();
}

function sha1(buffer) {
    return createHash('sha1').update(buffer).digest();
}

function sha256(buffer) {
    return createHash('sha256').update(buffer).digest();
}

function hash160(buffer) {
    return ripemd160(sha256(buffer));
}

function hash256(buffer) {
    return sha256(sha256(buffer));
}

function keccak256(buffer) {
    const tmp = new sha3.update(buffer);
    return new Buffer(tmp.digest('hex'), 'hex');
}

module.exports = {
    hash160: hash160,
    hash256: hash256,
    ripemd160: ripemd160,
    sha1: sha1,
    sha256: sha256,
    keccak256: keccak256,
};
