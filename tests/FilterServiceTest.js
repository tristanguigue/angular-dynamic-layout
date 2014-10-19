
describe('FilterService', function(){
    
    beforeEach(module('isoGrid'));
    
    it('check that apply function exists', inject(function(FilterService){ 
            expect( FilterService.apply ).not.toEqual(null);
    }));


    it('check that filters work properly',
      inject(function(FilterService) {

        var items = [
          {
            id : 1,
            color : 'red',
            atomicNumber : 45.65
          },
          {
            id : 2,
            color : 'green',
            atomicNumber : 4.2
          },
          {
            id : 3,
            color : 'black',
            atomicNumber : 4
          },
          {
            id : 4,
            color : 'grey',
            atomicNumber : 60
          },
          {
            id : 5,
            color : 'grey',
            atomicNumber : 1.8
          },
        ];

        var filters = [ // an AND goup compose of OR groups
          [ // an OR group compose of statements
            ['color', '=', 'grey'], // A statement
            ['color', '=', 'black']
          ],
          [ // a second OR goup composed of statements
            ['atomicNumber', '<', 3]
          ]
        ];

        var itemsRes = FilterService.apply(angular.copy(items), filters);
       
        expect( itemsRes[0].showing ).toBe(false);
        expect( itemsRes[1].showing ).toBe(false);
        expect( itemsRes[2].showing ).toBe(false);
        expect( itemsRes[3].showing ).toBe(false);
        expect( itemsRes[4].showing ).toBe(true);

        var myCustomFilter = function(item){
          if(item.color != 'red')
            return true;
          else
            return false;
        };

        filters = [
          [myCustomFilter]
        ];

        itemsRes = FilterService.apply(angular.copy(items), filters);
        expect( itemsRes[0].showing ).toBe(false);
        expect( itemsRes[1].showing ).toBe(true);
        expect( itemsRes[2].showing ).toBe(true);
        expect( itemsRes[3].showing ).toBe(true);
        expect( itemsRes[4].showing ).toBe(true);

      }));
});

