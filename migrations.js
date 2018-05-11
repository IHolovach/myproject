var mysql     = require('mysql');
var migration = require('mysql-migrations');

var connection = mysql.createPool({
	connectionLimit: 50,
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'sampledb'
});

migration.init(connection, __dirname + '/migrations');