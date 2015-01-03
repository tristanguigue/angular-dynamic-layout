/**
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
});