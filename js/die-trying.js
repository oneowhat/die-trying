var bgCanvas;
var bgCtx;
var heroCanvas;
var heroCtx;
var enemyCanvas;
var enemyCtx;
var game;
var imagesLoaded = false;

function byId(id) {
  return document.getElementById(id);
}

function Drawable() {
  this.init = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  this.padding = 0;
  this.speed = 0;
  this.canvasWidth = 0;
  this.canvasHeight = 0;

  this.draw = function() { };
}

function Pool() {
  this.maxSize = 0;
  this.pool = [];

  this.init = function() { };

  this.animate = function() {
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
  };
}

function Background() {
  this.speed = 2;
  this.draw = function() {
    this.y += this.speed;
    this.context.drawImage(images.bg, this.x, this.y);
    this.context.drawImage(images.bg, this.x, this.y - this.canvasHeight);
    if (this.y >= this.canvasHeight) {
      this.y = 0;
    }
  };
}
Background.prototype = new Drawable();

function Hero() {

  var counter = 0;
  var fireRate = 7;
  var keyStatus = {
    "ArrowUp": false,
    "ArrowDown": false,
    "ArrowLeft": false,
    "ArrowRight": false,
    " ": false
  };

  this.speed = 7;
  this.padding = 10;
  this.bulletPool = new BulletPool(60);
  this.bulletPool.init();

  this.draw = function () {
    this.context.drawImage(images.hero, this.x, this.y);
  };

  this.move = function () {
    counter++;
    if (moveKeyActive()) {
      this.context.clearRect(this.x, this.y, this.width, this.height);
      if (keyStatus.ArrowDown) {
        this.y += this.speed;
      }
      if (keyStatus.ArrowUp) {
        this.y -= this.speed;
      }
      if (keyStatus.ArrowLeft) {
        this.x -= this.speed;
      }
      if (keyStatus.ArrowRight) {
        this.x += this.speed;
      }
      checkInbounds(this);
    }
    if (keyStatus[" "] && fireRate < counter) {
      this.fire();
      counter = 0;
    }
  };

  this.setKeyStatus = function(e, status) {
    if (e.key in keyStatus) {
      e.preventDefault();
      keyStatus[e.key] = status;
    }
  }

  this.fire = function() {
    var bl = { x: this.x + 5, y: this.y + 15, speed: 10 };
    var br = { x: this.x + 33, y: this.y + 15, speed: 10 };
    this.bulletPool.fire(bl, br);
  };

  function moveKeyActive() {
    return keyStatus.ArrowDown
      || keyStatus.ArrowUp
      || keyStatus.ArrowLeft
      || keyStatus.ArrowRight;
  }
}
Hero.prototype = new Drawable();

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

function Enemy() {
  var counter = 0;
  var currentPhase;

  this.movementPhases = {
    "enter": { speedX: 0, speedY: 1, stop: 150, next: "wait" },
    "wait": { speedX: 0, speedY: 0, stop: 120, next: "leave" },
    "leave": { speedX: 0, speedY: -1, stop: 200 }
  };

  this.speed = 4;
  this.movePhase = this.movementPhases.enter;

  this.draw = function () {
    this.context.drawImage(images.enemy, this.x, this.y);
  };

  this.move = function () {
    counter++;
    this.context.clearRect(this.x, this.y, this.width, this.height);

    if(this.movePhase && counter <= this.movePhase.stop) {
      this.y += this.movePhase.speedY;
    } else {
      counter = 0;
      if(this.movePhase.next) {
        this.movePhase = this.movementPhases[this.movePhase.next];
      }
    }
    this.draw();
  }
}
Enemy.prototype = new Drawable();

function Bullet() {

  this.alive = false;

  this.draw = function() {
    this.context.clearRect(this.x, this.y, this.width, this.height);
    this.y -= this.speed;
    if(this.y <= 0) {
      return true;
    } else {
      this.context.drawImage(images.bullet, this.x, this.y, this.width, this.height);
    }
  };

  this.spawn = function(x, y, speed) {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.speed = speed;
  };

  this.clear = function () {
    this.alive = false;
  };
}
Bullet.prototype = new Drawable();

function BulletPool(maxSize) {

  this.maxSize = maxSize;

  this.init = function() {
    for (var i = 0; i < this.maxSize; i++) {
      var bullet = new Bullet();
      bullet.init(0, 0, images.bullet.width, images.bullet.height);
      this.pool.push(bullet);
    }
  };

  this.getOne = function(b) {
    if(!this.pool[this.maxSize - 1].alive) {
      this.pool[this.maxSize - 1].spawn(b.x, b.y, b.speed);
      this.pool.unshift(this.pool.pop());
    }
  };

  this.fire = function(bl, br) {
    if(!this.pool[this.maxSize - 1].alive && !this.pool[this.maxSize - 2].alive) {
			this.getOne(bl);
			this.getOne(br);
		}
  };
}
BulletPool.prototype = new Pool();

function Game() {

  this.init = function() {

    bgCanvas = byId("bg");
    heroCanvas = byId("hero");
    enemyCanvas = byId("enemy");

    if (bgCanvas.getContext) {

      bgCtx = bgCanvas.getContext("2d");
      heroCtx = heroCanvas.getContext("2d");
      enemyCtx = enemyCanvas.getContext("2d");

      Background.prototype.context = bgCtx;
      Background.prototype.canvasWidth = bgCanvas.width;
      Background.prototype.canvasHeight = bgCanvas.height;

      Hero.prototype.context = heroCtx;
      Hero.prototype.canvasWidth = heroCanvas.width;
      Hero.prototype.canvasHeight = heroCanvas.height;

      Bullet.prototype.context = enemyCtx;
      Bullet.prototype.canvasWidth = enemyCanvas.width;
      Bullet.prototype.canvasHeight = enemyCanvas.height;

      Enemy.prototype.context = enemyCtx;
      Enemy.prototype.canvasWidth = enemyCanvas.width;
      Enemy.prototype.canvasHeight = enemyCanvas.height;

      this.bg = new Background();
      this.bg.init(0, 0);

      this.hero = new Hero();
      this.hero.init(320, 400, 40, 40);

      this.enemy = new Enemy();
      this.enemy.init(250, -100, 200, 150);

      return true;

    } else {
      return false;
    }
  }

  this.start = function () {
    this.hero.draw();
    this.enemy.draw();
    animate();
  }
}

document.onkeydown = function(e) {
  game.hero.setKeyStatus(e, true);
}

document.onkeyup = function(e) {
  game.hero.setKeyStatus(e, false);
}

function animate() {
  requestAnimationFrame(animate);
  game.bg.draw();
  game.hero.move();
  game.enemy.move();
  game.hero.bulletPool.animate();
}
