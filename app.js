var express        = require('express');
var mysql          = require('mysql');
var app            = express();
var morgan         = require('morgan');  
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cryptoJS       = require("crypto-js");

var connection = mysql.createPool({
	connectionLimit: 50,
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'sampledb'
});

var GLOB_LOG_STATUS = 0;
var GLOB_LOG_USERNAME = '';

app.use(express.static(__dirname + '/public'));
app.use('/', express.static(__dirname + '/public'));
app.use('*', express.static(__dirname + '/public'));                
app.use(morgan('dev'));                                         
app.use(bodyParser.urlencoded({'extended':'true'}));            
app.use(bodyParser.json());                                     
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(methodOverride());

app.get('/login', function (req, res) {
	if(GLOB_LOG_STATUS){
		res.redirect('/dashboard');
	}
});

app.get('/dashboard', function (req, res) {
	if(GLOB_LOG_STATUS == 0){
		res.redirect('/login');
	} else{
		console.log('You are already here');
	}
});

app.post('/loginsys', function(req, resp){
	var username = req.body.username;
	var password = req.body.password;
	var db_data;

	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		} else {
			console.log('Connected!');

			tempCont.query("SELECT * FROM users WHERE username='"+username+"'", function(error, rows, fields){
				tempCont.release();
				if(!!error){
					console.log('Error in the query');
				} else{
					db_data  = rows;
					if(db_data.length === 0){
						var data = {};
						data.status = 'nosuchuser';
						resp.json(data);
						resp.end();
					} else {
						var user_id        = db_data['0']['id'];
						var user_group_id  = db_data['0']['user_group_id'];
						var pass           = db_data['0']['pass'];
						var salt           = db_data['0']['salt'];
						username           = db_data['0']['username'];
	
						var checkPass = cryptoJS.MD5(password).toString()
						checkPass += salt;
	
						if(checkPass === pass){
							var data = {};
							GLOB_LOG_STATUS    = true;
							GLOB_LOG_USERNAME  = username;
							data.status        = 'loggedin';
							data.user          = username;
							data.user_id       = user_id;
							data.user_group_id = user_group_id;
							console.log(GLOB_LOG_STATUS);
							resp.json(data);
							resp.end();
						} else{
							var data = {};
							data.status = 'loggedinfailed';
							resp.json(data);
							resp.end();
						}
					}
				}
			});
		}
	});
});

app.post('/registersys', function(req, resp){
	var username = req.body.username;
	var password = req.body.password;
	var db_data;

	var uCredentials = createPassSalt(password);

	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		} else {
			console.log('Connected!');

			tempCont.query("INSERT INTO users VALUES (NULL, '"+username+"', '2', '"+uCredentials.password+"', '"+uCredentials.salt+"') ", function(error, rows, fields){
				tempCont.release();
				if(!!error){
					console.log('Error in the query');
				} else{
					db_data  = rows;
					console.log(db_data.insertId);
					console.log(username+' was registered');

					var data = {};
					data.username = username;
					data.user_id  = db_data.insertId;
					data.status   = 'userregistered';
					resp.json(data);
					resp.end();
				}
			});
		}
	});
});

app.post('/logoutsys', function(req, resp){
	var user_status = req.body.user_status;

	if(user_status == 0){
		GLOB_LOG_STATUS = false;
		GLOB_LOG_USERNAME = '';
		console.log(GLOB_LOG_STATUS);
	}
});

app.get('*', function(req, res){
	res.sendFile( __dirname + "/public/components/" + "notfound.html" );
});

function createPassSalt(pass){
	var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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

app.listen(1337);

