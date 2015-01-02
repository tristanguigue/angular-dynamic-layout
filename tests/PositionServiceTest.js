
describe('PositionService', function(){
    
    beforeEach(module('isoGrid'));
    
    it('check that apply function exists', inject(function(PositionService){ 
            expect( PositionService.apply ).not.toEqual(null);
    }));


    it('check that positions work properly',
      inject(function(PositionService) {

        var items = [
          {
            id : 1,
            color : 'red',
            atomicNumber : 45.65,
            height : 10,
            width : 100
          },
          {
            id : 2,
            color : 'green',
            atomicNumber : 4.2,
            height : 20,
            width : 100
          },
          {
            id : 3,
            color : 'black',
            atomicNumber : 4,
            height : 150,
            width : 100
          },
          {
            id : 4,
            color : 'grey',
            atomicNumber : 60,
            height : 60,
            width : 200
          },
          {
            id : 5,
            color : 'grey',
            atomicNumber : 1.8,
            height : 30,
            width : 100
          },
        ];

        // Disable DOM manipulation
        spyOn(PositionService, 'getItemsDimensionFromDOM')
            .and.returnValue(items);
        spyOn(PositionService, 'applyToDOM');

        // Test that items were properly set up in the grid
        // Input : list of items with their dimensions (width, height)
        // Output : x,y of each item
        
        PositionService.layout(300);

        expect(columns[0].length).toEqual(3);
        expect(columns[1].length).toEqual(2);
        expect(columns[2].length).toEqual(1);

        expect(columns[0][0].id).toEqual(1);
        expect(columns[0][1].id).toEqual(4);
        expect(columns[0][2].id).toEqual(5);

        expect(columns[1][0].id).toEqual(2);
        expect(columns[1][1].id).toEqual(4);

        expect(columns[2][0].id).toEqual(3);
      }));
});

