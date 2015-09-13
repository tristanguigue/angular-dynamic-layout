(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .filter('customRanker', ['RankerService', customRanker]);

  /*
   * The ranker to be applied on the ng-repeat directive
   */
  function customRanker(RankerService) {

    return function(items, rankers) {
      if (rankers) {
        return RankerService.applyRankers(items, rankers);
      }
      return items;
    };
  }

})();
