(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .directive('layoutOnLoad', layoutOnLoad);

  /*
   * Directive on images to layout after each load
   *
   * @ngInject
   */
  function layoutOnLoad() {

    return {
      restrict: 'A',
      require: '^dynamicLayout',
      link: link
    };

    function link(scope, element, attrs, ctrl) {
      element.on('load error', function() {
        ctrl.layout();
      });
    }
  }

})();
