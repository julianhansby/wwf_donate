var app = angular.module('wwf', ['ngRoute']);
	
app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			controller:'mainController',
			templateUrl:'../partials/landingpage.html'
		})
		.otherwise({
			redirectTo:'/'
		});
});

app.controller('mainController', function($scope,$http) {

	$scope.data = {}; 
	
	$http.get('../data.json').then(function(response) {
		console.log(response.data);
		$scope.data = response.data.data;
	})

	$scope.filterBy = function(tag){
		alert(tag)
		//if(tag == 'newest'){}
	}


});