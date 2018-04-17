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
		});
		return $rootScope.AllData;
	};

	this.updateInfo = function(index,prop,val){
		$rootScope.AllData[index][prop] = val;
		$window.localStorage.setItem('data',JSON.stringify($rootScope.AllData));	
	}
});

// home page
app.controller('mainController', function($scope,$http,$location,$window,$timeout,$rootScope,dataService) {

	$scope.data = dataService.getAllData();
	$rootScope.page = 'home-page';
	$scope.activeTag = 'newest';
	$scope.activateModal = false;
	$scope.amountInput = {};
	$scope.toggle = [];
	$scope.isDone = false;
	var getCurrContribAmount = 1;

	// activate popup modal to allow user to make donations
	$scope.showPopupModal = function(id){
		$window.scrollTo(0, 0);
		$scope.isDone = false;
		$scope.toggle[id] = !$scope.toggle[id];
	};

	$scope.activateSaveDonation = function($index,inputAmount){

		// update item
		if(typeof inputAmount == "undefined"){ inputAmount = 0 }
		$scope.data[$index - 1].raised += parseInt(inputAmount,10) / parseInt($scope.data[$index - 1].goal,10) * 100;
		dataService.updateInfo($index - 1,'raised',$scope.data[$index - 1].raised);
		getCurrContribAmount += $scope.data[$index - 1].contributors;
		dataService.updateInfo($index - 1,'contributors',getCurrContribAmount++);
		$scope.isDone = true;
		$timeout(function(){
			$scope.closeModal($index);
		},1400);
	}

	$scope.filterBy = function(tag){
		$scope.activeTag = tag;
		if(tag == 'popular'){
			$scope.data = $scope.data.sort(function(a,b){ return b.rating - a.rating })
		} else if(tag == 'enddate') {
			$scope.data = $scope.data.sort(function(a,b){
				a.closingDate = a.closingDate.replace(",","");
				b.closingDate = b.closingDate.replace(",","");
				return new Date(a.closingDate) - new Date(b.closingDate);
			})
		} else {
			$scope.data = $scope.data.sort(function(a,b){ return a.id - b.id })
		}
	}
	$scope.goToDetail = function(id){ $location.url('/'+id) }
	$scope.closeModal = function($index){
		$scope.activateModal = false;
		$scope.toggle[$index] = !$scope.toggle[$index];
	}

	// init 'NEWEST' tab
	$scope.filterBy('newest');

});

// description page
app.controller('detailController', function($scope,$http,$routeParams,$window,$timeout,dataService,$rootScope) {

	$rootScope.page = 'detail-page';
	var getLSData = $rootScope.AllData;
	getThisData = getLSData[$routeParams.id - 1];
	var getAllInfo = getThisData.info;
	$scope.contentDisplay = "Loading content...";
	$scope.activeTag = 'about';
	$scope.id = getThisData.id;
	$scope.title = getThisData.title;
	$scope.goalAmount = getThisData.goal;
	$scope.daysToGo = 0;
	$scope.raised =  $rootScope.AllData[$scope.id - 1].raised > 100 ? 100 : $rootScope.AllData[$scope.id - 1].raised; 
	$scope.contributors = getThisData.contributors;
	$scope.toggle = [];
	var getCurrContribAmount = 1;

	$scope.filterBy = function(tag){
		var slug = getAllInfo[0][tag];
		$scope.activeTag = tag;
		$scope.contentDisplay = slug;
	}

	// activate popup modal to allow user to make donations
	$scope.showPopupModal = function(id){
		$window.scrollTo(0, 0);
		$scope.isDone = false;
		$scope.toggle[id] = !$scope.toggle[id];
	}

	$scope.activateSaveDonation = function($index,inputAmount){
		// update item
		if(typeof inputAmount == "undefined"){ inputAmount = 0 }
		$rootScope.AllData[$scope.id - 1].raised += parseInt(inputAmount,10) / parseInt($rootScope.AllData[$scope.id - 1].goal,10) * 100;
		dataService.updateInfo($scope.id - 1,'raised',$rootScope.AllData[$scope.id - 1].raised);
		getCurrContribAmount += $rootScope.AllData[$scope.id - 1].contributors;
		dataService.updateInfo($scope.id - 1,'contributors',getCurrContribAmount++);
		$scope.isDone = true;
		$timeout(function(){
			$scope.closeModal($scope.id);
			$scope.raised = $rootScope.AllData[$scope.id - 1].raised > 100 ? 100 : $rootScope.AllData[$scope.id - 1].raised;
			$scope.contributors = $rootScope.AllData[$scope.id - 1].contributors;
		},1400);
	}

	$scope.closeModal = function($index){
		$scope.activateModal = false;
		$scope.toggle[$index] = !$scope.toggle[$index];
	}	

	// init 'ABOUT' tab
	$scope.filterBy('about');
});