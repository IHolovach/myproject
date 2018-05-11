var mysql     = require('mysql');
var cryptoJS  = require("crypto-js");

var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var userPass  = createPassSalt('111111', possible);
var adminPass = createPassSalt('222222', possible);

module.exports = { 
    "up" :  function (connection) {
    	var connection = mysql.createPool({
			connectionLimit: 50,
			host: 'localhost',
			user: 'root',
			password: '',
			database: 'sampledb'
		});
    	connection.query ("CREATE DATABASE IF NOT EXISTS sampledb", function (err, res) {
	    });
	    connection.query ("CREATE TABLE IF NOT EXISTS 'users' (id INT(11) NOT NULL AUTO_INCREMENT, username VARCHAR(255) NOT NULL, user_group_id INT(11) NOT NULL, pass VARCHAR(255) NOT NULL, salt CHAR(3) NOT NULL, PRIMARY KEY (id) ) ENGINE = InnoDB", function (err, res) {
	    });
	    connection.query ("INSERT INTO users VALUES (NULL, 'User01', '2', '"+userPass.password+"', '"+userPass.salt+"')", function (err, res) {
	    });
	    connection.query ("INSERT INTO users VALUES (NULL, 'Admin01', '1', '"+adminPass.password+"', '"+adminPass.salt+"')", function (err, res) {
	    });
	},
    "down": "DROP TABLE users"
}

function createPassSalt(pass, symbols){
	var salt = "";
	for (var i = 0; i < 3; i++)
	  salt += symbols.charAt(Math.floor(Math.random() * symbols.length));

	var password = cryptoJS.MD5(pass).toString();
	password += salt;
	return {
		"password": password,
		"salt"    : salt
	};
}