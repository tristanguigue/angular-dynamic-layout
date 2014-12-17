isoGridModule.factory('PositionService', ["$window", "$animate", "$timeout", "$q",
  function ($window, $animate, $timeout, $q) {
      var ongoingAnimations = {};
      var items = [];
      var elements = [];

      // Positions Logic
      function initColumns(nb){
        columns = [];
        for(var i = 0; i < nb ; ++i){
          columns.push([]);
        }
        return columns;
      }

      function getColumnsHeights(columns){
        columnsHeights = [];
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
      }

      function getItemColumnsAndPosition(item, colHeights, colSize){
        if(item.columnSpan > colHeights.length)
          throw Error("Item too large");

        var indexOfMin = 0;
        var minFound = 0;

        for(var i = 0; i <= colHeights.length - item.columnSpan; ++i){
          var startingColumn = i;
          var endingColumn = i + item.columnSpan;
          var maxHeightInPart = Math.max.apply(Math, colHeights.slice(startingColumn, endingColumn));

          if(i===0 || maxHeightInPart < minFound){
              minFound = maxHeightInPart;
              indexOfMin = i;         
          }
        }

        var itemColumns = [];
        for(i = indexOfMin; i < indexOfMin + item.columnSpan; ++i){
          itemColumns.push(i);
        }

        return {
          columns : itemColumns, 
          position : {
            x : itemColumns[0]*colSize,
            y : minFound
          }
        };
      }

      function setItemsPosition(columns, colSize){
        for(i = 0; i < items.length; ++i){
            var columnsHeights = getColumnsHeights(columns);

            var itemColumnsAndPosition = getItemColumnsAndPosition(items[i], columnsHeights, colSize);

            for(var j in itemColumnsAndPosition.columns){
              columns[itemColumnsAndPosition.columns[j]].push(items[i]);
            }


            items[i].x = itemColumnsAndPosition.position.x;
            items[i].y = itemColumnsAndPosition.position.y;
          }
      }

      function getColSize(){
        var col_size;
        for(i = 0; i < items.length; ++i){
          if(!col_size || items[i].width < col_size)
            col_size = items[i].width;
        }
        return col_size;
      }

      function setItemsColumnSpan(colSize){
        for(i = 0; i < items.length; ++i){
          items[i].columnSpan = Math.ceil(items[i].width / colSize);
        }
      }

      return {
        getItemsDimensionFromDOM : function(numberOfItems){
          // not(.ng-leave) : we don't want to select elements that have been 
          // removed but are  still in the DOM
          elements =  document.querySelectorAll(".isogrid-item-parent:not(.ng-leave)");
          items = [];
          for(i = 0; i < elements.length; ++i){
            // Note: we need to get the children element width because that's
            // where the style is applied
            items.push({
              height: elements[i].offsetHeight + 
                parseInt($window.getComputedStyle(elements[i]).marginTop),
              width: elements[i].children[0].offsetWidth + 
                parseInt($window.getComputedStyle(elements[i].children[0]).marginLeft)
            });
          }
          return items;
        },

        applyToDOM : function(previousItems){
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
              element.classList.remove('move-items-animation');
              delete ongoingAnimations[i];
            });

            return animationPromise;        
          };

          var launchAnimations = function(){
            for(i = 0; i < items.length; ++i){
              // We need to pass the specific element we're dealing with
              // because at the next iteration elements[i] might point to
              // something else
              ongoingAnimations[i] = launchAnimation(elements[i], i);                   
            }
            $q.all(ongoingAnimations).then(function(){
              ret.resolve();
            });
          };

          var ret = $q.defer();

          if(angular.equals(previousItems, items)){
            ret.resolve();
            return ret.promise;            
          }
          if(Object.keys(ongoingAnimations).length){
            for(var j in ongoingAnimations){
                $animate.cancel(ongoingAnimations[j]);
                delete ongoingAnimations[j];
            }
            $timeout(function(){
              launchAnimations(ret);
            });
          }else{
            launchAnimations(ret);
          }
          return ret.promise;
        },

        apply: function (containerWidth) {
          var previousItems = angular.copy(items);
          items = this.getItemsDimensionFromDOM();

          var colSize = getColSize();
          var nbColumns = Math.floor(containerWidth / colSize);
          var columns = initColumns(nbColumns);

          setItemsColumnSpan(colSize);

          setItemsPosition(columns, colSize);

          return this.applyToDOM(previousItems);
        }
     };

   }]);
