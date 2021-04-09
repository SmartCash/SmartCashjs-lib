const bip66 = require('bip66');
const typeforce = require('typeforce');
const BigInteger = require('bigi');
const types = require('./types');

function ECSignature(r, s) {
    typeforce(types.tuple(types.BigInt, types.BigInt), arguments);

    this.r = r;
    this.s = s;
}

ECSignature.parseCompact = function (buffer) {
    typeforce(types.BufferN(65), buffer);

    const flagByte = buffer.readUInt8(0) - 27;
    if (flagByte !== (flagByte & 7)) throw new Error('Invalid signature parameter');

    const compressed = !!(flagByte & 4);
    const recoveryParam = flagByte & 3;
    const signature = ECSignature.fromRSBuffer(buffer.slice(1));

    return {
        compressed: compressed,
        i: recoveryParam,
        signature: signature,
    };
};

ECSignature.fromRSBuffer = function (buffer) {
    typeforce(types.BufferN(64), buffer);

    const r = BigInteger.fromBuffer(buffer.slice(0, 32));
    const s = BigInteger.fromBuffer(buffer.slice(32, 64));
    return new ECSignature(r, s);
};

ECSignature.fromDER = function (buffer) {
    const decode = bip66.decode(buffer);
    const r = BigInteger.fromDERInteger(decode.r);
    const s = BigInteger.fromDERInteger(decode.s);

    return new ECSignature(r, s);
};

// BIP62: 1 byte hashType flag (only 0x01, 0x02, 0x03, 0x81, 0x82 and 0x83 are allowed)
ECSignature.parseScriptSignature = function (buffer) {
    const hashType = buffer.readUInt8(buffer.length - 1);
    const hashTypeMod = hashType & ~0x80;

    if (hashTypeMod <= 0x00 || hashTypeMod >= 0x04) throw new Error(`Invalid hashType ${hashType}`);

    return {
        signature: ECSignature.fromDER(buffer.slice(0, -1)),
        hashType: hashType,
    };
};

ECSignature.prototype.toCompact = function (i, compressed) {
    if (compressed) {
        i += 4;
    }

    i += 27;

    const buffer = Buffer.alloc(65);
    buffer.writeUInt8(i, 0);
    this.toRSBuffer(buffer, 1);
    return buffer;
};

ECSignature.prototype.toDER = function () {
    const r = Buffer.from(this.r.toDERInteger());
    const s = Buffer.from(this.s.toDERInteger());

    return bip66.encode(r, s);
};

ECSignature.prototype.toRSBuffer = function (buffer, offset) {
    buffer = buffer || Buffer.alloc(64);
    this.r.toBuffer(32).copy(buffer, offset);
    this.s.toBuffer(32).copy(buffer, offset + 32);
    return buffer;
};

ECSignature.prototype.toScriptSignature = function (hashType) {
    const hashTypeMod = hashType & ~0x80;
    if (hashTypeMod <= 0 || hashTypeMod >= 4) throw new Error(`Invalid hashType ${hashType}`);

    const hashTypeBuffer = Buffer.alloc(1);
    hashTypeBuffer.writeUInt8(hashType, 0);

    return Buffer.concat([this.toDER(), hashTypeBuffer]);
};

module.exports = ECSignature;
