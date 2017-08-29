var images = (function() {

  'use strict';

  var TOTAL_ASSETS = 4,
      assetsLoaded = 0,
      bg = new Image(),
      hero = new Image(),
      enemy = new Image(),
      bullet = new Image(),
      cb;

  function imageLoaded() {
    assetsLoaded++;
    if(assetsLoaded === TOTAL_ASSETS) {
      cb();
    }
  }

  bg.onload = imageLoaded;
  hero.onload = imageLoaded;
  enemy.onload = imageLoaded;
  bullet.onload = imageLoaded;

  return {
    bg: bg,
    hero: hero,
    enemy: enemy,
    bullet: bullet,
    load: function(callback) {
      cb = callback;
      bg.src = "static/images/bg-1.png";
      hero.src = "static/images/hero.png";
      enemy.src = "static/images/enemy-1.png";
      bullet.src = "static/images/bullet.png";
    }
  };

})();
