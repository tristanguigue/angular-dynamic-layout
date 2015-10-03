(function() {
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
