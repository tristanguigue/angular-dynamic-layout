(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .filter('as', ['$parse', as]);

  /*
   * This allowed the result of the filters to be assigned to the scope
   */
  function as($parse) {

    return function(value, context, path) {
      $parse(path).assign(context, value);
      return value;
    };
  }

})();
