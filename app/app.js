var gridApp = angular.module('gridApp', ['isoGrid'])

gridApp.controller('Work1Controller', ['$scope', '$rootScope', '$timeout',
  function($scope, $rootScope, $timeout) {
    $scope.showingMoreText = false;
    
    $scope.$watch("showingMoreText", function(newValue, oldValue){
      if(newValue !== oldValue){
        $timeout(function(){
          $rootScope.$broadcast("layout", function(){
            console.log("Layout is done")
          });
        });
      }
    })

}]);

gridApp.controller('GridContainer',
  ['$scope', '$controller', function ($scope, $controller) {

      $scope.filters = null;
      $scope.rankers = null;

      $scope.filter = function(filter){
        $scope.filters = [[['tabs', 'contains', filter]]];
      }

      $scope.orderBy = function(ranker){
        $scope.rankers = [[ranker, "asc"]];
      }

      $scope.delete = function(index){
        $scope.cards.splice(index, 1);
      }

      var addingCard = 0;
      var cardsToAdd =  [
          {
            template : "app/partials/work3.html",
            tabs : ["home", "work"],
            added : 1474871272105,
          },
          {
            template : "app/partials/work4.html",
            tabs : ["home", "work"],
            added : 1467871272105,
          },
      ]

      $scope.addItem = function(){
        if(addingCard<cardsToAdd.length){
          $scope.cards.unshift(cardsToAdd[addingCard]);
          ++addingCard;
        }
      }

      $scope.cards = [
        {
          template : "app/partials/work1.html",
          tabs : ["home", "work"],
          data : {
            "position" : "Web Developer",
            "company" : "Hacker Inc."
          },
          added : 1414871272105,
        },
        {
          template : "app/partials/work1.html",
          tabs : ["home", "work"],
          data : {
            "position" : "Data Scientist",
            "company" : "Big Data Inc."
          },
          added : 1423871272105,
        },
        {
          template : "app/partials/aboutMe.html",
          tabs : ["home", "education"],
          added : 1454871272105
        },
        {
          template : "app/partials/businessCard.html",
          tabs : ["home"],
          added : 1434871272105
        },
        {
          template : "app/partials/home.html",
          tabs : ["home"],
          added : 1484871272105
        },
        {
          template : "app/partials/education.html",
          tabs : ["home", "education"],
          added : 1484871272105
        },
        {
          template : "app/partials/work2.html",
          tabs : ["home", "work"],
          added : 1434871272105
        }
      ];
}]);