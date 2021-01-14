const crypto = require('crypto');

var SecurityService = {

    encrypt: function (plaindMessage) {
        let encryptionMethod = 'AES-256-CBC';
        let secret = "mcXUpsjDD39IYnrMf64P3CtlxkdHfSn5";
        let iv = secret.substr(0, 16)
        var encryptor = crypto.createCipheriv(encryptionMethod, secret, iv);
        return encryptor.update(plaindMessage, 'utf8', 'base64') + encryptor.final('base64');
      },
      
    decrypt: function (encryptedMessage) {
        let encryptionMethod = 'AES-256-CBC';
        let secret = "mcXUpsjDD39IYnrMf64P3CtlxkdHfSn5";
        let iv = secret.substr(0, 16)
        let decryptor = crypto.createDecipheriv(encryptionMethod, secret, iv);
        return decryptor.update(encryptedMessage, 'base64', 'utf8') + decryptor.final('utf8');
      }

}

module.exports = SecurityService
