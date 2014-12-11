var isoGridModule = angular.module('isoGrid', ['ngAnimate'])

    .filter('customFilter', ['FilterService', function(FilterService) {
        return function( items, filters) {
          if(filters)
            return FilterService.apply(items, filters);
          else
            return items;
        };
    }])

    .filter('customRanker', ['OrderService', function(OrderService) {
        return function( items, rankers) {
          if(rankers){
            return OrderService.apply(items, rankers);
          }else{
            return items;
          }
            
        };
    }])

    .filter("as", function($parse) {
      return function(value, context, path) {
        return $parse(path).assign(context, value);
      };
    })

    .directive('isogrid', ['PositionService', '$timeout', '$window', '$q', '$animate',
      function (PositionService, $timeout, $window, $q, $animate) {

        return {
          restrict: "A",
          scope: {
            items: '=items',
            rankers: '=rankers',
            filters: '=filters'
          },
          template: '<div \
                          class="isogrid-item-parent" \
                          ng-repeat="it in items | customFilter: filters | customRanker:rankers | as:this:\'filteredItems\'" \
                          ng-include="it.template" \
                          id="isogrid-{{$index}}" \
                    ></div>',
          link : function (scope, element, attrs){

            var itemsLoaded = function(){
              var def = $q.defer();
              $timeout(function(){
                if(scope.toLoad === 0)
                  def.resolve();                   
              });
              scope.$watch('toLoad', function(newValue, oldValue){
                if(newValue !== oldValue && scope.toLoad === 0)
                  def.resolve();   
              });
              return def.promise;
            };
            scope.toLoad = 0;
            scope.$on("$includeContentRequested", function(){
              scope.toLoad++;
            });
            scope.$on("$includeContentLoaded", function(){
              scope.toLoad--;
            });

            scope.$watch('filteredItems', function(newValue, oldValue){
              if(!angular.equals(newValue, oldValue)){
                itemsLoaded().then(function(){
                    PositionService.apply(element[0].offsetWidth, scope.filteredItems); 
                });      
              }
            }, true);

            var win = angular.element($window);
            win.bind("resize",function(e){
                scope.$apply(function(){
                  PositionService.apply(element[0].offsetWidth, scope.filteredItems);
                });
            });

            scope.externalScope = function(){
              return scope.$parent;
            };

            scope.$on('layout', function() {
              $timeout(function(){
                PositionService.apply(element[0].offsetWidth, scope.filteredItems); 
              });          
            });

            itemsLoaded().then(function(){
              PositionService.apply(element[0].offsetWidth, scope.filteredItems); 
            });
            


          }
        };
      }]);

