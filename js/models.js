(function(exports) {

  'use strict';

  function Area (x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
  }

  function Drawable (canvas, x, y, width, height) {
    Area.call(this, x, y, width, height);
    this.context = canvas.getContext("2d");
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.padding = 0;
    this.speed = 0;
    this.collidableWith = "";
    this.collidableType = "";
    this.isColliding = false;
  }

  Drawable.prototype.canCollideWith = function(object) {
    return this.collidableWith === object.collidableType;
  };

  Drawable.prototype.drawInbounds = function() {
    if (this.x < this.padding) {
      this.x = this.padding;
    }
    if (this.x + this.width > this.canvasWidth - this.padding) {
      this.x = this.canvasWidth - this.padding - this.width;
    }
    if (this.y < this.padding) {
      this.y = this.padding;
    }
    if (this.y + this.height > this.canvasHeight - this.padding) {
      this.y = this.canvasHeight - this.padding - this.height;
    }
    this.draw();
  };

  function Pool(maxSize) {
    this.pool = [];
    this.maxSize = maxSize || 0;
  }

  Pool.prototype = {
    constructor: Pool,
    animate: function() {
      for (var i = 0; i < this.maxSize; i++) {
        if (this.pool[i].alive) {
          this.pool[i].move();
              
          if (this.pool[i].isColliding || this.pool[i].y <= 0) {
            this.pool[i].clear();
            this.pool.push((this.pool.splice(i, 1))[0]);
          } else {
            this.pool[i].draw();
          }
        }
      }
    },
    getItems: function() {
      return this.pool;
    }
  };

  function Background (canvas, x, y) {    
    if (!canvas) {
      console.error('Background missing canvas');
      return;
    }
    Drawable.call(this, canvas, x, y);
    this.speed = 2;
  }

  Background.prototype = Object.create(Drawable.prototype, {
    constructor: {
      configurable: true,
      enumerable: true,
      value: Background,
      writable: true
    }
  });

  Background.prototype.draw = function() {
    this.y += this.speed;
    this.context.drawImage(images.bg, this.x, this.y);
    this.context.drawImage(images.bg, this.x, this.y - this.canvasHeight);
    if (this.y >= this.canvasHeight) {
      this.y = 0;
    }
  };

  function Hero(canvas, x, y, width, height) {
    if (!canvas) {
      console.error('Hero missing canvas');
      return;
    }
    if (!x) {
      console.error('Hero missing x');
    }
    if (!y) {
      console.error('Hero missing y');
    }
    if (!width) {
      console.error('Hero missing width');
    }
    if (!height) {
      console.error('Hero missing height');
    }
    Drawable.apply(this, arguments);
    this.collidableType = "hero";
    this.collidableWith = "enemyBullet";
    this.counter = 0;
    this.fireRate = 7,
    this.speed = 7,
    this.padding = 10;
    this.hp = 3;
    this.bulletPool = new BulletPool(canvas, 30);
    this.keyStatus = {
      "ArrowUp": false,
      "ArrowDown": false,
      "ArrowLeft": false,
      "ArrowRight": false,
      " ": false
    };
  }

  Hero.prototype = Object.create(Drawable.prototype, {
    constructor: {
      configurable: true,
      enumerable: true,
      value: Hero,
      writable: true
    }
  });

  Hero.prototype.draw = function() {
    if (!this.isColliding)
      this.context.drawImage(images.hero, this.x, this.y);
  };

  Hero.prototype.move = function() {
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
      this.drawInbounds();
    }
    if (this.keyStatus[" "] && this.fireRate < this.counter) {
      this.fire();
      this.counter = 0;
    }
  };

  Hero.prototype.setKeyStatus = function(e, status) {
    if (e.key in this.keyStatus) {
      e.preventDefault();
      this.keyStatus[e.key] = status;
    }
  };

  Hero.prototype.fire = function() {
    var bl = { x: this.x + 5, y: this.y + 15, speed: 10 };
    var br = { x: this.x + 33, y: this.y + 15, speed: 10 };
    this.bulletPool.fire(bl, br);
  };

  Hero.prototype.moveKeyActive = function() {
    return this.keyStatus.ArrowDown
      || this.keyStatus.ArrowUp
      || this.keyStatus.ArrowLeft
      || this.keyStatus.ArrowRight;
  };

  function Enemy(canvas, x, y, width, height) {
    if (!canvas) {
      console.error('Enemy missing canvas');
      return;
    }
    if (!x) {
      console.error('Enemy missing x');
    }
    if (!y) {
      console.error('Enemy missing y');
    }
    if (!width) {
      console.error('Enemy missing width');
    }
    if (!height) {
      console.error('Enemy missing height');
    }
    Drawable.apply(this, arguments);
    this.collidableType = "enemy";
    this.collidableWith = "bullet";
    this.counter = 0;
    this.currentPhase = null;
    this.movementPhases = {
      "enter": { speedX: 0, speedY: 1, stop: 150, next: "wait" },
      "wait": { speedX: 0, speedY: 0, stop: 120, next: "leave" },
      "leave": { speedX: 0, speedY: -1, stop: 200, next: "downLeft" },
      "downLeft": { speedX: -3, speedY: 3, stop: 100, next: "right" },
      "right": { speedX: 3, speedY: 0, stop: 100, next: "upRight" },
      "upRight": { speedX: 3, speedY: -4, stop: 50, next: "downRight" },
      "downRight": { speedX: 3, speedY: 4, stop: 50, next: "up" },
      "up": { speedX: 0, speedY: -4, stop: 50, next: "downLeft" }
    },
    this.movePhase = this.movementPhases.enter;
    this.speed = 4;
  }

  Enemy.prototype = Object.create(Drawable.prototype, {
    constructor: {
      configurable: true,
      enumerable: true,
      value: Enemy,
      writable: true
    }
  });

  Enemy.prototype.draw = function () {
    this.context.drawImage(images.enemy, this.x, this.y);
  };

  Enemy.prototype.move = function () {
    this.counter++;
    this.context.clearRect(this.x, this.y, this.width, this.height);

    if (this.movePhase && this.counter <= this.movePhase.stop) {
      this.y += this.movePhase.speedY;
      this.x += this.movePhase.speedX;
    } else {
      this.counter = 0;
      if (this.movePhase.next) {
        this.movePhase = this.movementPhases[this.movePhase.next];
      }
    }
    this.draw();
  };
  

  function Bullet(canvas, x, y, width, height) {
    if (!canvas) {
      console.error('Bullet missing canvas');
      return;
    }
    Drawable.apply(this, arguments);
    this.alive = false;
    this.speed = 0;
    this.isColliding = false;
    this.collidableType = "bullet";
    this.collidableWith = "enemy";
  }

  Bullet.prototype = Object.create(Drawable.prototype, {
    constructor: {
      configurable: true,
      enumerable: true,
      value: Bullet,
      writable: true
    }
  });

  Bullet.prototype.move = function() {
    this.context.clearRect(this.x, this.y, this.width, this.height);
    this.y -= this.speed;
  };

  Bullet.prototype.draw = function() {
    this.context.drawImage(images.bullet, this.x, this.y, this.width, this.height);
  };

  Bullet.prototype.spawn = function(x, y, speed) {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.speed = speed;
  };

  Bullet.prototype.clear = function () {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.alive = false;
    this.isColliding = false;
  };

  function BulletPool(canvas, maxSize) {
    if (!canvas) {
      console.error('BulletPool missing canvas');
      return;
    }
    Pool.call(this, maxSize);
    for (var i = 0; i < this.maxSize; i++) {
      var b = new Bullet(canvas, 0, 0, images.bullet.width, images.bullet.height);
      this.pool.push(b);
    }
  }

  BulletPool.prototype = Object.create(Pool.prototype, {
    constructor: {
      configurable: true,
      enumerable: true,
      value: BulletPool,
      writable: true
    }
  });    
   
  BulletPool.prototype.getOne = function(b) {
    if (this.hasBulletsAvailable(1)) {
      this.pool[this.maxSize - 1].spawn(b.x, b.y, b.speed);
      this.pool.unshift(this.pool.pop());
    }
  };

  BulletPool.prototype.fire = function(bl, br) {
    if (this.hasBulletsAvailable(2)) {
        this.getOne(bl);
        this.getOne(br);
    }
  };

  BulletPool.prototype.hasBulletsAvailable = function(nums) {
    var i = nums;
    while(i > 0) {
      if (!this.availableAtIndex(i)){
        return false;
      }
      i--;
    }
    return true;
  };

  BulletPool.prototype.availableAtIndex = function(index) {
    return !this.pool[this.maxSize - index].alive;
  };

  exports.Area = Area;
  exports.Background = Background;
  exports.Hero = Hero;
  exports.Enemy = Enemy;
  exports.Bullet = Bullet;
  exports.BulletPool = BulletPool;

})(this);