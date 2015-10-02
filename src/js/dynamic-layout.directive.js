(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .directive('dynamicLayout', dynamicLayout);

  /*
   * The isotope directive that renders the templates based on the array of items
   * passed
   */
  function dynamicLayout($window, $timeout, PositionService) {

    return {
      restrict: 'A',
      controller: controller
    };

    function controller($scope, $element) {

      var vm = this;
      var timeoutId;
      var items = [];

      vm.subscribe = subscribe;
      vm.unsubscribe = unsubscribe;
      vm.layout = layout;

      /*
       * Triggers a layout every time the window is resized
       */
      angular.element($window).on('resize', layout);

      $scope.$on('$destroy', function() {
        angular.element($window).off('resize', layout);
      });

      function subscribe(item) {
        items.push(item);
        layout();
      }

      function unsubscribe(item) {
        items.splice(items.indexOf(item), 1);
        layout();
      }

      /*
       * Use the PositionService to layout the items (debounced for perf)
       * @return the promise of the cards being animated
       */
      function layout() {
        $timeout.cancel(timeoutId);
        timeoutId = $timeout(function() {
          var lastItem = items[items.length - 1];
          PositionService.layout($element, items);
          $element[0].style.height = lastItem.pos.y + lastItem.dimensions.height + 'px';
        });
      }

    }
  }

})();
