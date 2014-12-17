/**
 * The demo application that will allow to showcase the use of IsoGrid
 */
var gridApp = angular.module('gridApp', ['isoGrid']);

/**
 * An example of controller that can be used to manipulate a specific card
 *
 * This broadcasts a layout event and catched the callback when all 
 * animations are completed
 */
gridApp.controller('Work1Controller', ['$scope', '$rootScope', '$timeout',
  function($scope, $rootScope, $timeout) {
    $scope.showingMoreText = false;
    
    $scope.toggleText = function(){
      $scope.showingMoreText = !$scope.showingMoreText;
      // We need to broacast the layout on the next digest once the text
      // is actually shown
      $timeout(function(){
        $rootScope.$broadcast("layout", function(){
          // The layout animations have completed
        });
      });
    }
}]);

/**
 * The main controller that is responsible for created the cards, filters, 
 * rankers
 */
gridApp.controller('GridContainer',
  ['$scope', function ($scope) {

      $scope.filters = null;
      $scope.rankers = null;

      /**
       * Update the filters array based on the given filter
       * $param filter: the name of a tab like 'work'  
       */
      $scope.filter = function(filter){
        $scope.filters = [[['tabs', 'contains', filter]]];
      }

      /**
       * Update the rankers array based on the given ranker
       * $param ranker: the name of a card's property or a custom function 
       */
      $scope.orderBy = function(ranker){
        $scope.rankers = [[ranker, "asc"]];
      }

      /**
       * Delete a given card
       * $param index: the index of the card in the cards array 
       */
      $scope.delete = function(index){
        $scope.cards.splice(index, 1);
      }

      var nbCardsAdded = 0;
      /**
       * The pile of cards to be added
       */
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
      ];

      /**
       * Add a card to the main view
       * Takes a card from the pile of cardsToAdd and prepend it to the list of 
       * cards
       */
      $scope.addItem = function(){
        if(nbCardsAdded < cardsToAdd.length){
          $scope.cards.unshift(cardsToAdd[nbCardsAdded]);
          ++nbCardsAdded;
        }
      }

      /**
       * The list of cards that show initialy
       */
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