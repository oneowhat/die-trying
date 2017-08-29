'use strict';

var expect = chai.expect;
var sandbox;
var canvas;
var context;
var drawImage;

function setup(callback) {
  sandbox = sinon.sandbox.create();
  canvas = document.createElement('canvas');
  context = {
    drawImage: function(){ },
    clearRect: function(){ }
  };
  drawImage = sinon.spy(context, 'drawImage');
  canvas.height = 100;
  canvas.width = 100;
  sandbox.stub(canvas, 'getContext');
  canvas.getContext.withArgs('2d').returns(context);
  sandbox.stub(window.console, "error");
  callback();
}

function tearDown() {
  sandbox.restore();
  context.drawImage.restore();
}

describe('Background', function() {
  
  var background;

  beforeEach(function() {
    setup(function() {
      background = new Background(canvas, 0, 0);
    });
  });

  afterEach(tearDown);

  describe('constructor', function() {
    it('should console log error if no canvas is passed', function() {
      var bg = new Background();
      sinon.assert.calledOnce(console.error);
    });
    it('should intitialize speed at 2', function() {
      expect(background.speed).to.equal(2);
    });
    it('should set canvasHeight to height of the canvas passed', function() {
      expect(background.canvasHeight).to.equal(canvas.height);
    });
    it('should set canvasWidth to width of the canvas passed', function() {
      expect(background.canvasWidth).to.equal(canvas.width);
    });
  });

  describe('#draw', function() {
    it('should increase y by speed if canvas height is greater than 0', function() {
      var expected = background.y + background.speed;
      background.draw();
      expect(background.y).to.equal(expected);
    });
    it('should reset y to 0 once it reaches canvasHeight', function() {
      var expected = 0;
      background.y = 99;
      background.draw();
      expect(background.y).to.equal(expected);
    });
  });
});

describe('Hero', function() {
  
  var hero;

  beforeEach(function() {
    setup(function() {
      hero = new Hero(canvas, 30, 30, 30, 30);
    });
  });
  
  afterEach(tearDown);

  describe('constructor', function() {
    it('should log error if no canvas is passed', function() {
      var h = new Hero(null, 10, 10, 10, 10);
      sinon.assert.calledOnce(console.error);
    });
    it('should log error if no x', function() {
      var h = new Hero(canvas, null, 10, 10, 10);
      sinon.assert.calledOnce(console.error);
    });
    it('should log error if no y', function() {
      var h = new Hero(canvas, 10, null, 10, 10);
      sinon.assert.calledOnce(console.error);
    });
    it('should log error if no width', function() {
      var h = new Hero(canvas, 10, 10, null, 10);
      sinon.assert.calledOnce(console.error);
    });
    it('should log error if no height', function() {
      var h = new Hero(canvas, 10, 10, 10, null);
      sinon.assert.calledOnce(console.error);
    });
    it('should set canvasHeight to height of the canvas passed', function() {
      expect(hero.canvasHeight).to.equal(canvas.height);
    });
    it('should set canvasWidth to width of the canvas passed', function() {
      expect(hero.canvasWidth).to.equal(canvas.width);
    });
    it('should intitialize fireRate at 7', function() {
      expect(hero.fireRate).to.equal(7);
    });
    it('should intitialize speed at 7', function() {
      expect(hero.speed).to.equal(7);
    });
    it('should intitialize padding at 10', function() {
      expect(hero.padding).to.equal(10);
    });
    it('should intitialize fireRate at 7', function() {
      expect(hero.fireRate).to.equal(7);
    });
  });
  describe('#moveKeyActive', function() {
    it('should return false if no arrow keys pressed', function() {
      expect(hero.moveKeyActive()).to.be.false;
    });
    it('should return true if down key is pressed', function() {
      hero.keyStatus.ArrowDown = true;
      expect(hero.moveKeyActive()).to.be.true;
    });
    it('should return true if up key is pressed', function() {
      hero.keyStatus.ArrowUp = true;
      expect(hero.moveKeyActive()).to.be.true;
    });
    it('should return true if left key is pressed', function() {
      hero.keyStatus.ArrowLeft = true;
      expect(hero.moveKeyActive()).to.be.true;
    });
    it('should return true if right key is pressed', function() {
      hero.keyStatus.ArrowRight = true;
      expect(hero.moveKeyActive()).to.be.true;
    });
  });
  describe('#move', function() {
    it('should increment counter', function() {
      var expected = hero.counter + 1;
      hero.move();
      expect(hero.counter).to.equal(expected);
    });
    it('should increase the y value if ArrowDown', function() {
      var expected = hero.y + hero.speed;
      hero.keyStatus.ArrowDown = true;
      hero.move();
      expect(hero.y).to.equal(expected);
    });
    it('should decrease the y value if ArrowUp', function() {
      var expected = hero.y - hero.speed;
      hero.keyStatus.ArrowUp = true;
      hero.move();
      expect(hero.y).to.equal(expected);
    });
    it('should decrease the x value if ArrowLeft', function() {
      var expected = hero.x - hero.speed;
      hero.keyStatus.ArrowLeft = true;
      hero.move();
      expect(hero.x).to.equal(expected);
    });
    it('should decrease the x value if ArrowRight', function() {
      var expected = hero.x + hero.speed;
      hero.keyStatus.ArrowRight = true;
      hero.move();
      expect(hero.x).to.equal(expected);
    });
    it('should fire if space bar is down', function() {
      hero.keyStatus[" "] = true;
      for(var i = 0; i < hero.fireRate + 1; i++) {
        hero.move();
      }
      expect(hero.counter).to.equal(0);
    });
    it('should not fire if space bar is down for less than the fireRate', function() {
      hero.keyStatus[" "] = true;
      for(var i = 0; i < hero.fireRate; i++) {
        hero.move();
      }
      expect(hero.counter).to.equal(7);
    });
  });
});

