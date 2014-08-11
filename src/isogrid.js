var isoGridModule = angular.module('isoGrid', []);

     .factory('FilterService', function () {
      var COMPARATORS = ['=', '<', '>']


      return {
        apply: function (items, filters) {
          for(it in items){
            var itemPass = true;
            for(i in filters){
              var andGroup = filters[i];
              var foundTrue = false;
              for(j in andGroup){
                var orGroup = andGroup[j];
                if(typeof(orGroup) == "function"){
                  if(orGroup(item)){
                    foundTrue = true;
                    break;
                  }
                }else{

                }
              }
              if(!foundTrue){
                itemPass = false;
                break;                
              }
            } 
            if(!itemPass)
              items[i].showing = false;
            else 
              items[i].showing = true;
          }
        }
      };
    })

