isoGridModule.factory('PositionService', ["$window", "$animate", "$timeout",
  function ($window, $animate, $timeout) {
      var ongoingAnimations = {};
      // Positions Logic
      function isShowing(item){
         return !('showing' in item) || item.showing;
      }

      function initColumns(nb){
        columns = [];
        for(var i=0; i < nb ; ++i){
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
        var width = item.columnSpan;
        if(width>colHeights.length)
          throw Error("Item too large");

        var indexOfMin = 0;
        var minFound = 0;

        for(var i=0; i <= colHeights.length-width; ++i){
          var startingColumn = i;
          var endingColumn = i+width;
          var maxHeightInPart = Math.max.apply(Math, colHeights.slice(startingColumn, endingColumn));
          if(i===0 || maxHeightInPart < minFound){
              minFound = maxHeightInPart;
              indexOfMin = i;         
          }
        }
        var itemColumns = [];
        for(i=indexOfMin; i<indexOfMin+width; ++i){
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

      function fillColumnsWithItem(columns, itemColumns, item){
            for(var j in itemColumns){
              columns[itemColumns[j]].push(item);
            }
      }

      function setItemPosition(item, columns, colSize){
            var columnsHeights = getColumnsHeights(columns);
            var itemColumnsAndPosition = getItemColumnsAndPosition(item, columnsHeights, colSize);
            fillColumnsWithItem(columns, itemColumnsAndPosition.columns, item);
            item.x = itemColumnsAndPosition.position.x;
            item.y = itemColumnsAndPosition.position.y;
      }

      // DOM Manipulation
      function getDOMElementFromItem(index){
        return angular.element(document.getElementById('isogrid-'+index).children[0]);
      }

      function getColSize(items){
        var col_size;
        for(i=0;i<items.length;++i){
          if(!col_size || items[i].width < col_size)
            col_size = items[i].width;
        }
        return col_size;
      }

      function setItemsColumnSpan(items, colSize){
        for(i=0;i<items.length;++i){
          items[i].columnSpan = Math.ceil((items[i].width-2) / colSize);
        }
      }

      function getNumberOfColumns(containerWidth, colSize){
        return Math.floor(containerWidth/colSize);
      }

      function launchAnimation(element, i){
        var animationPromise = $animate.addClass(element, 'move-items-animation', {
          from: {
             position: 'absolute',
          },
          to: {
            left : items[i].x + 'px',
            top : items[i].y + 'px'
          }
        });

        animationPromise.then(function(){
          element.removeClass('move-items-animation');
          delete ongoingAnimations[i];
        });

        return animationPromise;        
      }

      return {
        setItemDimensionFromDOM : function(items){
          var col_width;
          for(i=0;i<items.length;++i){
            element = getDOMElementFromItem(i);
            items[i].height = element[0].offsetHeight + parseInt($window.getComputedStyle(element[0]).marginTop);
            items[i].width = element[0].offsetWidth + parseInt($window.getComputedStyle(element[0]).marginLeft);
          }
        },

        applyToDOM : function(items){
          var launchAnimations = function(){
            for(i=0;i<items.length;++i){
              element = getDOMElementFromItem(i);
              ongoingAnimations[i] = launchAnimation(element, i);   
            }
          };

          if(Object.keys(ongoingAnimations).length){
            for(var j in ongoingAnimations){
              $animate.cancel(ongoingAnimations[j]);
              delete ongoingAnimations[j];
            }
            $timeout(function(){
              launchAnimations();
            });
          }else{
            launchAnimations();
          }
        },

        apply: function (containerWidth, items) {
          items = angular.copy(items);
          this.setItemDimensionFromDOM(items);
          colSize = getColSize(items);
          setItemsColumnSpan(items, colSize);
          nbColumns = getNumberOfColumns(containerWidth, colSize);

          var columns = initColumns(nbColumns);
          for(var k in items){
            setItemPosition(items[k], columns, colSize);
          }

          this.applyToDOM(items);
          return columns;
        }
     };

   }]);
