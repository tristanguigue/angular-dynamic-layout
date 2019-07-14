(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .directive('layoutOnLoad', ['$rootScope', '$timeout', layoutOnLoad]);

  /*
   * Directive on images to layout after each load
   */
  function layoutOnLoad($rootScope, $timeout) {

    return {
      restrict: 'A',
      link: function(scope, element) {
        element.bind('load error', function() {
          var timeoutId;
          $timeout.cancel(timeoutId);
          timeoutId = $timeout(function() {
            $rootScope.$broadcast('dynamicLayout.layout');
          });
        });
      }
    };
  }

})();
