var dynamicLayoutModule = angular.module('dynamicLayout', ['ngAnimate'])

  /**
  * The filter to be applied on the ng-repeat directive
  */
  .filter('customFilter', ['FilterService', function(FilterService) {

    "use strict";
    
    return function( items, filters) {
      if(filters){
        return FilterService.applyFilters(items, filters);        
      }
      else{
        return items;        
      }
    };
  }])

  /**
  * The ranker to be applied on the ng-repeat directive
  */
  .filter('customRanker', ['RankerService', function(RankerService) {

    "use strict";
    
    return function( items, rankers) {
      if(rankers){
        return RankerService.applyRankers(items, rankers);
      }else{
        return items;
      }
        
    };
  }])

  /**
  * This allowed the result of the filters to be assigned to the scope
  */
  .filter("as", ['$parse', function($parse) {

    "use strict";
    
    return function(value, context, path) {
      return $parse(path).assign(context, value);
    };
  }])

  /**
  * Directive on images to layout after each load
  */
  .directive('layoutOnLoad', ['$rootScope', function($rootScope) {

    "use strict";
    
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          element.bind('load error', function() {
              $rootScope.$broadcast("layout");
          });
        }
    };
  }])

  /**
  * The isotope directive that renders the templates based on the array of items
  * passed
  * @scope items: the list of items to be rendered
  * @scope rankers: the rankers to be applied on the list of items 
  * @scope filters: the filters to be applied on the list of items 
  */
  .directive('dynamicLayout',
    ['$timeout', '$window', '$q', '$animate','PositionService',
    function ($timeout, $window, $q, $animate, PositionService) {

      "use strict";
      
      return {
        restrict: "A",
        scope: {
          items: '=items',
          rankers: '=rankers',
          filters: '=filters'
        },
        template: '<div                                     \
                      class="dynamic-layout-item-parent"           \
                      ng-repeat="it in items |              \
                                 customFilter: filters |    \
                                 customRanker:rankers |     \
                                 as:this:\'filteredItems\'" \
                      ng-include="it.template"              \
                  ></div>',
        link : function (scope, element, attrs){
          // Keep count of the number of templates left to load
          scope.templatesToLoad = 0;

          /**
          * Use the PositionService to layout the items
          * @return the promise of the cards being animated
          */
          var layout = function(){
            return PositionService.layout(element[0].offsetWidth); 
          };

          /**
          * Check when all the items have been loaded by the ng-include 
          * directive
          */
          var itemsLoaded = function(){
            var def = $q.defer();

            // $timeout : We need to wait for the includeContentRequested to 
            // be called before we can assume there is no templates to be loaded
            $timeout(function(){
              if(scope.templatesToLoad === 0)
                def.resolve();                   
            });

            scope.$watch('templatesToLoad', function(newValue, oldValue){
              if(newValue !== oldValue && scope.templatesToLoad === 0){
                def.resolve();                
              }
            });

            return def.promise;
          };

          // Fires when a template is requested through the ng-include directive
          scope.$on("$includeContentRequested", function(){
            scope.templatesToLoad++;
          });
          // Fires when a template has been loaded through the ng-include 
          // directive
          scope.$on("$includeContentLoaded", function(){
            scope.templatesToLoad--;
          });

          /**
          * This allows the external scope, that is the scope of
          * dynamic-layout's container to be  called from the templates
          * @return the given scope
          */
          scope.externalScope = function(){
            return scope.$parent;
          };

          /**
          * Triggers a layout every time the items are changed
          */
          scope.$watch('filteredItems', function(newValue, oldValue){
            // We want the filteredItems to be available to the controller
            // This feels hacky, there must be a better way to do this
            scope.$parent.filteredItems = scope.filteredItems;

            if(!angular.equals(newValue, oldValue)){
              itemsLoaded().then(function(){
                  layout();
              });      
            }
          }, true);

          /**
          * Triggers a layout every time the window is resized
          */
          angular.element($window).bind("resize",function(e){
              // We need to apply the scope 
              scope.$apply(function(){
                layout();
              });
          });

          /**
          * Triggers a layout whenever requested by an external source
          * Allows a callback to be fired after the layout animation is 
          * completed
          */
          scope.$on('layout', function(event, callback) {
            layout().then(function(){
              if(typeof callback === "function")
                callback();
            });
          });

          /**
          * Triggers the initial layout once all the templates are loaded
          */
          itemsLoaded().then(function(){
            layout();
          });

        }
      };
    }]);

