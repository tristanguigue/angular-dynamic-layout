isoGridModule.factory('PositionService', ["$window",
  function ($window) {
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
          var h = 0;
          for(var j in columns[i]){
            h += columns[i][j].height;
          }
          columnsHeights.push(h);
        }
        return columnsHeights;
      }


      function getItemColumnsAndPosition(item, colHeights, colSize){
        var width = item.width; 

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
      function getDOMElementFromItem(item){
        return document.getElementById("item-"+item.id);
      }

      function applyShowHideToDOM(items){
          for(var k in items){
            if('showing' in items[k]){
              if(items[k].showing){
                showItemInDOM(items[k]);
              }else{
                hideItemInDOM(items[k]);
              }
            }
          }
      }

      function hideItemInDOM(item){
        element = getDOMElementFromItem(item);
        element.style.display = "None";
      }

      function showItemInDOM(item){
         element = getDOMElementFromItem(item);
         element.style.display = "";
      }

      function applyPositionsToDOM(items){

          for(i=0;i<items.length;++i){
            element = getDOMElementFromItem(items[i]);
            element.style.position = "absolute";
            element.style.left = items[i].x+"px";
            element.style.top = items[i].y+"px";
          }              
      }

      return {
        setItemHeightsFromDOM : function(items){
          for(i=0;i<items.length;++i){
            element = getDOMElementFromItem(items[i]);
            items[i].height = element.offsetHeight + parseInt($window.getComputedStyle(element).marginTop);
          }
        },

        applyToDOM : function(items){
          applyShowHideToDOM(items);
          applyPositionsToDOM(items);        
        },

        apply: function (items) {

          //For building purposes
          nbColumns = 3;
          colSize = 415;

          this.setItemHeightsFromDOM(items);

          var columns = initColumns(nbColumns);

          for(var k in items){

            if(!isShowing(items[k]))
              continue;

            setItemPosition(items[k], columns, colSize);

          }

          this.applyToDOM(items);
          
          return columns;
        }
     };

   }]);
