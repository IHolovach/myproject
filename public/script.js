var app = angular.module('main', ['ngRoute']);

app.config(function($routeProvider, $locationProvider){
	//$locationProvider.hashPrefix('');
	//$routeProvider.eagerInstantiationEnabled(false);
	$locationProvider.html5Mode(true);
	$routeProvider.when('/', {
		templateUrl: './components/home.html',
		controller: 'homeCtrl'
	}).when('/login', {
		templateUrl: './components/login.html',
		controller: 'loginCtrl'
	}).when('/register', {
		templateUrl: './components/register.html',
		controller: 'registerCtrl'
	}).when('/dashboard', {
		resolve: {		
			check: function($location, user){
				if(!user.isUserLoggedIn()){
					$location.path('/login');
				}
			}
		},
		templateUrl: './components/dashboard.html',
		controller: 'dashboardCtrl'
	}).when('/admin/dashboard', {
		templateUrl: './components/admindashboard.html',
		controller: 'admindashboardCtrl'
	}).when('/notfound', {
		templateUrl: './components/notfound.html',
		controller: 'notfoundCtrl'
	}).otherwise({
     	templateUrl: './components/notfound.html',
		controller: 'notfoundCtrl'
  	});

});

app.service('user', function(){
	var username;
	var user_id;
	var loggedin = false;
	this.setName = function(name){
		username = name;
	};
	this.getName = function(){
		return username;
	};
	this.setUserId = function(id){
		user_id = id;
	};
	this.getUserId = function(){
		return user_id;
	};
	this.isUserLoggedIn = function(){
		return loggedin;
	};
	this.userLoggedIn = function(){
		loggedin = true;
	};
	this.userLoggedOut = function(){
		loggedin = false;
	}
})

app.controller('homeCtrl', function($scope, $location){
	$scope.goToLogin = function(){
		$location.path('/login');
	};
	$scope.goToRegister = function(){
		$location.path('/register');
	};	
});

app.controller('loginCtrl', function($scope, $http, $location, $window, user){
	$scope.login = function(){
		var username = $scope.username;
		var password = $scope.password;
		if(!username){
			alert('Please provide form with username'); // there can be any validation code
		} else if(!password){
			alert('Please provide form with password'); // there can be any validation code
		} else {
			var postdata = {username: username, password: password};
			$http({
				url: '/loginsys',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				data: JSON.stringify(postdata)
			}).then(function(response){
				if(response.data.status == 'loggedin'){
					user.userLoggedIn();
					user.setName(response.data.user); 
					user.setUserId(response.data.user_id);
					var user_group_id = response.data.user_group_id;
					if(user_group_id == 1){
						console.log(response);
						$location.path('/admin/dashboard');
					} else{
						console.log(response);
						$location.path('/dashboard');
					}
					
				} else if(response.data.status == 'nosuchuser') {
					alert('Login failed\nUser doesn\'t exist');
				} else {
					alert('Login failed\nWrong password');
				}
			});
		}
	};
	$scope.goToRegister = function(){
		$location.path('/register');
	};
});

app.controller('registerCtrl', function($scope, $http, $location, $window, user){
	$scope.register = function(){
		var username = $scope.username;
		var password = $scope.password;
		if(!username){
			alert('Please provide form with username'); // there can be any validation code
		} else if(!password){
			alert('Please provide form with password'); // there can be any validation code
		} else {
			var postdata = {username: username, password: password};
			$http({
				url: '/registersys',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				data: JSON.stringify(postdata)
			}).then(function(response){
				if(response.data.status == 'userregistered'){
					user.userLoggedIn();
					user.setName(response.data.user); 
					user.setUserId(response.data.user_id);
					var user_group_id = response.data.user_group_id;
					console.log(response);
					$location.path('/dashboard');				
				} else {
					alert('Register failed\nSomething went wrong');
				}
			});
		}
	};
	$scope.goToLogin = function(){
		$location.path('/login');
	};
});

app.controller('dashboardCtrl', function($scope, $http, $location, user){
	$scope.user    = user.getName();
	$scope.user_id = user.getUserId();
	$scope.logout = function(){
		var username = $scope.user_id;
		user.userLoggedOut();
		var postdata = {user_status: 0};
			$http({
				url: '/logoutsys',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				data: JSON.stringify(postdata)
			});

		$location.path('/login');
	};
});


app.controller('admindashboardCtrl', function($scope, $http, $location, user){
	$scope.user    = user.getName();
	$scope.user_id = user.getUserId();
	$scope.logout = function(){
		var username = $scope.user_id;
		user.userLoggedOut();
		$location.path('/login');
	};
});