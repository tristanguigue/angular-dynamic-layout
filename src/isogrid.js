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

  .filter("as", ['$parse', function($parse) {
    return function(value, context, path) {
      return $parse(path).assign(context, value);
    };
  }])

  .directive('img', ['$rootScope', function($rootScope) {
      return {
          restrict: 'E',
          link: function(scope, element, attrs) {
              element.bind('load', function() {
                  $rootScope.$broadcast("layout");
              });
              element.bind('error', function() {
                  $rootScope.$broadcast("layout");
              });

          }
      };
  }])

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
                  ></div>',
        link : function (scope, element, attrs){

          var layout = function(){
            return PositionService.apply(element[0].offsetWidth, scope.filteredItems.length); 
          };

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

          scope.externalScope = function(){
            return scope.$parent;
          };

          scope.$watch('filteredItems', function(newValue, oldValue){
            if(!angular.equals(newValue, oldValue)){
              itemsLoaded().then(function(){
                  layout();
              });      
            }
          }, true);

          angular.element($window).bind("resize",function(e){
              // We need to apply the scope
              scope.$apply(function(){
                layout();
              });
          });

          scope.$on('layout', function(event, callback) {
            $timeout(function(){
              layout().then(function(){
                if(typeof callback === "function")
                  callback();
              });
            });          
          });

          itemsLoaded().then(function(){
            layout();
          });

        }
      };
    }]);

