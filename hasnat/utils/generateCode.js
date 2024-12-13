
const crypto = require('crypto');

const generateCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

module.exports = generateCode;