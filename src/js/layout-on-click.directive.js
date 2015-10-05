(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .directive('layoutOnClick', layoutOnClick);

  /*
   * Directive on images to layout after each load
   */
  function layoutOnClick() {

    return {
      restrict: 'A',
      require: '^dynamicLayout',
      link: link
    };

    function link(scope, element, attrs, ctrl) {
      element.on('click', function() {
        ctrl.layout();
      });
    }
  }

})();
