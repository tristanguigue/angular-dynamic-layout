
describe('FilterService', function(){
    
    beforeEach(module('isoGrid'));
    
    it('check that apply function exists', inject(function(FilterService){ 
            expect( FilterService.get() ).not.toEqual(null);
    }))


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

        var filters = [
          [color, '=', 'grey'],
          [atomicNumber, '<', 3]
          ];

        var items = FilterService.apply(angular.copy(items), filters);
        expect( items[0].showing ).toBe(false);
        expect( items[1].showing ).toBe(false);
        expect( items[2].showing ).toBe(false);
        expect( items[3].showing ).toBe(false);
        expect( items[4].showing ).toBe(true);

        var myCustomFilter = function(item){
          if(item.color != 'red')
            return true;
          else
            return false;
        }

        var filters = [
          [myCustomFilter]
        ]

        var items = FilterService.apply(angular.copy(items), filters);
        expect( items[0].showing ).toBe(false);
        expect( items[1].showing ).toBe(true);
        expect( items[2].showing ).toBe(true);
        expect( items[3].showing ).toBe(true);
        expect( items[4].showing ).toBe(true);

      }));
});

