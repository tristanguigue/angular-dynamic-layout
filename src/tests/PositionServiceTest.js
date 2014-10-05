
describe('PositionService', function(){
    
    beforeEach(module('isoGrid'));
    
    it('check that apply function exists', inject(function(PositionService){ 
            expect( PositionService.apply ).not.toEqual(null);
    }))


    it('check that rankers work properly',
      inject(function(PositionService) {

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
        
        var itemsRes = PositionService.apply(angular.copy(items), "default");


      }));
});

