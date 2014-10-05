isoGridModule.factory('PositionService', function () {
      function getItemHeights(items){

        for(i=0;i<items.length;++i){
          element = document.getElementById("item-"+items[i].id);
          items[i].h = element.offsetHeight + parseInt(window.getComputedStyle(element).marginTop);
        }

        return items
      }

      function initColumns(nb){
        columns = [];
        for(i=0;i<nb; ++i){
          columns.push([]);
        }
        return columns;
      }

      function getColumnsHeights(columns){
        columnsHeights = [];
        for(i in columns){
          var h = 0;
          for(j in columns[i]){
            h+=columns[i][j].h;
          }
          columnsHeights.push(h);
        }
        return columnsHeights;
      }


      function findItemColumns(item, colHeights){
        var width = item.width; 

        if(width>colHeights.length)
          throw Error("Item too large")

        var indexOfMin = 0;
        var minFound = 0;

        for(i=0; i<=colHeights.length-width; ++i){
          var startingColumn = i;
          var endingColumn = i+width;
          var maxHeightInPart = Math.max.apply(Math, colHeights.slice(startingColumn, endingColumn));
          if(i==0 || maxHeightInPart < minFound){
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
          y : minFound
        };
      }

      function fillColumnsWithItem(columns, itemColumns, item){
            for(j in itemColumns){
              columns[itemColumns[j]].push(item);
            }
      }

      function applyPositionsToCss(items){

          for(i=0;i<items.length;++i){
            element = document.getElementById("item-"+items[i].id);
            element.style.position = "absolute";
            element.style.left = items[i].x+"px";
            element.style.top = items[i].y+"px";
          }              
      }

      return {
        apply: function (items, layout) {

          //For building purposes
          nbColumns = 3;
          colSize = 415;

          columns = initColumns(nbColumns);
          for(k in items){
            if('showing' in items[k]){
              element = document.getElementById("item-"+items[k].id);
              if(items[k].showing){
                element.style.display = "";
              }else{
                element.style.display = "None";
              }
            }
          }
          
          items = getItemHeights(items);
          for(k in items){
            if('showing' in items[k] && !items[k].showing)
              continue;
            var columnsHeights = getColumnsHeights(columns);
            var itemColumnsAndPos = findItemColumns(items[k], columnsHeights);
            var itemColumns = itemColumnsAndPos.columns;
            fillColumnsWithItem(columns, itemColumns, items[k]);
            
            items[k].x = itemColumns[0]*colSize;
            items[k].y = itemColumnsAndPos.y;

          }
          applyPositionsToCss(items);
              
        }
     }

   });
