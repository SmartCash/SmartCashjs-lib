const smartcash = require('smartcashjs-lib');
const Mnemonic = require('bitcore-mnemonic');
const bitcoinjsBip38 = require('bip38');
const TEST_PHRASE = 'grape front option already anxiety mixed public bulb final expose chef traffic';

const NETWORK = {
    messagePrefix: '\x18SmartCash Signed Message:\n',
    bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
    },
    pubKeyHash: 0x3f,
    scriptHash: 0x12,
    wif: 0xbf,
};

const BIP = {
    BIP_32: 'BIP_32',
    BIP_44: 'BIP_44',
};

function getBIP32HDKeyPair({ words, passphrase }) {
    var mnemonic = new Mnemonic(words);
    const seed = mnemonic.toSeed(passphrase);
    return smartcash.HDNode.fromSeedHex(seed, NETWORK);
}

function getDerivationPaths() {
    const purpose = 44;
    const coin = 224;
    const account = 0;
    const change = 0;
    let path = 'm/';
    path += purpose + "'/";
    path += coin + "'/";
    path += account + "'/";
    path += change;
    const BIP44DerivationPath = path;
    const BIP32DerivationPath = 'm/0';

    return {
        BIP44DerivationPath: BIP44DerivationPath,
        BIP32DerivationPath: BIP32DerivationPath,
    };
}

function getBIP32ExtendedKey({ words, passphrase, derivationPath }) {
    let extendedKey = getBIP32HDKeyPair({ words: words, passphrase: passphrase });
    return extendedKey.derivePath(derivationPath);
}

function getAddressesFromDerived({ start = 0, total = 10, extendedKey, derivationPath }) {
    const addresses = [];
    for (var i = 0; i < total; i++) {
        var index = i + start;
        addresses.push(new calcAddressesFromDerived({ index: index, extendedKey: extendedKey, derivationPath: derivationPath }));
    }
    return addresses;
}

function calcAddressesFromDerived({
    index,
    useHardenedAddresses = false,
    useBip38 = false,
    bip38password = '',
    extendedKey,
    derivationPath,
}) {
    // derive HDkey for this row of the table
    var key = 'NA';
    if (useHardenedAddresses) {
        key = extendedKey.deriveHardened(index);
    } else {
        key = extendedKey.derive(index);
    }
    // bip38 requires uncompressed keys
    // see https://github.com/iancoleman/bip39/issues/140#issuecomment-352164035
    var keyPair = key.keyPair;
    var useUncompressed = useBip38;
    if (useUncompressed) {
        keyPair = new smartcash.ECPair(keyPair.d);
    }
    // get address
    var address = keyPair.getAddress().toString();
    // get privkey
    var hasPrivkey = !key.isNeutered();
    var privkey = 'NA';
    if (hasPrivkey) {
        privkey = keyPair.toWIF();
        // BIP38 encode private key if required
        if (useBip38) {
            privkey = bitcoinjsBip38.encrypt(keyPair.d.toBuffer(), false, bip38password, function (p) {
                console.log('Progressed ' + p.percent.toFixed(1) + '% for index ' + index);
            });
        }
    }
    // get pubkey
    var pubkey = keyPair.getPublicKeyBuffer().toString('hex');
    var indexText = derivationPath + '/' + index;
    if (useHardenedAddresses) {
        indexText = indexText + "'";
    }

    console.log(`derivationPath`, { indexText, address, pubkey, privkey });

    return { indexText, address, pubkey, privkey };
}

export function generatePhrase() {
    const mnemonic = new Mnemonic();
    return mnemonic.toString();
}

export function validatePhrase({ words }) {
    return Mnemonic.isValid(words);
}

export function getFromDerivationPaths({ words, passphrase }) {
    const bip44ExtendedKey = getBIP32ExtendedKey({
        words: words,
        passphrase: passphrase,
        derivationPath: getDerivationPaths().BIP44DerivationPath,
    });
    const bip32ExtendedKey = getBIP32ExtendedKey({
        words: words,
        passphrase: passphrase,
        derivationPath: getDerivationPaths().BIP32DerivationPath,
    });
    return {
        BIP_44: {
            bip44ExtendedKey: bip44ExtendedKey,
            xPrivateKey: bip44ExtendedKey.toBase58(),
            xPublicKey: bip44ExtendedKey.neutered().toBase58(),
            addresses: getAddressesFromDerived({
                extendedKey: bip44ExtendedKey,
                derivationPath: getDerivationPaths().BIP44DerivationPath,
            }),
        },
        BIP_32: {
            bip32ExtendedKey: bip32ExtendedKey,
            xPrivateKey: bip32ExtendedKey.toBase58(),
            xPublicKey: bip32ExtendedKey.neutered().toBase58(),
            addresses: getAddressesFromDerived({
                extendedKey: bip32ExtendedKey,
                derivationPath: getDerivationPaths().BIP32DerivationPath,
            }),
        },
    };
}

/*
console.log(generatePhrase());
console.log(validatePhrase({ words: TEST_PHRASE }));
console.log(getBIP32HDKeyPair({ words: TEST_PHRASE }));
console.log(getDerivationPaths());
console.log(getFromDerivationPaths({ words: TEST_PHRASE }));
*/
