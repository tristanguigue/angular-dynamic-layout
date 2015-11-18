(function() {
  'use strict';

  angular
    .module('dynamicLayout')
    .factory('PositionService', PositionService);

  /*
   * The position service
   *
   * Find the best adjustements of the elemnts in the DOM according the their
   * order, height and width
   *
   * Fix their absolute position in the DOM while adding a ng-animate class for
   * personalized animations
   *
   * @ngInject
   */
  function PositionService() {

    return {
      layout: layout
    };

    function layout(element, items) {

      // Calculate dimensions
      angular.forEach(items, function(item) {
        item.calculateDimensions();
      });

      // 2) Calculate amount of columns using total width and item width
      var colWidth = getColWidth(items);

      // Apply columnSpan to each item
      angular.forEach(items, function(item) {
        item.dimensions.columnSpan = Math.round(item.dimensions.width / colWidth);
      });

      // We set what should be their absolute position in the DOM
      return setItemsPosition(element[0].offsetWidth, colWidth, items);
    }

    /*
     * Get the column size based on the minimum width of the items
     * @return: column size
     */
    function getColWidth(items) {
      var colWidth;
      angular.forEach(items, function(item) {
        if (!colWidth || item.dimensions.width < colWidth) {
          colWidth = item.dimensions.width;
        }
      });
      return colWidth;
    }

    /*
     * Set the items' absolute position
     * @param columns: the empty columns
     * @param colWidth: the column size
     */
    function setItemsPosition(containerWidth, colWidth, items) {

      var columns = initColumns(containerWidth, colWidth);

      angular.forEach(items, function(item) {
        var columnHeights = getColumnHeights(columns);
        var colPos = getItemColumnsAndPosition(item, columnHeights, colWidth);
        var j;

        for (j in colPos.columns) {
          columns[colPos.columns[j]].push(item);
        }

        item.pos.x = colPos.position.x;
        item.pos.y = colPos.position.y;
      });
    }

    /*
     * Intialize the columns
     * @param nb: the number of columns to be initialized
     * @return: the empty columns
     */
    function initColumns(containerWidth, colWidth) {
      var amount = Math.round(containerWidth / colWidth);
      var columns = [];
      var i;
      for (i = 0; i < amount; ++i) {
        columns.push([]);
      }
      return columns;
    }

    /*
     * Get the columns heights
     * @param columns: the columns with the items they contain
     * @return: an array of columns heights
     */
    function getColumnHeights(columns) {
      var columnHeights = [];
      var i;
      for (i in columns) {
        var h = 0;
        if (columns[i].length) {
          var lastItem = columns[i][columns[i].length - 1];
          h = lastItem.pos.y + lastItem.dimensions.height;
        }
        columnHeights.push(h);
      }
      return columnHeights;
    }

    /*
     * Find the item absolute position and what columns it belongs too
     * @param item: the item to place
     * @param colHeights: the current height of the column when all items prior
     * to this one were placed
     * @param colWidth: the column size
     * @return the item's columms and coordinates
     */
    function getItemColumnsAndPosition(item, colHeights, colWidth) {
      if (item.dimensions.columnSpan > colHeights.length) {
        throw 'Item too large';
      }

      var indexOfMin = 0;
      var minFound = 0;
      var i;

      // We look at what set of columns have the minimum height
      for (i = 0; i <= colHeights.length - item.dimensions.columnSpan; ++i) {
        var startingColumn = i;
        var endingColumn = i + item.dimensions.columnSpan;
        var maxHeightInPart = Math.max.apply(
          Math, colHeights.slice(startingColumn, endingColumn)
        );

        if (i === 0 || maxHeightInPart < minFound) {
          minFound = maxHeightInPart;
          indexOfMin = i;
        }
      }

      var itemColumns = [];
      for (i = indexOfMin; i < indexOfMin + item.dimensions.columnSpan; ++i) {
        itemColumns.push(i);
      }

      var position = {
        x: itemColumns[0] * colWidth,
        y: minFound
      };

      return {
        columns: itemColumns,
        position: position
      };
    }

  }

})();
