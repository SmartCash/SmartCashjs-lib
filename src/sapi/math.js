const _ = require('lodash');
const NP = require('./number-precision');

const SATOSHI = 10000000;

const toSatoshi = (amount) => _.multiply(amount, SATOSHI);
const fromSatoshi = (amount) => _.divide(amount, SATOSHI);

exports.sumEntries = (collection) => {
    return fromSatoshi(
        _.sumBy(collection, function (entry) {
            const sAmount = toSatoshi(entry.amount);
            return NP.strip(sAmount);
        })
    );
};

exports.sumFloats = (collection) => {
    return fromSatoshi(
        _.sumBy(collection, function (item) {
            const sAmount = toSatoshi(item);
            return NP.strip(sAmount);
        })
    );
};

exports.sumFloatsValues = (amount1, amount2) => {
    return fromSatoshi(toSatoshi(amount1) + toSatoshi(amount2));
};

exports.subtractFloats = (amount1, amount2) => {
    return fromSatoshi(toSatoshi(amount1) - toSatoshi(amount2));
};

exports.max = (collection) => {
    return fromSatoshi(
        _.max(collection, function (entry) {
            return toSatoshi(entry);
            // return NP.strip(sAmount);
        })
    );
};

exports.min = (collection) => {
    return fromSatoshi(
        _.min(collection, function (entry) {
            return toSatoshi(entry);
            // return NP.strip(sAmount);
        })
    );
};

exports.exceeds = (amount1, amount2) => {
    return toSatoshi(amount1) > toSatoshi(amount2);
}
