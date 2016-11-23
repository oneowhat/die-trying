var TOTAL_ASSETS = 4;

var images = new function() {
  var assetsLoaded = 0;

  this.bg = new Image();
  this.hero = new Image();
  this.enemy = new Image();
  this.bullet = new Image();

  this.bg.src = "static/images/bg-1.png";
  this.hero.src = "static/images/hero.png";
  this.enemy.src = "static/images/enemy-1.png";
  this.bullet.src = "static/images/bullet.png";

  this.bg.onload = function() {
    imageLoaded();
  };
  this.hero.onload = function() {
    imageLoaded();
  };
  this.enemy.onload = function() {
    imageLoaded();
  };
  this.bullet.onload = function() {
    imageLoaded();
  };

  function imageLoaded() {
    assetsLoaded++;
    if(assetsLoaded === TOTAL_ASSETS) {
      window.init();
    }
  }
}