;/**
* The filter service
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

dynamicLayoutModule.factory('FilterService', function () {

  "use strict";
  
  // The list of available comparators
  var COMPARATORS = ['=', '<', '>', '<=', '>=', '!=', 
                     'in', 'not in', 'contains'];

  /**
  * Check if a single item passes the single statement criteria
  * @param item: the item being probed
  * @param statement: the criteria being use to test the item
  * @return true if the item passed the statement, false otherwise
  */
  var checkStatement = function(item, statement){
    // If the statement is a custom filter, we give the item as a parameter
    if(typeof(statement) == "function"){
      return statement(item);      
    }

    // If the statement is a regular filter, it has to be with the form
    // [propertyName, comparator, value]
    else{
      var STATEMENT_LENGTH = 3;
      if(statement.length < STATEMENT_LENGTH){
        throw "Incorrect statement";
      }
      
      var property = statement[0];
      var comparator = statement[1];
      var value = statement[2];
      
      // If the property is not found in the item then we consider the 
      // statement to be false
      if(!item[property]){
        return false;        
      }

      switch(comparator){
        case '=':
          return item[property] == value;
        case '<':
          return item[property] < value;
        case '<=':
          return item[property] <= value;
        case '>':
          return item[property] > value;
        case '>=':
          return item[property] >= value;
        case '!=':
          return item[property] != value;
        case 'in':
          return item[property] in value;
        case 'not in':
          return !(item[property] in value);
        case 'contains':
          if(!(item[property] instanceof Array))
            throw "contains statement has to be applied on array";
          return item[property].indexOf(value) > -1;
        default:
          throw "Incorrect statement comparator: " +  comparator;  
      }
    }
  };

  /**
  * Check a sub (or) group
  * @param item: the item being probed
  * @param orGroup: the array of statement use to probe the item
  * @return true if the item passed at least one of the statements, 
  * false otherwise
  */
  var checkOrGroup = function(item, orGroup){
    for(var j in orGroup){
      if(checkStatement(item, orGroup[j])){
        return true;        
      }
    }
    return false;
  };

  /**
  * Check the main group
  * @param item: the item being probed
  * @param orGroup: the array of or groups use to probe the item
  * @return true if the item passed all of of the or groups, 
  * false otherwise
  */
  var checkAndGroup = function(item, andGroup){
    for(var i in andGroup){
      if(!checkOrGroup(item, andGroup[i])){
        return false;        
      }
    }
    return true;
  };

  return {
    /**
    * Check which of the items passes the filters
    * @param items: the items being probed
    * @param filters: the array of and groups use to probe the item
    * @return the list of items that passes the filters
    */
    applyFilters: function (items, filters) {
      var retItems = [];
      for(var i in items){
        if(checkAndGroup(items[i], filters)){
          retItems.push(items[i]);          
        }
      }
      return retItems;
    }
  };
});;/**
* The position service
*
* Find the best adjustements of the elemnts in the DOM according the their 
* order, height and width
* 
* Fix their absolute position in the DOM while adding a ng-animate class for
* personalized animations
*
*/
dynamicLayoutModule.factory('PositionService', 
  ["$window", "$animate", "$timeout", "$q",
  function ($window, $animate, $timeout, $q) {
    
     "use strict";

    // The list of ongoing animations
    var ongoingAnimations = {};
    // The list of items related to the DOM elements
    var items = [];
    // The list of the DOM elements
    var elements = [];
    // The columns that contains the items
    var columns = [];

    /**
    * Intialize the columns
    * @param nb: the number of columns to be initialized
    * @return: the empty columns
    */
    var initColumns = function(nb){
      columns = [];
      for(var i = 0; i < nb ; ++i){
        columns.push([]);
      }
      return columns;
    };

    /**
    * Get the columns heights
    * @param columns: the columns with the items they contain
    * @return: an array of columns heights
    */
    var getColumnsHeights = function(columns){
      var columnsHeights = [];
      for(var i in columns){
          var h;
          if(columns[i].length){
            var last_item = columns[i][columns[i].length-1];
            h = last_item.y + last_item.height;              
          }else{
            h = 0;
          }
          columnsHeights.push(h);
      }
      return columnsHeights;
    };

    /**
    * Find the item absolute position and what columns it belongs too
    * @param item: the item to place
    * @param colHeights: the current heigh of the column when all items prior to this
    * one were places
    * @param colSize: the column size
    * @return the item's columms and coordinates
    */
    var getItemColumnsAndPosition = function(item, colHeights, colSize){
      if(item.columnSpan > colHeights.length){
        throw "Item too large";        
      }

      var indexOfMin = 0;
      var minFound = 0;

      // We look at what set of columns have the minimum height
      for(var i = 0; i <= colHeights.length - item.columnSpan; ++i){
        var startingColumn = i;
        var endingColumn = i + item.columnSpan;
        var maxHeightInPart = Math.max.apply(
          Math, colHeights.slice(startingColumn, endingColumn)
        );

        if(i===0 || maxHeightInPart < minFound){
            minFound = maxHeightInPart;
            indexOfMin = i;         
        }
      }

      var itemColumns = [];
      for(i = indexOfMin; i < indexOfMin + item.columnSpan; ++i){
        itemColumns.push(i);
      }

      var position = {
          x : itemColumns[0]*colSize,
          y : minFound
      };

      return {
        columns : itemColumns, 
        position : position
      };
    };

    /**
    * Set the items' absolute position
    * @param columns: the empty columns
    * @param colSize: the column size
    */
    var setItemsPosition = function(columns, colSize){
      for(var i = 0; i < items.length; ++i){
        var columnsHeights = getColumnsHeights(columns);

        var itemColumnsAndPosition = getItemColumnsAndPosition(items[i], 
                                                               columnsHeights, 
                                                               colSize);

        // We place the item in the found columns
        for(var j in itemColumnsAndPosition.columns){
          columns[itemColumnsAndPosition.columns[j]].push(items[i]);
        }

        items[i].x = itemColumnsAndPosition.position.x;
        items[i].y = itemColumnsAndPosition.position.y;
      }
    };

    /**
    * Get the column size based on the minimum width of the items
    * @return: column size
    */
    var getColSize = function(){
      var col_size;
      for(var i = 0; i < items.length; ++i){
        if(!col_size || items[i].width < col_size)
          col_size = items[i].width;
      }
      return col_size;
    };

    /**
    * Set the column span for each of the items based on their width and the
    * column size
    * @param: column size
    */
    var setItemsColumnSpan = function(colSize){
      for(var i = 0; i < items.length; ++i){
        items[i].columnSpan = Math.ceil(items[i].width / colSize);
      }
    };

    return {
      /**
      * Get the items heights and width from the DOM
      * @return: the list of items with their sizes
      */
      getItemsDimensionFromDOM : function(){
        // not(.ng-leave) : we don't want to select elements that have been 
        // removed but are  still in the DOM
        elements = document.querySelectorAll(
          ".dynamic-layout-item-parent:not(.ng-leave)"
        );
        items = [];

        for(var i = 0; i < elements.length; ++i){
          // Note: we need to get the children element width because that's
          // where the style is applied
          items.push({
            height: elements[i].offsetHeight + 
              parseInt($window.getComputedStyle(elements[i]).marginTop),
            width: elements[i].children[0].offsetWidth + 
              parseInt(
                $window.getComputedStyle(elements[i].children[0]).marginLeft
              )
          });
        }
        return items;
      },

      /**
      * Apply positions to the DOM with an animation
      * @return: the promise of the position animations being completed
      */
      applyToDOM : function(){

        var ret = $q.defer();

        /**
        * Launch an animation on a specific element
        * Once the animation is complete remove it from the ongoing animation
        * @param element: the element being moved
        * @param i: the index of the current animation
        * @return: the promise of the animation being completed
        */
        var launchAnimation = function(element, i){
          var animationPromise = $animate.addClass(element, 
            'move-items-animation', 
            {
              from: {
                 position: 'absolute',
              },
              to: {
                left : items[i].x + 'px',
                top : items[i].y + 'px'
              }
            }
          );

          animationPromise.then(function(){
            // We remove the class so that the animation can be ran again
            element.classList.remove('move-items-animation');
            delete ongoingAnimations[i];
          });

          return animationPromise;        
        };

        /**
        * Launch the animations on all the elements
        * @return: the promise of the animations being completed
        */
        var launchAnimations = function(){
          for(var i = 0; i < items.length; ++i){
            // We need to pass the specific element we're dealing with
            // because at the next iteration elements[i] might point to
            // something else
            ongoingAnimations[i] = launchAnimation(elements[i], i);                   
          }
          $q.all(ongoingAnimations).then(function(){
            ret.resolve();
          });
        };

        // We need to cancel all ongoing animations before we start the new
        // ones
        if(Object.keys(ongoingAnimations).length){
          for(var j in ongoingAnimations){
              $animate.cancel(ongoingAnimations[j]);
              delete ongoingAnimations[j];
          }
        }
        
        // For some reason we need to launch the new animations at the next
        // digest
        $timeout(function(){
          launchAnimations(ret);
        });

        return ret.promise;
      },

      /**
      * Apply the position service on the elements in the DOM
      * @param containerWidth: the width of the dynamic-layout container
      * @return: the promise of the position animations being completed
      */
      layout: function (containerWidth) {
        // We first gather the items dimension based on the DOM elements
        items = this.getItemsDimensionFromDOM();

        // Then we get the column size base the elements minimum width
        var colSize = getColSize();
        var nbColumns = Math.floor(containerWidth / colSize);
        // We create empty columns to be filled with the items
        var columns = initColumns(nbColumns);

        // We determine what is the column size of each of the items based on 
        // their width and the column size
        setItemsColumnSpan(colSize);

        // We set what should be their absolute position in the DOM
        setItemsPosition(columns, colSize);

        // We apply those positions to the DOM with an animation
        return this.applyToDOM();
      },

      // Make the columns public 
      columns: function(){
        return columns;
      }
   };

 }]);
