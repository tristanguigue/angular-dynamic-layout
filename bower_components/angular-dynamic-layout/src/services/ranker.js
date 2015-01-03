/**
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