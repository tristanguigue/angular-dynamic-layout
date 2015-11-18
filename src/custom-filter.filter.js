(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .filter('customFilter', ['FilterService', customFilter]);

  /*
   * The filter to be applied on the ng-repeat directive
   */
  function customFilter(FilterService) {

    return function(items, filters) {
      if (filters) {
        return FilterService.applyFilters(items, filters);
      }
      return items;
    };
  }

})();
