isoGridModule.factory('FilterService', function () {
      var COMPARATORS = ['=', '<', '>', '<=', '>=', '!=', 'in', 'not in', 'contains'];

      var checkStatement = function(item, statement){
                if(typeof(statement) == "function")
                  return statement(item);                    
                
                else{
                  if(statement.length<2)
                    throw "Incorrect statement";
                  
                  var property = statement[0];
                  var comparator = statement[1];
                  var value = statement[2];
                  
                  if(COMPARATORS.indexOf(comparator) === -1)
                    throw "Incorrect statement comparator: " +  comparator;

                  if(!item[property])
                    return false;

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
                  }
                }        
      };

      var checkOrGroup = function(item, orGroup){
              for(var j in orGroup){
                if(checkStatement(item, orGroup[j]))
                  return true;
              }
              return false;
      };

      var checkAndGroup = function(item, andGroup){
            for(var i in andGroup){
              if(!checkOrGroup(item, andGroup[i]))
                return false;
            }
            return true;
      };

      return {
        apply: function (items, filters) {
          var retItems = [];
          for(var i in items){
            if(checkAndGroup(items[i], filters))
              retItems.push(items[i]);
          }
          return retItems;
        }
      };
});