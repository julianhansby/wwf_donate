var app = angular.module('wwf', ['ngRoute']);

// all routes
app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {

	$routeProvider
		.when('/', {
			controller:'mainController',
			templateUrl:'../partials/landingpage.html',
		})
		.when('/:id', {
			controller:'detailController',
			templateUrl:'../partials/detailpage.html'
		})		
		.otherwise({
			redirectTo:'/'
		});

		// enable html5Mode for pushstate ('#'-less URLs)
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');		
}]);

app.service('dataService', function($http,$rootScope,$window){

	$rootScope.AllData = [];

	this.getAllData = function(){
		$http.get('../data.json').then(function(response) {
			$rootScope.AllData = response.data.data;
			// cache the data for detail view
			$window.localStorage.setItem('data',JSON.stringify($rootScope.AllData));
			//alert("yo DATA SERVICE!! :)");
		});
		return $rootScope.AllData;
	};

	this.updateInfo = function(index,prop,val){
		$rootScope.AllData[index][prop] = val;
		$window.localStorage.setItem('data',JSON.stringify($rootScope.AllData));
		console.log($rootScope.AllData);	
	}
});

app.service('donationService', function($window,$rootScope) {

	this.updateContributor = function(id,amount){
		var getLSData = $window.localStorage.getItem('data');
		console.log("get LS data from donationService");
		console.log(getLSData);
	}
});

// home page
app.controller('mainController', function($scope,$http,$location,$window,$timeout,$rootScope,donationService,dataService) {

	$scope.data = dataService.getAllData();
	$rootScope.page = 'home-page';
	$scope.activeTag = 'newest';
	$scope.activateModal = false;
	$scope.amountInput = {};
	$scope.toggle = [];
	$scope.isDone = false;


	// activate popup modal to allow user to make donations
	$scope.showPopupModal = function(id){
		$window.scrollTo(0, 0);
		$scope.isDone = false;
		$scope.toggle[id] = !$scope.toggle[id];
	};

	$scope.activateSaveDonation = function($index,inputAmount){

		alert($index)
		// update item
		if(typeof inputAmount == "undefined"){ inputAmount = 0 }
		$scope.data[$index - 1].raised = parseInt(inputAmount,10) / parseInt($scope.data[$index - 1].goal,10) * 100;
		dataService.updateInfo($index - 1,'raised',$scope.data[$index - 1].raised.toFixed(2));
		dataService.updateInfo($index - 1,'contributors',$scope.data[$index - 1].contributors + 1);
		$scope.isDone = true;
		$timeout(function(){
			$scope.closeModal($index);
		},1400);
	}

	$scope.filterBy = function(tag){ $scope.activeTag = tag }
	$scope.goToDetail = function(id){ $location.url('/'+id) }
	$scope.closeModal = function($index){
		$scope.activateModal = false;
		$scope.toggle[$index] = !$scope.toggle[$index];
	}

	// init 'NEWEST' tab
	$scope.filterBy('newest');

});

// description page
app.controller('detailController', function($scope,$http,$routeParams,$window,donationService,$rootScope) {

	$rootScope.page = 'detail-page';

	var getLSData = JSON.parse($window.localStorage.getItem('data'));	
	getThisData = getLSData[$routeParams.id - 1];
	console.log(getThisData);
	var getAllInfo = getThisData.info;
	$scope.contentDisplay = "Loading content...";
	$scope.activeTag = 'about';
	$scope.id = getThisData.id;
	$scope.title = getThisData.title;
	$scope.goalAmount = getThisData.goal;
	$scope.daysToGo = 0;
	$scope.raised = getThisData.raised > 100 ? 100 : getThisData.raised; 

	$scope.contributors = getThisData.contributors;
	

	$scope.filterBy = function(tag){
		var slug = getAllInfo[0][tag];
		$scope.activeTag = tag;
		$scope.contentDisplay = slug;
	}

	// activate popup modal to allow user to make donations
	$scope.donate = function(){
	}

	// init 'ABOUT' tab
	$scope.filterBy('about');
});