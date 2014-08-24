var isoGridModule = angular.module('isoGrid', [])

     .factory('FilterService', function () {
      var COMPARATORS = ['=', '<', '>', '<=', '>=', '!=', 'in', 'not in'];

      var checkStatement = function(item, statement){
                if(typeof(statement) == "function"){
                  return statement(item);                    
                }else{
                  if(statement.length<2)
                    throw "Incorrerct statement";
                  
                  var property = statement[0];
                  var comparator = statement[1];
                  var value = statement[2];
                  
                  if(!comparator in COMPARATORS)
                    throw "Incorrect statement comparator";

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
                      return ! item[property] in value;
                  }
                }        
      }

      var checkOrGroup = function(item, orGroup){
              for(j in orGroup){
                if(checkStatement(item, orGroup[j]))
                  return true;
              }
              return false;
      }

      var checkAndGroup = function(item, andGroup){
            for(i in andGroup){
              if(!checkOrGroup(item, andGroup[i]))
                return false;
            }
            return true;
      }

      return {
        apply: function (items, filters) {
          for(i in items){
            items[i].showing = checkAndGroup(items[i], filters);
          }
          return items;
        }
      };
    })

     .factory('OrderService', function () {
      return {
        apply: function (items, rankers) {

          var i = 0;
          
          var recursiveRanker = function(a, b){
            var ranker = rankers[i][0];
            var ascDesc = rankers[i][1];

            if(typeof(ranker) == "function"){
              var value_a = ranker(a);  
              var value_b = ranker(b);                  
            } else{
              if(!(ranker in a) && !(ranker in b)){
                var value_a = 0
                var value_b = 0;
              }else if(!ranker in a){
                return ascDesc=="asc"? -1:1;
              }else if(!ranker in b){
                return ascDesc=="asc"? 1:-1;
              }

              var value_a = a[ranker];  
              var value_b = b[ranker];                                  
            }  
            if(value_a > value_b)  return ascDesc=="asc"? 1:-1;
            else if(value_b < value_a) return ascDesc=="asc"? -1:1;

            ++i;
            if(rankers.length > i){
              return recursiveRanker(a, b);
            } 
            else return 0;

          }

          var sorter = function(a, b){
            i = 0;
            var ret = recursiveRanker(a, b);
            return ret;
          }

          items.sort(sorter);

          return items;
        }
     }
   });

