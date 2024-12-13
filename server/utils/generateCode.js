const crypto = require('crypto');

const generateCode = () => crypto.randomBytes(3).toString('hex').toUpperCase();

module.exports = generateCode; 