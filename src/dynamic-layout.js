var dynamicLayoutModule = angular.module('dynamicLayout', ['ngAnimate'])

  /**
  * The filter to be applied on the ng-repeat directive
  */
  .filter('customFilter', ['FilterService', function(FilterService) {

    "use strict";

    return function( items, filters) {
      if(filters){
        return FilterService.applyFilters(items, filters);
      }
      else{
        return items;
      }
    };
  }])

  /**
  * The ranker to be applied on the ng-repeat directive
  */
  .filter('customRanker', ['RankerService', function(RankerService) {

    "use strict";

    return function( items, rankers) {
      if(rankers){
        return RankerService.applyRankers(items, rankers);
      }else{
        return items;
      }

    };
  }])

  /**
  * This allowed the result of the filters to be assigned to the scope
  */
  .filter("as", ['$parse', function($parse) {

    "use strict";

    return function(value, context, path) {
      return $parse(path).assign(context, value);
    };
  }])

  /**
  * Directive on images to layout after each load
  */
  .directive('layoutOnLoad', ['$rootScope', function($rootScope) {

    "use strict";

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          element.bind('load error', function() {
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
  * @scope defaulttemplate: (optional) the deafult template to be applied on each item if no item template is defined
  */
  .directive('dynamicLayout',
    ['$timeout', '$window', '$q', '$animate','PositionService',
    function ($timeout, $window, $q, $animate, PositionService) {

      "use strict";

      return {
        restrict: "A",
        scope: {
          items: '=items',
          rankers: '=rankers',
          filters: '=filters',
          defaulttemplate: '=?defaulttemplate'
        },
        template: '<div                                     \
                      class="dynamic-layout-item-parent"           \
                      ng-repeat="it in items |              \
                                 customFilter: filters |    \
                                 customRanker:rankers |     \
                                 as:this:\'filteredItems\'" \
                      ng-include="it.template || defaulttemplate" \
                  ></div>',
        link : function (scope, element, attrs){
          // Keep count of the number of templates left to load
          scope.templatesToLoad = 0;

          /**
          * Use the PositionService to layout the items
          * @return the promise of the cards being animated
          */
          var layout = function(){
            return PositionService.layout(element[0].offsetWidth);
          };

          /**
          * Check when all the items have been loaded by the ng-include
          * directive
          */
          var itemsLoaded = function(){
            var def = $q.defer();

            // $timeout : We need to wait for the includeContentRequested to
            // be called before we can assume there is no templates to be loaded
            $timeout(function(){
              if(scope.templatesToLoad === 0)
                def.resolve();
            });

            scope.$watch('templatesToLoad', function(newValue, oldValue){
              if(newValue !== oldValue && scope.templatesToLoad === 0){
                def.resolve();
              }
            });

            return def.promise;
          };

          // Fires when a template is requested through the ng-include directive
          scope.$on("$includeContentRequested", function(){
            scope.templatesToLoad++;
          });
          // Fires when a template has been loaded through the ng-include
          // directive
          scope.$on("$includeContentLoaded", function(){
            scope.templatesToLoad--;
          });

          /**
          * This allows the external scope, that is the scope of
          * dynamic-layout's container to be  called from the templates
          * @return the given scope
          */
          scope.externalScope = function(){
            return scope.$parent;
          };

          /**
          * Triggers a layout every time the items are changed
          */
          scope.$watch('filteredItems', function(newValue, oldValue){
            // We want the filteredItems to be available to the controller
            // This feels hacky, there must be a better way to do this
            scope.$parent.filteredItems = scope.filteredItems;

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
