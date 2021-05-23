const crypto = require('crypto');
//const spawn = require('child_process').spawn;
const {once} = require('events');

function genkeypair(){
	// The `generateKeyPairSync` method accepts two arguments:
	// 1. The type of keys we want, which in this case is "rsa"
	// 2. An object with the properties of the key
	
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
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
	return encryptedData
}

async function decrypt(data,privateKey){
	const buffer = await Buffer.from(data, 'utf-8')

	const decryptedData = crypto.privateDecrypt(
	{
		key: privateKey,
		// In order to decrypt the data, we need to specify the
		// same hashing function and padding scheme that we used to
		// encrypt the data in the previous step
	},
	buffer)
	//console.log("Ddata: ", decryptedData)
	//console.log("decrypted data: ", decryptedData.toString())
	return decryptedData.toString()
}

const symDecrpyt = async (sym_key, msg, array)=>{
    var spawn = require('child_process').spawn,
        py    = spawn('python3', ['src/clientback/crypto/symDec.py', sym_key, msg]),
        output = '';
		py.stdin.setEncoding = 'utf-8';
		py.stdout.on('data', async (data) => {
			output += await data.toString();
			await array.push(output)
		});
		// Handle error output
		py.stderr.on('data', async (data) => {
		// As said before, convert the Uint8Array to a readable string.
			await console.log('error:' + data);
		});
		py.stdout.on('end', async function(code){
			await console.log('Client: ' + output);
		});
	
		await once(py, 'close')
	
		return array;
}

const symEncrpyt = async (sym_key, msg)=>{
    var spawn = require('child_process').spawn,
        py    = spawn('python3', ['src/clientback/crypto/symEnc.py', sym_key, msg]),
        output = '';
		py.stdin.setEncoding = 'utf-8';
		console.log("Sym_KEYINSIDE: ", sym_key, "MSGINSIDE: ", msg)
		py.stdout.on('data', async (data) => {
			output += await data.toString();
		});
		// Handle error output
		py.stderr.on('data', async (data) => {
		// As said before, convert the Uint8Array to a readable string.
			await console.log('error:' + data);
		});
		py.stdout.on('end', async function(code){
			await console.log('Server to client: ' + output);
		});
	
		await once(py, 'close')
	
		return output;
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
exports.symDecrpyt = symDecrpyt;
exports.symEncrpyt = symEncrpyt;
