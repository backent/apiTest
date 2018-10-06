var helpers = {};

helpers.createRandomString = function(strLength){
	if(typeof(strLength) == 'number'){
		let exampleChar = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let randomString = '';
		for (var i = 0; i < strLength; i++) {
				randomChar = exampleChar.charAt(Math.floor(Math.random() * exampleChar.length));
				randomString+= randomChar;
			}
		return randomString;
	}
	else
		return false;
};

module.exports = helpers;