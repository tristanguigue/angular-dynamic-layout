(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .filter('customRanker', function (RankerService) {
        return customRanker(RankerService);
    });

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
