var isoGridModule = angular.module('isoGrid', ['ngAnimate'])

  /**
  * The filter to be applied on the ng-repeat directive
  */
  .filter('customFilter', ['FilterService', function(FilterService) {
      return function( items, filters) {
        if(filters)
          return FilterService.apply(items, filters);
        else
          return items;
      };
  }])

  /**
  * The ranker to be applied on the ng-repeat directive
  */
  .filter('customRanker', ['OrderService', function(OrderService) {
      return function( items, rankers) {
        if(rankers){
          return OrderService.apply(items, rankers);
        }else{
          return items;
        }
          
      };
  }])

  /**
  * This allowed the result of the filters to be assigned to the scope
  */
  .filter("as", ['$parse', function($parse) {
    return function(value, context, path) {
      return $parse(path).assign(context, value);
    };
  }])

  /**
  * Directive on images to layout after each load
  * TODO: make it specific to images within the isotope container
  */
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

  /**
  * The isotope directive that renders the templates based on the array of items
  * passed
  * @scope items: the list of items to be rendered
  * @scope rankers: the rankers to be applied on the list of items 
  * @scope filters: the filters to be applied on the list of items 
  */
  .directive('isogrid',
    ['PositionService', '$timeout', '$window', '$q', '$animate',
    function (PositionService, $timeout, $window, $q, $animate) {

      return {
        restrict: "A",
        scope: {
          items: '=items',
          rankers: '=rankers',
          filters: '=filters'
        },
        template: '<div                                     \
                      class="isogrid-item-parent"           \
                      ng-repeat="it in items |              \
                                 customFilter: filters |    \
                                 customRanker:rankers |     \
                                 as:this:\'filteredItems\'" \
                      ng-include="it.template"              \
                  ></div>',
        link : function (scope, element, attrs){
          /**
          * Use the PositionService to layout the items
          */
          var layout = function(){
            return PositionService.apply(element[0].offsetWidth); 
          };

          /**
          * Check when all the items have been loaded by the ng-include 
          * directive
          */
          var itemsLoaded = function(){
            var def = $q.defer();

            // $timeout : We need to wait for the includeContentRequested to be called
            // before we can assume there is no templates to be loaded
            $timeout(function(){
              if(scope.templatesToLoad === 0)
                def.resolve();                   
            });

            scope.$watch('templatesToLoad', function(newValue, oldValue){
              if(newValue !== oldValue && scope.templatesToLoad === 0)
                def.resolve();   
            });

            return def.promise;
          };

          scope.templatesToLoad = 0;

          scope.$on("$includeContentRequested", function(){
            scope.templatesToLoad++;
          });
          scope.$on("$includeContentLoaded", function(){
            scope.templatesToLoad--;
          });

          /**
          * This allows the external scope, that is the scope of isogrid's
          * container to be  called from the templates
          */
          scope.externalScope = function(){
            return scope.$parent;
          };

          /**
          * Triggers a layout every time the items are changed
          */
          scope.$watch('filteredItems', function(newValue, oldValue){
            if(!angular.equals(newValue, oldValue)){
              itemsLoaded().then(function(){
                  layout();
              });      
            }
          }, true);

          /**
          * Triggers a layout every time the window is resized
          */
          angular.element($window).bind("resize",function(e){
              // We need to apply the scope 
              scope.$apply(function(){
                layout();
              });
          });

          /**
          * Triggers a layout whenever requested by an external source
          * Allows a callback to be fired after the layout animation is 
          * completed
          */
          scope.$on('layout', function(event, callback) {
            layout().then(function(){
              if(typeof callback === "function")
                callback();
            });
          });

          /**
          * Triggers the initial layout once all the templates are loaded
          */
          itemsLoaded().then(function(){
            layout();
          });

        }
      };
    }]);

