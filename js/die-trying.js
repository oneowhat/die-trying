var dt = (function() {

  var bgCanvas,
      bgCtx,
      heroCanvas,
      heroCtx,
      enemyCanvas,
      enemyCtx,
      game,
      imagesLoaded = false;

  Object.prototype.extend = function (extension) {
    var hasOwnProperty = Object.hasOwnProperty,
        object = Object.create(this);

    for (var property in extension)
    if (hasOwnProperty.call(extension, property) ||
      typeof object[property] === "undefined")
        object[property] = extension[property];

    return object;
  };

  var Drawable = {
    padding: 0,
    speed: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    create: function() {
      var newDrawable = Object.create(this);
      return newDrawable;
    },
    init: function(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    },
    draw: function() { }
  };

  var Pool = {
    pool: [],
    create: function() {
      return Object.create(this);
    },
    animate: function() {
  		for (var i = 0; i < this.maxSize; i++) {
  			if (this.pool[i].alive) {
  				if (this.pool[i].draw()) {
  					this.pool[i].clear();
  					this.pool.push((this.pool.splice(i, 1))[0]);
  				}
  			} else {
  				break;
        }
  		}
    }
  };

  var Background = Drawable.extend({
    speed: 2,
    create: function(x, y) {
      var bg = Object.create(this)
      bg.x = x;
      bg.y = y;
      return bg;
    },
    draw: function() {
      this.y += this.speed;
      this.context.drawImage(images.bg, this.x, this.y);
      this.context.drawImage(images.bg, this.x, this.y - this.canvasHeight);
      if (this.y >= this.canvasHeight) {
        this.y = 0;
      }
    }
  });

  var Hero = Drawable.extend({
    counter: 0,
    fireRate: 7,
    keyStatus: {
      "ArrowUp": false,
      "ArrowDown": false,
      "ArrowLeft": false,
      "ArrowRight": false,
      " ": false
    },
    speed: 7,
    padding: 10,
    bulletPool: {},
    create: function(x, y, width, height) {
      var newHero = Object.create(this);
      newHero.init(x, y, width, height);
      newHero.bulletPool = BulletPool.create(60);
      newHero.bulletPool.init();
      return newHero;
    },
    draw: function () {
      this.context.drawImage(images.hero, this.x, this.y);
    },
    move: function () {
      this.counter++;
      if (this.moveKeyActive()) {
        this.context.clearRect(this.x, this.y, this.width, this.height);
        if (this.keyStatus.ArrowDown) {
          this.y += this.speed;
        }
        if (this.keyStatus.ArrowUp) {
          this.y -= this.speed;
        }
        if (this.keyStatus.ArrowLeft) {
          this.x -= this.speed;
        }
        if (this.keyStatus.ArrowRight) {
          this.x += this.speed;
        }
        checkInbounds(this);
      }
      if (this.keyStatus[" "] && this.fireRate < this.counter) {
        this.fire();
        this.counter = 0;
      }
    },
    setKeyStatus: function(e, status) {
      if (e.key in this.keyStatus) {
        e.preventDefault();
        this.keyStatus[e.key] = status;
      }
    },
    fire: function() {
      var bl = { x: this.x + 5, y: this.y + 15, speed: 10 };
      var br = { x: this.x + 33, y: this.y + 15, speed: 10 };
      this.bulletPool.fire(bl, br);
    },
    moveKeyActive: function() {
      return this.keyStatus.ArrowDown
        || this.keyStatus.ArrowUp
        || this.keyStatus.ArrowLeft
        || this.keyStatus.ArrowRight;
    }
  });

  var Enemy = Drawable.extend({
    counter: 0,
    currentPhase: null,
    movementPhases: {
      "enter": { speedX: 0, speedY: 1, stop: 150, next: "wait" },
      "wait": { speedX: 0, speedY: 0, stop: 120, next: "leave" },
      "leave": { speedX: 0, speedY: -1, stop: 200 }
    },
    speed: 4,
    movePhase: {},
    create: function(x, y, width, height) {
      var enemy = Object.create(this);
      enemy.init(x, y, width, height);
      enemy.movePhase = this.movementPhases.enter;
      return enemy;
    },
    draw: function () {
      this.context.drawImage(images.enemy, this.x, this.y);
    },
    move: function () {
      this.counter++;
      this.context.clearRect(this.x, this.y, this.width, this.height);

      if(this.movePhase && this.counter <= this.movePhase.stop) {
        this.y += this.movePhase.speedY;
      } else {
        this.counter = 0;
        if(this.movePhase.next) {
          this.movePhase = this.movementPhases[this.movePhase.next];
        }
      }
      this.draw();
    }
  });

  var Bullet = Drawable.extend({
    alive: false,
    create: function(x, y, width, height) {
      var bullet = Object.create(this);
      bullet.init(x, y, width, height);
      return bullet;
    },
    draw: function() {
      this.context.clearRect(this.x, this.y, this.width, this.height);
      this.y -= this.speed;
      if(this.y <= 0) {
        return true;
      } else {
        this.context.drawImage(images.bullet, this.x, this.y, this.width, this.height);
      }
    },
    spawn: function(x, y, speed) {
      this.alive = true;
      this.x = x;
      this.y = y;
      this.speed = speed;
    },
    clear: function () {
      this.alive = false;
    }
  });

  var BulletPool = Pool.extend({
    maxSize: 0,
    create: function(maxSize) {
      var bp = Object.create(this);
      bp.maxSize = maxSize;
      return bp;
    },
    init: function() {
      for (var i = 0; i < this.maxSize; i++) {
        var bullet = Bullet.create(0, 0, images.bullet.width, images.bullet.height);
        this.pool.push(bullet);
      }
    },
    getOne: function(b) {
      if(!this.pool[this.maxSize - 1].alive) {
        this.pool[this.maxSize - 1].spawn(b.x, b.y, b.speed);
        this.pool.unshift(this.pool.pop());
      }
    },
    fire: function(bl, br) {
      if(!this.pool[this.maxSize - 1].alive && !this.pool[this.maxSize - 2].alive) {
  			this.getOne(bl);
  			this.getOne(br);
  		}
    }
  });

  var Game = {
    bg: {},
    hero: {},
    enemy: {},
    create: function() {
      return Object.create(this);
    },
    init: function() {
      bgCanvas = byId("bg");
      heroCanvas = byId("hero");
      enemyCanvas = byId("enemy");

      if(!bgCanvas.getContext)
        return false;

      bgCtx = bgCanvas.getContext("2d");
      heroCtx = heroCanvas.getContext("2d");
      enemyCtx = enemyCanvas.getContext("2d");

      Background.context = bgCtx;
      Background.canvasWidth = bgCanvas.width;
      Background.canvasHeight = bgCanvas.height;

      Hero.context = heroCtx;
      Hero.canvasWidth = heroCanvas.width;
      Hero.canvasHeight = heroCanvas.height;

      Bullet.context = enemyCtx;
      Bullet.canvasWidth = enemyCanvas.width;
      Bullet.canvasHeight = enemyCanvas.height;

      Enemy.context = enemyCtx;
      Enemy.canvasWidth = enemyCanvas.width;
      Enemy.canvasHeight = enemyCanvas.height;

      this.bg = Background.create(0, 0);
      this.hero = Hero.create(320, 400, 40, 40);
      this.enemy = Enemy.create(250, -100, 200, 150);

      return true;
    },

    start: function () {
      this.hero.draw();
      this.enemy.draw();
      animate();
    }
  }

  function checkInbounds(drawable) {
    var d = drawable;
    if (d.x < d.padding) {
      d.x = d.padding;
    }
    if ((d.x + d.width) > (d.canvasWidth - d.padding)) {
      d.x = (d.canvasWidth - d.padding - d.width);
    }
    if (d.y < d.padding) {
      d.y = d.padding;
    }
    if ((d.y + d.height) > (d.canvasHeight - d.padding)) {
      d.y = (d.canvasHeight - d.padding - d.height);
    }
    d.draw();
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function animate() {
    requestAnimationFrame(animate);
    game.bg.draw();
    game.hero.move();
    game.enemy.move();
    game.hero.bulletPool.animate();
  }

  return {
    init: function() {
      images.load(function() {

        game = Game.create();

        if(game.init()) {
          game.start();
        }

        document.onkeydown = function(e) {
          game.hero.setKeyStatus(e, true);
        }

        document.onkeyup = function(e) {
          game.hero.setKeyStatus(e, false);
        }

      });
    }
  }

})();
