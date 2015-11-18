(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .directive('layoutOnLoad', ['$rootScope', layoutOnLoad]);

  /*
   * Directive on images to layout after each load
   */
  function layoutOnLoad($rootScope) {

    return {
      restrict: 'A',
      link: function(scope, element) {
        element.bind('load error', function() {
          $timeout.cancel(timeoutId);
          timeoutId = $timeout(function() {
            $rootScope.$broadcast('dynamicLayout.layout');
          });
        });
      }
    };
  }

})();
