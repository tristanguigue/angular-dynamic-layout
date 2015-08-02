(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .directive('layoutOnLoad', layoutOnLoad);

  /*
   * Directive on images to layout after each load
   */
  function layoutOnLoad($rootScope) {

    return {
        restrict: 'A',
        link: function(scope, element) {
          element.bind('load error', function() {
            $rootScope.$broadcast('layout');
          });
        }
    };
  }

})();
