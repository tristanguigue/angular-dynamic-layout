(function() {
  'use strict';

  angular
    .module('dynamicLayout', [ 'ngAnimate' ]);

})();
;(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .directive('dynamicLayout', ['$timeout', '$window', '$q', '$animate', 'PositionService', dynamicLayout]);

  /*
   * The isotope directive that renders the templates based on the array of items
   * passed
   * @scope items: the list of items to be rendered
   * @scope rankers: the rankers to be applied on the list of items
   * @scope filters: the filters to be applied on the list of items
   * @scope defaulttemplate: (optional) the deafult template to be applied on each item if no item template is defined
   */
  function dynamicLayout($timeout, $window, $q, $animate, PositionService) {

    return {
      restrict: 'A',
      scope: {
        items: '=',
        rankers: '=',
        filters: '=',
        defaulttemplate: '=?'
      },
      template: '<div                                     \
                    class="dynamic-layout-item-parent"    \
                    ng-repeat="it in items |              \
                               customFilter: filters |    \
                               customRanker:rankers |     \
                               as:this:\'filteredItems\'" \
                    ng-include="it.template || defaulttemplate" \
                ></div>',
      link: link
    };

    function link(scope, element) {

      // Keep count of the number of templates left to load
      scope.templatesToLoad = 0;
      scope.externalScope = externalScope;

      // Fires when a template is requested through the ng-include directive
      scope.$on('$includeContentRequested', function() {
        scope.templatesToLoad++;
      });

      // Fires when a template has been loaded through the ng-include
      // directive
      scope.$on('$includeContentLoaded', function() {
        scope.templatesToLoad--;
      });

      /*
       * Triggers a layout every time the items are changed
       */
      scope.$watch('filteredItems', function(newValue, oldValue) {
        // We want the filteredItems to be available to the controller
        // This feels hacky, there must be a better way to do this
        scope.$parent.filteredItems = scope.filteredItems;

        if (!angular.equals(newValue, oldValue)) {
          itemsLoaded().then(function() {
            layout();
          });
        }
      }, true);

      /*
       * Triggers a layout every time the window is resized
       */
      angular.element($window).bind('resize', function() {
        // We need to apply the scope
        scope.$apply(function() {
          layout();
        });
      });

      /*
       * Triggers a layout whenever requested by an external source
       * Allows a callback to be fired after the layout animation is
       * completed
       */
      scope.$on('layout', function(event, callback) {
        layout().then(function() {
          if (angular.isFunction('function')) {
            callback();
          }
        });
      });

      /*
       * Triggers the initial layout once all the templates are loaded
       */
      itemsLoaded().then(function() {
        layout();
      });

      /*
       * Use the PositionService to layout the items
       * @return the promise of the cards being animated
       */
      function layout() {
        return PositionService.layout(element[0].offsetWidth);
      }

      /*
       * Check when all the items have been loaded by the ng-include
       * directive
       */
      function itemsLoaded() {
        var def = $q.defer();

        // $timeout : We need to wait for the includeContentRequested to
        // be called before we can assume there is no templates to be loaded
        $timeout(function() {
          if (scope.templatesToLoad === 0) {
            def.resolve();
          }
        });

        scope.$watch('templatesToLoad', function(newValue, oldValue) {
          if (newValue !== oldValue && scope.templatesToLoad === 0) {
            def.resolve();
          }
        });

        return def.promise;
      }

      /*
       * This allows the external scope, that is the scope of
       * dynamic-layout's container to be  called from the templates
       * @return the given scope
       */
      function externalScope() {
        return scope.$parent;
      }

    }
  }

})();
;(function() {
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
            $rootScope.$broadcast('layout');
          });
        }
    };
  }

})();
;(function() {
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
;(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .factory('PositionService', ['$window', '$document', '$animate', '$timeout', '$q', PositionService]);

  /*
   * The position service
   *
   * Find the best adjustements of the elemnts in the DOM according the their
   * order, height and width
   *
   * Fix their absolute position in the DOM while adding a ng-animate class for
   * personalized animations
   *
   */
  function PositionService($window, $document, $animate, $timeout, $q) {

    // The list of ongoing animations
    var ongoingAnimations = {};
    // The list of items related to the DOM elements
    var items = [];
    // The list of the DOM elements
    var elements = [];
    // The columns that contains the items
    var columns = [];

    var self = {
      getItemsDimensionFromDOM: getItemsDimensionFromDOM,
      applyToDOM: applyToDOM,
      layout: layout,
      getColumns: getColumns
    };
    return self;

    /*
     * Get the items heights and width from the DOM
     * @return: the list of items with their sizes
     */
    function getItemsDimensionFromDOM() {
      // not(.ng-leave) : we don't want to select elements that have been
      // removed but are  still in the DOM
      elements = $document[0].querySelectorAll(
        '.dynamic-layout-item-parent:not(.ng-leave)'
      );
      items = [];
      for (var i = 0; i < elements.length; ++i) {
        // Note: we need to get the children element width because that's
        // where the style is applied
        var rect = elements[i].children[0].getBoundingClientRect();
        var width;
        var height;
        if (rect.width) {
          width = rect.width;
          height = rect.height;
        } else {
          width = rect.right - rect.left;
          height = rect.top - rect.bottom;
        }

        items.push({
          height: height +
            parseFloat($window.getComputedStyle(elements[i]).marginTop),
          width: width +
            parseFloat(
              $window.getComputedStyle(elements[i].children[0]).marginLeft
            )
        });
      }
      return items;
    }

    /*
     * Apply positions to the DOM with an animation
     * @return: the promise of the position animations being completed
     */
    function applyToDOM() {

      var ret = $q.defer();

      /*
       * Launch an animation on a specific element
       * Once the animation is complete remove it from the ongoing animation
       * @param element: the element being moved
       * @param i: the index of the current animation
       * @return: the promise of the animation being completed
       */
      function launchAnimation(element, i) {
        var animationPromise = $animate.addClass(element,
          'move-items-animation',
          {
            from: {
               position: 'absolute'
            },
            to: {
              left: items[i].x + 'px',
              top: items[i].y + 'px'
            }
          }
        );

        animationPromise.then(function() {
          // We remove the class so that the animation can be ran again
          element.classList.remove('move-items-animation');
          delete ongoingAnimations[i];
        });

        return animationPromise;
      }

      /*
       * Launch the animations on all the elements
       * @return: the promise of the animations being completed
       */
      function launchAnimations() {
        var i;
        for (i = 0; i < items.length; ++i) {
          // We need to pass the specific element we're dealing with
          // because at the next iteration elements[i] might point to
          // something else
          ongoingAnimations[i] = launchAnimation(elements[i], i);
        }
        $q.all(ongoingAnimations).then(function() {
          ret.resolve();
        });
      }

      // We need to cancel all ongoing animations before we start the new
      // ones
      if (Object.keys(ongoingAnimations).length) {
        for (var j in ongoingAnimations) {
          $animate.cancel(ongoingAnimations[j]);
          delete ongoingAnimations[j];
        }
      }

      // For some reason we need to launch the new animations at the next
      // digest
      $timeout(function() {
        launchAnimations(ret);
      });

      return ret.promise;
    }

    /*
     * Apply the position service on the elements in the DOM
     * @param containerWidth: the width of the dynamic-layout container
     * @return: the promise of the position animations being completed
     */
    function layout(containerWidth) {
      // We first gather the items dimension based on the DOM elements
      items = self.getItemsDimensionFromDOM();

      // Then we get the column size base the elements minimum width
      var colSize = getColSize();
      var nbColumns = Math.floor(containerWidth / colSize);
      // We create empty columns to be filled with the items
      initColumns(nbColumns);

      // We determine what is the column size of each of the items based on
      // their width and the column size
      setItemsColumnSpan(colSize);

      // We set what should be their absolute position in the DOM
      setItemsPosition(columns, colSize);

      // We apply those positions to the DOM with an animation
      return self.applyToDOM();
    }

    // Make the columns public
    function getColumns() {
      return columns;
    }

    /*
     * Intialize the columns
     * @param nb: the number of columns to be initialized
     * @return: the empty columns
     */
    function initColumns(nb) {
      columns = [];
      var i;
      for (i = 0; i < nb; ++i) {
        columns.push([]);
      }
      return columns;
    }

    /*
     * Get the columns heights
     * @param columns: the columns with the items they contain
     * @return: an array of columns heights
     */
    function getColumnsHeights(cols) {
      var columnsHeights = [];
      var i;
      for (i in cols) {
        var h;
        if (cols[i].length) {
          var lastItem = cols[i][cols[i].length - 1];
          h = lastItem.y + lastItem.height;
        } else {
          h = 0;
        }
        columnsHeights.push(h);
      }
      return columnsHeights;
    }

    /*
     * Find the item absolute position and what columns it belongs too
     * @param item: the item to place
     * @param colHeights: the current heigh of the column when all items prior to this
     * one were places
     * @param colSize: the column size
     * @return the item's columms and coordinates
     */
    function getItemColumnsAndPosition(item, colHeights, colSize) {
      if (item.columnSpan > colHeights.length) {
        throw 'Item too large';
      }

      var indexOfMin = 0;
      var minFound = 0;
      var i;

      // We look at what set of columns have the minimum height
      for (i = 0; i <= colHeights.length - item.columnSpan; ++i) {
        var startingColumn = i;
        var endingColumn = i + item.columnSpan;
        var maxHeightInPart = Math.max.apply(
          Math, colHeights.slice(startingColumn, endingColumn)
        );

        if (i === 0 || maxHeightInPart < minFound) {
          minFound = maxHeightInPart;
          indexOfMin = i;
        }
      }

      var itemColumns = [];
      for (i = indexOfMin; i < indexOfMin + item.columnSpan; ++i) {
        itemColumns.push(i);
      }

      var position = {
        x: itemColumns[0] * colSize,
        y: minFound
      };

      return {
        columns: itemColumns,
        position: position
      };
    }

    /*
     * Set the items' absolute position
     * @param columns: the empty columns
     * @param colSize: the column size
     */
    function setItemsPosition(cols, colSize) {
      var i;
      var j;
      for (i = 0; i < items.length; ++i) {
        var columnsHeights = getColumnsHeights(cols);

        var itemColumnsAndPosition = getItemColumnsAndPosition(items[i],
                                                               columnsHeights,
                                                               colSize);

        // We place the item in the found columns
        for (j in itemColumnsAndPosition.columns) {
          columns[itemColumnsAndPosition.columns[j]].push(items[i]);
        }

        items[i].x = itemColumnsAndPosition.position.x;
        items[i].y = itemColumnsAndPosition.position.y;
      }
    }

    /*
     * Get the column size based on the minimum width of the items
     * @return: column size
     */
    function getColSize() {
      var colSize;
      var i;
      for (i = 0; i < items.length; ++i) {
        if (!colSize || items[i].width < colSize) {
          colSize = items[i].width;
        }
      }
      return colSize;
    }

    /*
     * Set the column span for each of the items based on their width and the
     * column size
     * @param: column size
     */
    function setItemsColumnSpan(colSize) {
      var i;
      for (i = 0; i < items.length; ++i) {
        items[i].columnSpan = Math.ceil(items[i].width / colSize);
      }
    }

  }

})();
;(function() {
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
;(function() {
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
;(function() {
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
;(function() {
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
