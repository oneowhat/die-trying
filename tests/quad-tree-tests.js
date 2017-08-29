'use strict';

var expect = chai.expect;

describe('QuadTree', function() {

  var sandbox;
  var qt;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(window.console, "error");
    qt = new QuadTree({ x: 0, y: 0, height: 100, width: 100}, 3);
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('exists', function() {
    var exists = typeof QuadTree === 'function';
    expect(exists).to.be.true;
  });

  describe('constructor', function() {
    it('Logs error if area is not passed', function() {
      QuadTree();
      sinon.assert.calledOnce(console.error);
    });
  });

  describe('#split', function() {
    it('should split itself into 4 nodes', function() {
      qt.split();
      expect(qt.nodes.length).to.equal(4);
    });
    it('each node should have an area 1/4 of the original area', function() {
      var totalArea = qt.area.height * qt.area.width;
      qt.split();
      var nodeArea = 0;
      qt.nodes.forEach(function(node) {
        nodeArea += node.area.height * node.area.width;
      });
      expect(totalArea).to.equal(nodeArea);
    });
  });

  describe('indexOf', function() {
    it('should return 1 if object can fit in top left quadrant', function() {
      var small = { x: 1, y: 1, width: 7, height: 7 };
      var bigger = { x: 1, y: 1, width: 48, height: 48 };
      expect(qt.indexOf(small)).to.equal(1); 
      expect(qt.indexOf(bigger)).to.equal(1); 
    });
    it('should return 0 if object can fit in top right quadrant', function() {
      var areaToCheck = { x: 51, y: 1, width: 7, height: 7 };
      var actual = qt.indexOf(areaToCheck);
      expect(actual).to.equal(0); 
    });
    it('should return 3 if object can fit in bottom right quadrant', function() {
      var areaToCheck = { x: 51, y: 51, width: 7, height: 7 };
      var actual = qt.indexOf(areaToCheck);
      expect(actual).to.equal(3); 
    });
    it('should return 2 if object can fit in bottom left quadrant', function() {
      var areaToCheck = { x: 1, y: 51, width: 7, height: 7 };
      var actual = qt.indexOf(areaToCheck);
      expect(actual).to.equal(2); 
    });
  });

  describe('#insert', function() {
    it('should insert an item to objects if there is space', function() {
      var item = { x: 3, y: 3, width: 10, height: 10 };
      var item2 = { x: 56, y: 24, width: 10, height: 10 };
      var item3 = { x: 33, y: 78, width: 10, height: 10 };
      qt.insert(item);
      qt.insert(item2);
      qt.insert(item3);
      expect(qt.objects.length).to.equal(3);
    });
    it('should should split if it exceeds maxObjects', function() {
      var item = { x: 3, y: 3, width: 10, height: 10 };
      var item2 = { x: 56, y: 24, width: 10, height: 10 };
      var item3 = { x: 33, y: 78, width: 10, height: 10 };
      var item4 = { x: 1, y: 1, width: 1, height: 1 };
      qt.insert(item);
      qt.insert(item2);
      qt.insert(item3);
      qt.insert(item4);
      expect(qt.nodes.length).to.equal(4);
      expect(qt.objects.length).to.equal(0);
    });
    it('should add 3 identical items, adding to objects', function() {
      var i = 0;
      while (i < 3) {
        qt.insert({ x: 1, y: 1, height: 10, width: 10 });
        i++;
      }
      expect(qt.objects.length).to.equal(3);
    });
  });

  describe('#couldCollideWith', function() {
    it('should return a list of items in the same area as the item passed in', function() {
      var i = 0, results = [];
      var ship = { x: 25, y: 25, width: 10, height: 12 };
      var bullet1 = { x: 30, y: 30, width: 5, height: 5 };
      var bullet2 = { x: 35, y: 35, width: 5, height: 5 };
      var bullet3 = { x: 1, y: 1, width: 5, height: 5 };
      qt.insert(bullet1);
      qt.insert(bullet2);
      qt.insert(bullet3);
      while(i < 100) {
        qt.insert({ x: i, y: i, width: 5, height: 5 });
        i++;
      }
      results = qt.couldCollideWith(ship);
      expect(results.length).to.equal(36);
    });
  });
  
  describe('#clear', function() {
    it('should should empty the tree and all its nodes', function() {
      var i = 0;
      while(i < 100) {
        qt.insert({ x: i, y: i, width: 5, height: 5 });
        i++;
      }
      qt.clear();
      expect(qt.objects.length).to.equal(0);
      expect(qt.nodes.length).to.equal(0);
    });
  });

});