;/**
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
*          ["color", "asc"], 
*          ["atomicNumber", "desc"]
*        ];
* Or
*        var rankers = [
*          [myCustomGetter, "asc"]
*        ];
*
*/

dynamicLayoutModule.factory('RankerService', function () {

  "use strict";
  
  return {
    /**
    * Order the items with the given rankers
    * @param items: the items being ranked
    * @param rankers: the array of rankers used to rank the items
    * @return the ordered list of items
    */
    applyRankers: function (items, rankers) {
      // The ranker counter
      var i = 0;

      /**
      * Compare recursively two items
      * It first compare the items with the first ranker, if no conclusion
      * can be drawn it uses the second ranker and so on until it finds a 
      * winner or there are no more rankers
      * @param a, b: the items to be compared
      * @return -1, 0 or 1
      */
      var recursiveRanker = function(a, b){
        var ranker = rankers[i][0];
        var ascDesc = rankers[i][1];
        var value_a;
        var value_b;
        // If it is a custom ranker, give the item as input and gather the 
        // ouput
        if(typeof(ranker) == "function"){
          value_a = ranker(a);  
          value_b = ranker(b);                  
        }
        // Otherwise use the item's properties
        else{
          if(!(ranker in a) && !(ranker in b)){
            value_a = 0;
            value_b = 0;
          }
          else if(!(ranker in a)){
            return ascDesc=="asc"? -1:1;
          }
          else if(!(ranker in b)){
            return ascDesc=="asc"? 1:-1;
          }
          value_a = a[ranker];  
          value_b = b[ranker];                                  
        }  

        if(typeof value_a == typeof value_b){

          if(typeof value_a == "string"){
            var comp = value_a.localeCompare(value_b);
            if(comp == 1){
              return ascDesc == "asc"? 1: -1;              
            }
            else if(comp == -1){
              return ascDesc == "asc"? -1: 1;              
            }
          }
          else{
            if(value_a > value_b){
              return ascDesc == "asc"? 1: -1;              
            }
            else if(value_a < value_b){
              return ascDesc == "asc"? -1: 1;              
            } 
          }
        }

        ++i;

        if(rankers.length > i)
          return recursiveRanker(a, b);
        else 
          return 0;
      };

      /**
      * The custom sorting function using the built comparison function
      * @param a, b: the items to be compared
      * @return -1, 0 or 1
      */
      var sorter = function(a, b){
        i = 0;
        var ret = recursiveRanker(a, b);
        return ret;
      };

      if(rankers)
        items.sort(sorter);

      return items;
    }
 };
});