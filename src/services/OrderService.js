isoGridModule.factory('OrderService', function () {
      return {
        apply: function (items, rankers) {

          var i = 0;
          
          var recursiveRanker = function(a, b){
            var ranker = rankers[i][0];
            var ascDesc = rankers[i][1];
            var value_a;
            var value_b;

            if(typeof(ranker) == "function"){
              value_a = ranker(a);  
              value_b = ranker(b);                  
            }
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
                if(comp == 1)
                  return ascDesc == "asc"? 1: -1;
                else if(comp == -1)
                  return ascDesc == "asc"? -1: 1;
              }
              else{
                if(value_a > value_b)  
                  return ascDesc == "asc"? 1: -1;
                else if(value_a < value_b) 
                  return ascDesc == "asc"? -1: 1;
              }
            }

            ++i;

            if(rankers.length > i)
              return recursiveRanker(a, b);
            else 
              return 0;
          };

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