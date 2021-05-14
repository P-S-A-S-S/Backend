const crypto = require('crypto');
const fs = require("fs");

function genkeypair(){
	// The `generateKeyPairSync` method accepts two arguments:
	// 1. The type of keys we want, which in this case is "rsa"
	// 2. An object with the properties of the key
	
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 3072,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
	return [publicKey, privateKey]
}

function encrypt(data,privateKey){
	const encryptedData = crypto.privateEncrypt(
		{
			key: privateKey
		},
		// We convert the data string to a buffer using `Buffer.from`
		Buffer.from(data)
	)
	// The encrypted data is in the form of bytes, so we print it in base64 format
	// so that it's displayed in a more readable form
	console.log("encypted data: ", encryptedData.toString("base64"))
	return encryptedData
}

function decrypt(data,privateKey){
	const buffer = Buffer.from(data, 'base64')
	const decryptedData = crypto.privateDecrypt(
	{
		key: privateKey,
		// In order to decrypt the data, we need to specify the
		// same hashing function and padding scheme that we used to
		// encrypt the data in the previous step
	},
	data
	)
	console.log("decrypted data: ", decryptedData.toString())
}


// The decrypted data is of the Buffer type, which we can convert to a
// string to reveal the original data








//const algorithm = 'aes-256-cbc';
//const crypto = require("crypto")
// use the public and private keys
//const key = crypto.randomBytes(32);
//const iv = crypto.randomBytes(16);
//
//function encrypt(text) {
// let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
// let encrypted = cipher.update(text);
// encrypted = Buffer.concat([encrypted, cipher.final()]);
// return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
//}
//
//function decrypt(text) {
// let iv = Buffer.from(text.iv, 'hex');
// let encryptedText = Buffer.from(text.encryptedData, 'hex');
// let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
// let decrypted = decipher.update(encryptedText);
// decrypted = Buffer.concat([decrypted, decipher.final()]);
// return decrypted.toString();
//}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.genkeypair = genkeypair;
