isoGridModule.factory('OrderService', function () {
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
            if(value_a > value_b)  
              return ascDesc=="asc"? 1:-1;
            else if(value_b < value_a) 
              return ascDesc=="asc"? -1:1;
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

          if(rankers)
            items.sort(sorter);

          return items;
        }
     }
   })