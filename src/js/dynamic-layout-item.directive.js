(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .directive('dynamicLayoutItem', dynamicLayoutItem);

  /* @ngInject */
  function dynamicLayoutItem($window, $animate) {
    return {
      restrict: 'A',
      require: '^dynamicLayout',
      link: link
    };

    function link(scope, element, attrs, ctrl) {

      var animation;

      scope.dimensions = {
        columnSpan: 0,
        width: 0,
        height: 0
      };
      scope.pos = {
        x: 0,
        y: 0
      };
      scope.calculateDimensions = calculateDimensions;

      ctrl.subscribe(scope);

      scope.$watch('$index', ctrl.layout);
      scope.$watchCollection('pos', position);

      // Cleanup
      scope.$on('$destroy', function() {
        ctrl.unsubscribe(scope);
      });

      function calculateDimensions() {
        var rect = element[0].children[0].getBoundingClientRect();
        var width;
        var height;

        if (rect.width) {
          width = rect.width;
          height = rect.height;
        } else {
          width = rect.right - rect.left;
          height = rect.top - rect.bottom;
        }

        scope.dimensions.width = width + parseFloat($window.getComputedStyle(element[0].children[0]).marginLeft);
        scope.dimensions.height = height + parseFloat($window.getComputedStyle(element[0]).marginTop);
      }

      function position() {
        if (animation) {
          $animate.cancel(animation);
        }
        animation = $animate.addClass(element, 'move-items-animation', {
          from: {
            position: 'absolute'
          },
          to: {
            left: scope.pos.x + 'px',
            top: scope.pos.y + 'px'
          }
        }).then(function() {
          element.removeClass('move-items-animation');
        });
      }

    }
  }

})();
