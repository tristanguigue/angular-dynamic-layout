(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .factory('RankerService', RankerService);

  /*
   * The rankers service
   *
   * Allows a list of rankers to sort the items.
   * If two items are the same regarding the first ranker, the second one is used
   * to part them, etc.
   *
   * Rankers can be either a property name or a custom operation on the item.
   * They all need to specify the order chosen (asc' or 'desc')
   *
   *        var rankers = [
   *          ['color', 'asc'],
   *          ['atomicNumber', 'desc']
   *        ];
   * Or
   *        var rankers = [
   *          [myCustomGetter, 'asc']
   *        ];
   *
   */
  function RankerService() {

    return {
      applyRankers: applyRankers
    };

    /*
     * Order the items with the given rankers
     * @param items: the items being ranked
     * @param rankers: the array of rankers used to rank the items
     * @return the ordered list of items
     */
    function applyRankers(items, rankers) {
      // The ranker counter
      var i = 0;

      if (rankers) {
        items.sort(sorter);
      }

      /*
       * The custom sorting function using the built comparison function
       * @param a, b: the items to be compared
       * @return -1, 0 or 1
       */
      function sorter(a, b) {
        i = 0;
        return recursiveRanker(a, b);
      }

      /*
       * Compare recursively two items
       * It first compare the items with the first ranker, if no conclusion
       * can be drawn it uses the second ranker and so on until it finds a
       * winner or there are no more rankers
       * @param a, b: the items to be compared
       * @return -1, 0 or 1
       */
      function recursiveRanker(a, b) {
        var ranker = rankers[i][0];
        var ascDesc = rankers[i][1];
        var valueA;
        var valueB;
        // If it is a custom ranker, give the item as input and gather the
        // ouput
        if (angular.isFunction(ranker)) {
          valueA = ranker(a);
          valueB = ranker(b);
        } else {
          // Otherwise use the item's properties
          if (!(ranker in a) && !(ranker in b)) {
            valueA = 0;
            valueB = 0;
          } else if (!(ranker in a)) {
            return ascDesc === 'asc' ? -1 : 1;
          } else if (!(ranker in b)) {
            return ascDesc === 'asc' ? 1 : -1;
          }
          valueA = a[ranker];
          valueB = b[ranker];
        }

        if (typeof valueA === typeof valueB) {

          if (angular.isString(valueA)) {
            var comp = valueA.localeCompare(valueB);
            if (comp === 1) {
              return ascDesc === 'asc' ? 1 : -1;
            } else if (comp === -1) {
              return ascDesc === 'asc' ? -1 : 1;
            }
          } else {
            if (valueA > valueB) {
              return ascDesc === 'asc' ? 1 : -1;
            } else if (valueA < valueB) {
              return ascDesc === 'asc' ? -1 : 1;
            }
          }
        }

        ++i;

        if (rankers.length > i) {
          return recursiveRanker(a, b);
        }

        return 0;
      }

      return items;
    }

  }

})();
