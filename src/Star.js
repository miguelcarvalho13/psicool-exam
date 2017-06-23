/**
 * @class
 * @extends {cc.Sprite}
 */
var Star = cc.Sprite.extend({
  _className: "Star",
  /**
   * @constructs
   */
  ctor: function(name, texture, x, y, rotationPreset, startAngle, color) {
    this._super();
    
    this._spriteFill = new cc.Sprite(texture, cc.rect(2/2, 246/2, 80/2, 80/2));
    this._spriteOutline = new cc.Sprite(texture, cc.rect(83/2, 246/2, 80/2, 80/2));

    // sets the color
    this._spriteFill.setColor(color);
    this._spriteOutline.setColor(color);
    
    this._spriteFill.attr({ x: 0, y: 0});
    this._spriteOutline.attr({ x: 0, y: 0});
    
    // adding the sprites as childs of this Sprite object
    this.addChild(this._spriteFill);
    this.addChild(this._spriteOutline);
    
    // positioning the sprites
    this.attr({ x: x, y: y});

    // sets the initial angle
    this.setRotation(startAngle);
    
    // apply rotation
    this.runAction(new cc.RepeatForever(new cc.RotateBy(rotationPreset.seconds, rotationPreset.angle)));
    this._name = name;
  },
  
  containsPoint: function(point) {
    var minX = this.x - this._spriteOutline.width/2;
    var maxX = this.x + this._spriteOutline.width/2;
    var minY = this.y - this._spriteOutline.height/2;
    var maxY = this.y + this._spriteOutline.height/2;
    
    return (point.x >= minX && point.x <= maxX &&
           point.y >= minY && point.y <= maxY);
  }

});

/*Star.containsPoint = function(point) {
  
  var minX = this._spriteOutline.width/2 - this._spriteOutline.x;
  var maxX = this._spriteOutline.width/2 + this._spriteOutline.x;
  var minY = this._spriteOutline.height/2 - this._spriteOutline.y;
  var maxY = this._spriteOutline.height/2 + this._spriteOutline.y;
  
  return (point.x >= minX && point.x <= maxX &&
         point.y >= minY && point.y <= maxY);
  
};*/