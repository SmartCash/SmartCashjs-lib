var script = require('./script');

var templates = require('./templates');
for (var key in templates) {
    script[key] = templates[key];
}

function amount(amount, fee = '0') {
    fee = parseInt((parseFloat(fee) * 1000000000) / 10, 10);
    amount = parseInt((parseFloat(amount) * 1000000000) / 10, 10);
    return amount - fee;
}

module.exports = {
    bufferutils: require('./bufferutils'),

    Block: require('./block'),
    ECPair: require('./ecpair'),
    ECSignature: require('./ecsignature'),
    HDNode: require('./hdnode'),
    Transaction: require('./transaction'),
    TransactionBuilder: require('./transaction_builder'),

    address: require('./address'),
    crypto: require('./crypto'),
    networks: require('./networks'),
    opcodes: require('bitcoin-ops'),
    script: script,
    amount: amount,
};
