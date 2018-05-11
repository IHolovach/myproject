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

app.use(express.static(__dirname + '/public'));                
app.use(morgan('dev'));                                         
app.use(bodyParser.urlencoded({'extended':'true'}));            
app.use(bodyParser.json());                                     
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(methodOverride());

app.get('*', function(req, res){
  res.sendFile( __dirname + "/public/components/" + "notfound.html" );
});

app.get('/', function(req, resp){
	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		} else {
			console.log('Connected!');

			tempCont.query("SELECT * FROM users", function(error, rows, fields){
				tempCont.release();
				if(!!error){
					console.log('Error in the query');
				} else{
					console.log('Successful query\n');
					resp.json(rows);
				}
			});
		}
	});
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
							data.status        = 'loggedin';
							data.user          = username;
							data.user_id       = user_id;
							data.user_group_id = user_group_id;
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

app.get('/logoutsys', function(req, resp){
	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		} else {
			console.log('Connected!');

			tempCont.query("SELECT * FROM users", function(error, rows, fields){
				tempCont.release();
				//callback
				if(!!error){
					console.log('Error in the query');
				} else{
					console.log('Successful query\n');
					resp.json(rows);
				}
			});
		}
	});
});

app.listen(1337);
