/**
 * @class
 * @extends {cc.Layer}
 */
var GameLayer = cc.Layer.extend(/** @lends GameLayer# */{
  _className: "GameLayer",

  score: 0,
  
  // array to store the stars
  stars: [],
  
  // the container where the stars must not overflow
  boundaries: {},
  
  // the rotation preset
  rotationPreset: {seconds: 6, angle: 360},
  
  // the texture to use in the stars
  texture: undefined,
  
  // the colors to be used in the stars //cc.color(255, 32, 32, 128)
  colors: [ cc.color(156, 39, 176, 1),
            cc.color(198, 40, 40, 1),
            cc.color(48, 63, 159, 1),
            cc.color(255, 235, 59, 1) ],

  /**
   * @constructs
   * @param {psicool.Scene} scene
   * @param {number} startingLevel
   */
  ctor: function (scene, startingLevel) {
    this._super();
    this.scene = scene;
    // By default, nodes in Cocos2D don't cascade opacity, which is needed to
    // fade in and fade out compound objects like layers.
    // Please ensure all your nodes with children have opacity cascade enabled,
    // or otherwise they will not be animated when the score screen is shown.
    this.setCascadeOpacityEnabled(true);
    window.gameLayer = this;

    // Psicool includes a handy clock object for timed games.
    this.clock = new psicool.Clock(this.scene, 45);
    // This function will be run when the time ends
    this.clock.setTimeUpListener(this.onTimeUp.bind(this));

    // Here is just usual game code... Board is a custom node with the game
    // figures, for instance.
    this.board = new Board();
    this.addChild(this.board);
    

    // PSICOOL GAME DEVELOPER EXAM
    //
    // You have to create 15 stars in random positions within the `board` object.
    // The board must be in the center of the screen and measure 300x200 design
    // pixels.
    //
    // The stars must not overflow from the board. You must show somehow the
    // bounds of the board to make this more visually obvious.
    //
    // The stars must rotate endlessly, all at the same speed, but each starting
    // with different, random angle.
    //
    // Each star must posses a random fill color among a set of four colors you
    // choose.
    //
    // Each star must have a outline of a slightly darker color than its fill
    // color.
    //
    // When a star is clicked, onStarClicked() on this same file must be
    // executed (see below).
    //
    // In the background the track `Fretless.m4a` must be played in loop.
    
    // stores the window size object
    var windowSize = cc.director.getWinSize();
    // calculates and store the center position of the window
    var centerPosition = cc.p(windowSize.width/2, windowSize.height/2);
    // 300x200 container
    var containerSize = {width: 300, height: 200};
    this.stars = [];
    
    // Load atlas textures
    cc.spriteFrameCache.addSpriteFrames(res.atlasPlist, res.atlasTexture);
    // Enable mipmaps and use them in the minification filter
    this.texture = cc.textureCache.getTextureForKey(res.atlasTexture);
    this.texture.generateMipmap(); // create the mipmap
    this.texture.setAntiAliasTexParameters(); // use it in the minification filter
    
    // creates the background container to retain the stars
    this.bgSprite = new cc.Sprite(this.texture, cc.rect(2/2, 2/2, 242/2, 242/2));
    this.bgSprite.attr({x: centerPosition.x, y: centerPosition.y});
    this.bgSprite.setScaleX( containerSize.width/ (this.bgSprite.width) );
    this.bgSprite.setScaleY( containerSize.height/ (this.bgSprite.height) );
    this.board.addChild(this.bgSprite);
    
    // bounds of the container
    var max = {x: centerPosition.x-containerSize.width/2+80/2, y: centerPosition.y+containerSize.height/2-80/2};
    var min = {x: centerPosition.x+containerSize.width/2-80/2, y: centerPosition.y-containerSize.height/2+80/2};
    this.boundaries.min = min;
    this.boundaries.max = max;
    // loop to create the stars
    for(var i = 0; i < 15; i++) {
      
      var star = this.generateNewStar(this.texture, this.boundaries.min, this.boundaries.max, this.rotationPreset);
      
      // adding the sprites as childs of Board
      this.board.addChild(star);
      this.stars.push(star);
      
    }
    
    cc.eventManager.addListener({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: this.onTouchBegan,
      onTouchEnded: this.onTouchEnded.bind(this)
    }, this.board);
    
    // play the background music endlessly
    cc.audioEngine.playMusic(res.musicFretless, true);
    
    // This ensures sprites and labels are not blurry in desktop screens (see
    // the SDK documentation for more details)
    moveToNearestIntegerPixels(this.getChildren());
  },
  
  generateNewStar: function(texture, min, max, rotationPreset) {
    
    var star = undefined;
    var canPass = false;
    
    // keep doing this until a Star is not in the same position of other star
    while(!canPass) {
      // generates the position of the star
      var xPosition = (Math.random()*(max.x-min.x))+min.x;
      var yPosition = (Math.random()*(max.y-min.y))+min.y;
      var startAngle = Math.random()*360;
      var color = this.colors[ parseInt( Math.random()*this.colors.length ) ];
      // instantiates the star
      star = new Star("", texture, xPosition, yPosition, rotationPreset, startAngle, color);

      // variable to keep tracking if the star has same position of another
      var samePositionCount = 0;
      for(var i = 0, iLength = this.stars.length; i < iLength; i++) {
        if(Math.abs(this.stars[i].x - star.x) <= 0.001
           && Math.abs(this.stars[i].y - star.y) <= 0.001) 
        {
          samePositionCount++;
          break;
        }
      }
      
      if(samePositionCount === 0) canPass = true;
    }
    
    return star;
  },
  
  /**
   * Removes the star from the array and the Board object
   **/
  removeStar: function(star) {
    var index = -1;
    for(var i = 0, iLength = this.stars.length; i < iLength; i++)
    {
      if(Math.abs(this.stars[i].x - star.x) <= 0.001
         && Math.abs(this.stars[i].y - star.y) <= 0.001) {
        index = i;
        break;
      }
    }
    
    // if it finds the star in the array
    if(index > -1) {
      this.board.removeChild(star);
      this.stars.splice(index, 1);
    }
  },
  
  onStarClicked: function (star) {
    // Make the star a bit bigger and then smaller until it disappears.
    //
    // After the star has disappeared a new one must emerge with an animation
    // in a random position, without overlapping any other stars nor the
    // position of the star that just disappeared.
    //
    // Time must start running if not running yet when this function is called.
    //
    // `sfxCorrect.m4a` must be played.
    
    // runs the animation of the star being destroyed
    star.runAction(cc.sequence( cc.scaleTo(0.1,1.2,1.2), cc.scaleTo(0.1,0,0), cc.callFunc(this.onStarDisappeared, this, star) ));
  },
  
  /**
   * Called when the star has already disappeared.
  **/
  onStarDisappeared: function(star) {
    // removes the star
    this.removeStar(star);
    // starts the clock if not running yet
    if(!this.clock.isRunning()) {
      this.clock.start();
    }
    // play the sound effect
    cc.audioEngine.playEffect(res.soundCorrect, false);
    // generate a new star
    var newStar = this.generateNewStar(this.texture, this.boundaries.min, this.boundaries.max, this.rotationPreset);
    newStar.setScale(0,0);
    // runs the animation of the star being created
    newStar.runAction(cc.scaleTo(0.2,1,1));
    // adding the sprites as childs of Board
    this.board.addChild(newStar);
    this.stars.push(newStar);
    // increment the score
    this.score += 1;
  },
  
  onTimeUp: function () {
    // This method sends the score to the server when running in production and
    // shows the score screen.
    this.scene.finishGame({
      score: this.score,
      newStartingLevel: 1,
      additionalScoreRows: []
    })
  },
  
  onTouchBegan: function(touch, event) {
    return true;
  },
  
  onTouchEnded: function(touch, event) {
    // the touch/click location
    var touchPosition = touch.getLocation();
    var currentTarget = event.getCurrentTarget();
    
    // loop
    for(var i = 0, iLength = this.stars.length; i < iLength; i++) {
      
      // checks if the location is inside the bounding box of the current star
      if (this.stars[i].containsPoint(touchPosition)) {
        this.onStarClicked(this.stars[i]);
        break;
      }
      
    }
  }

});