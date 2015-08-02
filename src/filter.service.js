(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .factory('FilterService', FilterService);

  /*
   * The filter service
   *
   * COMPARATORS = ['=', '<', '>', '<=', '>=', '!=', 'in', 'not in', 'contains']
   *
   * Allows filters in Conjuctive Normal Form using the item's property or any
   * custom operation on the items
   *
   * For example:
   *        var filters = [ // an AND goup compose of OR groups
   *          [ // an OR group compose of statements
   *            ['color', '=', 'grey'], // A statement
   *            ['color', '=', 'black']
   *          ],
   *          [ // a second OR goup composed of statements
   *            ['atomicNumber', '<', 3]
   *          ]
   *        ];
   * Or
   *        var myCustomFilter = function(item){
   *          if(item.color != 'red')
   *            return true;
   *          else
   *            return false;
   *        };
   *
   *        filters = [
   *          [myCustomFilter]
   *        ];
   *
   */
  function FilterService() {

    return {
      applyFilters: applyFilters
    };

    /*
     * Check which of the items passes the filters
     * @param items: the items being probed
     * @param filters: the array of and groups use to probe the item
     * @return the list of items that passes the filters
     */
    function applyFilters(items, filters) {
      var retItems = [];
      var i;
      for (i in items) {
        if (checkAndGroup(items[i], filters)) {
          retItems.push(items[i]);
        }
      }
      return retItems;
    }

    /*
     * Check if a single item passes the single statement criteria
     * @param item: the item being probed
     * @param statement: the criteria being use to test the item
     * @return true if the item passed the statement, false otherwise
     */
    function checkStatement(item, statement) {
      // If the statement is a custom filter, we give the item as a parameter
      if (angular.isFunction(statement)) {
        return statement(item);
      }

      // If the statement is a regular filter, it has to be with the form
      // [propertyName, comparator, value]

      var STATEMENT_LENGTH = 3;
      if (statement.length < STATEMENT_LENGTH) {
        throw 'Incorrect statement';
      }

      var property = statement[0];
      var comparator = statement[1];
      var value = statement[2];

      // If the property is not found in the item then we consider the
      // statement to be false
      if (!item[property]) {
        return false;
      }

      switch (comparator) {
        case '=':
          return item[property] === value;
        case '<':
          return item[property] < value;
        case '<=':
          return item[property] <= value;
        case '>':
          return item[property] > value;
        case '>=':
          return item[property] >= value;
        case '!=':
          return item[property] !== value;
        case 'in':
          return item[property] in value;
        case 'not in':
          return !(item[property] in value);
        case 'contains':
          if (!(item[property] instanceof Array)) {
            throw 'contains statement has to be applied on array';
          }
          return item[property].indexOf(value) > -1;
        default:
          throw 'Incorrect statement comparator: ' + comparator;
      }
    }

    /*
     * Check a sub (or) group
     * @param item: the item being probed
     * @param orGroup: the array of statement use to probe the item
     * @return true if the item passed at least one of the statements,
     * false otherwise
     */
    function checkOrGroup(item, orGroup) {
      var j;
      for (j in orGroup) {
        if (checkStatement(item, orGroup[j])) {
          return true;
        }
      }
      return false;
    }

    /*
     * Check the main group
     * @param item: the item being probed
     * @param orGroup: the array of or groups use to probe the item
     * @return true if the item passed all of of the or groups,
     * false otherwise
     */
    function checkAndGroup(item, andGroup) {
      var i;
      for (i in andGroup) {
        if (!checkOrGroup(item, andGroup[i])) {
          return false;
        }
      }
      return true;
    }

  }

})();
