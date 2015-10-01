(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .directive('dynamicLayout', ['$timeout', '$window', '$q', '$animate', 'PositionService', dynamicLayout]);

  /*
   * The isotope directive that renders the templates based on the array of items
   * passed
   * @scope items: the list of items to be rendered
   * @scope rankers: the rankers to be applied on the list of items
   * @scope filters: the filters to be applied on the list of items
   * @scope defaulttemplate: (optional) the deafult template to be applied on each item if no item template is defined
   */
  function dynamicLayout($timeout, $window, $q, $animate, PositionService) {

    return {
      restrict: 'A',
      scope: {
        items: '=',
        rankers: '=',
        filters: '=',
        defaulttemplate: '=?'
      },
      template: '<div                                     \
                    class="dynamic-layout-item-parent"    \
                    ng-repeat="it in items |              \
                               customFilter: filters |    \
                               customRanker:rankers |     \
                               as:this:\'filteredItems\'" \
                    ng-include="it.template || defaulttemplate" \
                ></div>',
      link: link
    };

    function link(scope, element) {

      // Keep count of the number of templates left to load
      scope.templatesToLoad = 0;
      scope.externalScope = externalScope;

      // Fires when a template is requested through the ng-include directive
      scope.$on('$includeContentRequested', function() {
        scope.templatesToLoad++;
      });

      // Fires when a template has been loaded through the ng-include
      // directive
      scope.$on('$includeContentLoaded', function() {
        scope.templatesToLoad--;
      });

      /*
       * Triggers a layout every time the items are changed
       */
      scope.$watch('filteredItems', function(newValue, oldValue) {
        // We want the filteredItems to be available to the controller
        // This feels hacky, there must be a better way to do this
        scope.$parent.filteredItems = scope.filteredItems;

        if (!angular.equals(newValue, oldValue)) {
          itemsLoaded().then(function() {
            layout();
          });
        }
      }, true);

      /*
       * Triggers a layout every time the window is resized
       */
      angular.element($window).on('resize', onResize);

      /*
       * Triggers a layout whenever requested by an external source
       * Allows a callback to be fired after the layout animation is
       * completed
       */
      scope.$on('dynamicLayout.layout', function(event, callback) {
        layout().then(function() {
          if (angular.isFunction('function')) {
            callback();
          }
        });
      });

      /*
       * Triggers the initial layout once all the templates are loaded
       */
      itemsLoaded().then(function() {
        layout();
      });

      // Cleanup
      scope.$on('$destroy', function() {
        angular.element($window).off('resize', onResize);
      });

      function onResize() {
        // We need to apply the scope
        scope.$apply(function() {
          layout();
        });
      }

      /*
       * Use the PositionService to layout the items
       * @return the promise of the cards being animated
       */
      function layout() {
        return PositionService.layout(element[0].offsetWidth);
      }

      /*
       * Check when all the items have been loaded by the ng-include
       * directive
       */
      function itemsLoaded() {
        var def = $q.defer();

        // $timeout : We need to wait for the includeContentRequested to
        // be called before we can assume there is no templates to be loaded
        $timeout(function() {
          if (scope.templatesToLoad === 0) {
            def.resolve();
          }
        });

        scope.$watch('templatesToLoad', function(newValue, oldValue) {
          if (newValue !== oldValue && scope.templatesToLoad === 0) {
            def.resolve();
          }
        });

        return def.promise;
      }

      /*
       * This allows the external scope, that is the scope of
       * dynamic-layout's container to be  called from the templates
       * @return the given scope
       */
      function externalScope() {
        return scope.$parent;
      }

    }
  }

})();
