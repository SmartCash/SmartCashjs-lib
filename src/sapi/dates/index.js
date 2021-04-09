exports.getUTCNow = () => new Date(new Date().toUTCString()).toISOString();
