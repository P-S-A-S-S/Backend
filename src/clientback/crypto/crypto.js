const crypto = require('crypto');
const fs = require("fs");

function genkeypair(){
	// The `generateKeyPairSync` method accepts two arguments:
	// 1. The type of keys we want, which in this case is "rsa"
	// 2. An object with the properties of the key
	const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
		// The standard secure default length for RSA keys is 2048 bits
		modulusLength: 3072,
	})
	var pkey = publicKey.toString()
	var prikey = privateKey.toString()
	fs.writeFile("public.cert", pkey, (err) => {
	  if (err) console.log(err);
	  console.log("Successfully Written public.");
	});
	fs.writeFile("private.key", prikey, (err) => {
	  if (err) console.log(err);
	  console.log("Successfully Written private.");
	})
}

function encrypt(data){
	const publicKey = fs.readFileSync("public.cert").toString()
	console.log(publicKey)
	const encryptedData = crypto.publicEncrypt(
		{
			key: publicKey,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha512",
		},
		// We convert the data string to a buffer using `Buffer.from`
		Buffer.from(data)
	)
	// The encrypted data is in the form of bytes, so we print it in base64 format
	// so that it's displayed in a more readable form
	console.log("encypted data: ", encryptedData.toString("base64"))
	return encryptedData
}

function decrypt(data){
	const privateKey = fs.readFile("private.key", "utf-8", (err, data) => {
		console.log(data);
	});
	const decryptedData = crypto.privateDecrypt(
	{
		key: privateKey,
		// In order to decrypt the data, we need to specify the
		// same hashing function and padding scheme that we used to
		// encrypt the data in the previous step
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: "sha512",
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
