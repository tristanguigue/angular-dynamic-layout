var gridApp = angular.module('gridApp', ['isoGrid'])

gridApp.controller('GridContainer',
  ['$scope',
     function ($scope) {

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

      $scope.addItem = function(){
        var card =  {
          id : 24,
          template : "<div>Work 24 <span ng-click='$parent.$parent.delete($index)'>X</span></div>",
          width : 1,
          tabs : ["home", "work"]
        };

        $scope.cards.push(card);
      }

      $scope.moreText = function(index){
        $scope.cards[index].template = "<div>A very long dive with a lot of text that talks about many different "
                          + "things and that will "
                          + "let me illustrate how an item expands and how other items rearrange around it. "
                          + "Thank you for reading this very interesting text. " 
                          + "<span ng-click='$parent.$parent.delete($index)'>X</span>"
                          + "</div>";
      }

      $scope.cards = [
        {
          id : 4,
          template : "<div>Work 4 "
                     +"    <span ng-click='$parent.$parent.moreText($index)'>More</span>"
                     +"    <span ng-click='$parent.$parent.delete($index)'>X</span>"
                     +"</div>",
          width : 1,
          tabs : ["home", "work"]
        },
        {
          id : 1,
          template : "<div>Home 1<p> This was Heelo 1!</p><span ng-click='$parent.$parent.delete($index)'>X</span></div>",
          width : 1,
          tabs : ["home"]
        },
        {
          id : 3,
          template : "<div>Home 2</p><span ng-click='$parent.$parent.delete($index)'>X</span></div>",
          width : 2,
          tabs : ["home"]
        },
        {
          id : 8,
          template : "<div>Education 5</p><span ng-click='$parent.$parent.delete($index)'>X</span></div>",
          width : 1,
          tabs : ["home", "education"]
        },
        {
          id : 9,
          template : "<div>Work 6</p><span ng-click='$parent.$parent.delete($index)'>X</span></div>",
          width : 1,
          tabs : ["home", "work"]
        }

      ];
    }
    ]
   );