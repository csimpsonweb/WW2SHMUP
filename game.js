
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  create: function () {

    this.sea = this.add.tileSprite(0, 0, 1024, 768, 'sea');

    // The main elements to "create" have now been refactored out to individual functions
    // it contains the bullet array state for reference throught the code
    this.setupPlayer();
    this.setupEnemies();
    this.setupBullets();
    this.setupExplosions();
    this.setupText();

    this.cursors = this.input.keyboard.createCursorKeys();

  },
    /*
  -============- Create Functions -============-
  */
  setupPlayer: function(){
    this.player = this.add.sprite(400, 650, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('fly', [ 0, 1, 2 ], 20, true);
    this.player.play('fly');
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.speed = 300;
    this.player.body.collideWorldBounds = true;
    /*
        This hitbox is pretty small, but it’s still on par with other shoot em ups
        (some “bullet hell” type games even have a 1 pixel hitbox).
        Feel free to increase this if you want a challenge.
        Use the debug body function if you need to see your sprite’s actual hitbox size.
    */
    // 20 x 20 pixel hitbox, centered a little bit higher than the center
    this.player.body.setSize(20, 20, 0, -5);

    /*
    This creates a single enemy

        this.enemy = this.add.sprite(512, 300, 'greenEnemy');
        this.enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
        this.enemy.play('fly');
        this.enemy.anchor.setTo(0.5, 0.5);
        this.physics.enable(this.enemy, Phaser.Physics.ARCADE);
        this.player.speed = 300;
        this.player.body.collideWorldBounds = true;
    /*
    // end
    */
  },
  setupEnemies: function(){
    // Here we create the enemy Group/ Pool and set it as we would normally
    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(50, 'greenEnemy');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    // Set the animation for each sprite
    this.enemyPool.forEach(function (enemy) {
    enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
    });
    this.nextEnemyAt = 0;
    this.enemyDelay = 1000;
    /*
    // end
    */
  },
  setupBullets: function(){
    // code: 1
    // This forms an empty array to store the bullets
    // see update for call
    // this.bullets = [];
    /*
    This is now the bullet group we create the group here
    */
    // Add an empty sprite group into our game
    this.bulletPool = this.add.group();
    // Enable physics to the whole sprite group
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    // Add 100 'bullet' sprites in the group.
    // By default this uses the first frame of the sprite sheet and
    // sets the initial state as non-existing (i.e. killed/dead)
    this.bulletPool.createMultiple(100, 'bullet');
    // Sets anchors of all sprites
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    // Automatically kill the bullet sprites when they go out of bounds
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);
    this.nextShotAt = 0;
    this.shotDelay = 100;
    /*
    // end
    */
  },
  setupExplosions: function(){
    /*
      Our explosions are also a possible memory leak.
      Let’s fix that and also do a bit of refactoring in the process
    */
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(100, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    this.explosionPool.forEach(function (explosion) {
    explosion.animations.add('boom');
    });
    /*
    // end
    */
  },
  setupText: function(){
    this.instructions = this.add.text( 510, 600,
    'Use Arrow Keys to Move, Press Z to Fire\n' +
    'Tapping/clicking does both',
    { font: '20px monospace', fill: '#fff', align: 'center' }
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + 10000;
  },

  /*
  -============- Update Functions -============-
  */

  checkCollisions: function(){
    // the single bullet overlay method
    //this.physics.arcade.overlap(this.bullet, this.enemy, this.enemyHit, null, this);
    /*
    code: 3
    the array bullet method
    this is the code used to overlap grouped bullets it passes them into the empty array
    
    for (var i = 0; i < this.bullets.length; i++) {
    this.physics.arcade.overlap(this.bullets[i], this.enemy, this.enemyHit, null, this);
    }
    /*
    // end
    */
    // *********************** SORT THIS OUT ***********************
    // This now overlaps the bulletpool with the enemy
    this.physics.arcade.overlap(
    /*
    code:4
    this connects the bullet pool with the enemy as a single
    // this.bulletPool, this.enemy, this.enemyHit, null, this
    */
    // Now we call the bullet pool - on the enemy pool 
    this.bulletPool, this.enemyPool, this.enemyHit, null, this
    );
    /*
    // end
    */
    this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);
    // *********************** END OF SORT THIS OUT ***********************
  },
  spawnEnemies: function(){
    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
        this.nextEnemyAt = this.time.now + this.enemyDelay;
        var enemy = this.enemyPool.getFirstExists(false);
        // spawn at a random location top of the screen
        enemy.reset(this.rnd.integerInRange(20, 1004), 0);
        // also randomize the speed
        enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
        enemy.play('fly');
    }
  },
  processPlayerInput: function(){
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    //console.log(this.player.speed);
    //console.log(this.player.body.velocity.x);
    //console.log(this.player.body.velocity.y);
    if (this.cursors.left.isDown) {
    this.player.body.velocity.x = -this.player.speed;
    } else if (this.cursors.right.isDown) {
    this.player.body.velocity.x = this.player.speed;
    }
    if (this.cursors.up.isDown) {
    this.player.body.velocity.y = -this.player.speed;
    } else if (this.cursors.down.isDown) {
    this.player.body.velocity.y = this.player.speed;
    }
    //point based movement
    //if (this.game.input.activePointer.isDown && this.game.physics.arcade.distanceToPointer(this.player) > 15) {
    //this.game.physics.arcade.moveToPointer(this.player, this.player.speed);
    //}
    // Using Z as the fire Key
    if (this.input.keyboard.isDown(Phaser.Keyboard.Z) ||
    this.input.activePointer.isDown) {
    this.fire();
    }
  },
  processDelayedEffects: function(){
    //check that the instructions dissapear after 10 seconds
    if (this.instructions.exists && this.time.now > this.instExpire) {
    this.instructions.destroy();
    }
  },
    /*
  -============- The Update Function -============-
  */
  update: function () {
    // Slowly scrolls the background
    this.sea.tilePosition.y += 0.2;
    // all the usual suspects have now been refdactored out above
    this.checkCollisions();
    this.spawnEnemies();
    this.processPlayerInput();
    this.processDelayedEffects();
  },
      /*
  -============- Functions to handle Gameplay -============-
  */
  fire: function() {

    if (!this.player.alive || this.nextShotAt > this.time.now) {
    return;
    }
    if (this.bulletPool.countDead() === 0) {
    return;
    }

    this.nextShotAt = this.time.now + this.shotDelay;
    /*
    code:2
    relates to the this.bullets = []; call in create
    unused now as were using groups

    var bullet = this.add.sprite(this.player.x, this.player.y - 20, 'bullet');
    bullet.anchor.setTo(0.5, 0.5);
    this.physics.enable(bullet, Phaser.Physics.ARCADE);
    bullet.body.velocity.y = -500;
    this.bullets.push(bullet);
    */

    // Find the first dead bullet in the pool
    var bullet = this.bulletPool.getFirstExists(false);
    // Reset (revive) the sprite and place it in a new location
    bullet.reset(this.player.x, this.player.y - 20);
    bullet.body.velocity.y = -500;

  },
  enemyHit: function (bullet, enemy) {
    console.log('contact');
    bullet.kill();
    enemy.kill();

    var explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('boom');
    explosion.play('boom', 15, false, true);
  },
  playerHit: function (player, enemy) {
    enemy.kill();
    var explosion = this.add.sprite(player.x, player.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('boom');
    explosion.play('boom', 15, false, true);
    player.kill();
  },
      /*
  -============- The "render" Function -============-
  */
  // I need to use this function Waaaaaay more!!
  render: function() {
    //this.game.debug.body(this.bullet);
    //this.game.debug.body(this.enemy);
    this.game.debug.body(this.player);

  },
    /*
  -============- The Function to handle the end game state -============-
  */
  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};