describe('Enemy', function() {
  describe('constructor', function() {
    
  });
});

describe('Bullet', function() {
  
  var bullet;

  beforeEach(function() {
    setup(function() {
      bullet = new Bullet(canvas, 50, 90, 40, 40);
    });
  });
  
  afterEach(tearDown);

  describe('constructor', function() {
    it('should log error if no canvas is passed', function() {
      var b = new Bullet(null, 10, 10, 10, 10);
      sinon.assert.calledOnce(console.error);
    });
  });

  describe('#spawn', function() {
    it('should set the bullet as alive', function() {
      bullet.spawn(0, 0, 7);
      expect(bullet.alive).to.be.true;
    });
    it('should set x, y & speed to the passed in values', function() {
      bullet.spawn(1, 2, 3);
      expect(bullet.x).to.equal(1);
      expect(bullet.y).to.equal(2);
      expect(bullet.speed).to.equal(3);
    });
  });

  describe('#clear', function() {
    it('should set x, y & speed to 0', function() {
      bullet.spawn(1, 2, 3);
      bullet.clear();
      expect(bullet.x).to.equal(0);
      expect(bullet.y).to.equal(0);
      expect(bullet.speed).to.equal(0);
    });
    it('should set alive & isColliding to false', function() {
      bullet.spawn(1, 2, 3);
      bullet.isColliding = true;
      bullet.clear();
      expect(bullet.alive).to.be.false;
      expect(bullet.isColliding).to.be.false;
    });
  });

  describe('#move', function() {
    it('should subtract speed from y', function() {
      bullet.spawn(50, 50, 3);
      bullet.move();
      expect(bullet.y).to.equal(47);
    });
  });

  describe('#draw', function() {
    it('should call canvas.drawImage if it is on the canvas and not colliding', function() {
      bullet.spawn(50, 50, 3);
      bullet.draw();
      sinon.assert.calledOnce(drawImage);
    });
  });
});

describe('BulletPool', function() {

  var bulletPool;

  beforeEach(function() {
    setup(function() {
      bulletPool = new BulletPool(canvas, 15);
    });
  });

  afterEach(tearDown);

  describe('constructor', function() {
    it('should console log error if no canvas is passed', function() {
      var bg = new BulletPool();
      sinon.assert.calledOnce(console.error);
    });
    it('should initialize maxSize with value passed in', function() {
      expect(bulletPool.maxSize).to.equal(15);
    });
    it('should initialize a pool of bullets at maxSize', function() {
      var actual = bulletPool.pool.length;
      expect(actual).to.equal(15);
    });
  });

  describe('#hasBulletsAvailable', function() {
    it('should return true if there are n bullets available where n is the arg', function() {
      expect(bulletPool.hasBulletsAvailable(2)).to.be.true;
    });
    it('should return false if there are not n bullets available where n is the arg', function() {
      bulletPool.pool[14].alive = true;
      expect(bulletPool.hasBulletsAvailable(2)).to.be.false;
    });
  });

  describe('#getOne', function() {
    it('should spawn the last bullet and rotate it to the first position in the pool', function() {
      var last = bulletPool.pool[bulletPool.maxSize - 1];
      bulletPool.getOne({ x: this.x + 5, y: this.y + 15, speed: 10 });
      expect(last.alive).to.be.true;
      expect(bulletPool.pool[0]).to.equal(last);
    });
  });

  describe('#fire', function() {
    it('should spawn 2 bullets', function() {
      var b1 = { x: 5, y: 15, speed: 10 };
      var b2 = { x: 5, y: 33, speed: 10 };
      bulletPool.fire(b1, b2);
      expect(bulletPool.pool[0].alive).to.be.true;
      expect(bulletPool.pool[1].alive).to.be.true;
      expect(bulletPool.pool[2].alive).to.be.false;
    });
  });
});