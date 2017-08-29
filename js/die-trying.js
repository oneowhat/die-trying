var dt = (function() {

  'use strict';

  var bgCanvas,
      bgCtx,
      heroCanvas,
      heroCtx,
      enemyCanvas,
      enemyCtx,
      game,
      imagesLoaded = false;

  var logPoll = 100;
  
  function byId(id) {
    return document.getElementById(id);
  }

  function Game() { }

  Game.prototype.init = function() {
    bgCanvas = byId("bg");
    heroCanvas = byId("hero");
    enemyCanvas = byId("enemy");

    if (!bgCanvas.getContext)
      return false;

    this.bg = new Background(bgCanvas, 0, 0);
    this.hero = new Hero(heroCanvas, 320, 400, 40, 40);
    this.enemy = new Enemy(enemyCanvas, 250, -100, 200, 150);
    this.quadTree = new QuadTree({
      x: 0,
      y: 0,
      width: bgCanvas.width,
      height: bgCanvas.height
    });

    return true;
  };

  Game.prototype.start = function() {
    this.hero.draw();
    this.enemy.draw();
    animate();
  };

  Game.prototype.detectCollision = function() {
    var i;
    var heroHazards = this.quadTree.couldCollideWith(this.hero);
    var enemyHazards = this.quadTree.couldCollideWith(this.enemy);
    var collide, overlapping;

    for (i = 0; i < enemyHazards.length; i ++) {
      collide = this.enemy.canCollideWith(enemyHazards[i]);
      overlapping = this.areOverlapping(this.enemy, enemyHazards[i]);
      if (collide && overlapping) {
        this.enemy.isColliding = true;
        enemyHazards[i].isColliding = true;
      }
    }
  };

  Game.prototype.areOverlapping = function(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width
      && obj1.x + obj1.width > obj2.x
      && obj1.y < obj2.y + obj2.height
      && obj1.y + obj1.height > obj2.y;
  };

  function animate() {
    var i;
    var qt = game.quadTree;
    var heroBullets = game.hero.bulletPool.getItems();

    qt.clear();
    qt.insert(game.hero);
    for(i = 0; i < heroBullets.length; i++) {
      qt.insert(heroBullets[i]);
    }
    qt.insert(game.enemy);

    //qt.insert(game.enemyPool.getPool());
    //qt.insert(game.enemyBulletPool.getPool());
    game.detectCollision();

    requestAnimationFrame(animate);
    game.bg.draw();
    game.hero.move();
    game.enemy.move();
    game.hero.bulletPool.animate();
    
  }

  return {
    init: function() {
      images.load(function() {
        game = new Game();
        if (game.init()) {
          game.start();
        }
        document.onkeydown = function(e) {
          game.hero.setKeyStatus(e, true);
        };
        document.onkeyup = function(e) {
          game.hero.setKeyStatus(e, false);
        };
      });
    },
    area: Area
  };

})();
