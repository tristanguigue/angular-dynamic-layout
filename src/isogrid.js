var isoGridModule = angular.module('isoGrid', [])

  .directive('bindHtmlCompile', function($compile, $parse) {
      return {
        restrict: 'A',
        link: function(scope, element, attr) {
          scope.$watch(attr.content, function() {
            element.html($parse(attr.content)(scope));
            $compile(element.contents())(scope);
          }, true);
        }
      }
    })

    .directive('isogrid', ['PositionService', 'FilterService', 'OrderService', '$timeout',
      function (PositionService, FilterService, OrderService, $timeout) {
        return {
          restrict: "E",
          scope: {
            items: '=items',
            rankers: '=rankers',
            filters: '=filters'
          },
          template: '<div id="item-{{it.id}}" class="item" ng-repeat="it in items" bind-html-compile content="it.template"></div>',
          link : function (scope, element, attrs){

            $timeout(function(){
              scope.$watch('items', function(){
                $timeout(function(){
                  PositionService.apply(scope.items); 
                });                 
              }, true);
              
              scope.$watch('filters', function(){
                  FilterService.apply(scope.items, scope.filters);
                  PositionService.apply(scope.items);                  
              });

              scope.$watch('rankers', function(){
                  OrderService.apply(scope.items, scope.rankers);
                  PositionService.apply(scope.items);
              });

            })            
          },
        };
      }]);

