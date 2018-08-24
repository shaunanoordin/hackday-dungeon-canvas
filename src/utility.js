/*
Utility Classes
---------------

(Shaun A. Noordin || shaunanoordin.com || 20160901)
--------------------------------------------------------------------------------
 */

export function ImageAsset(url) {
  this.url = url;
  this.img = null;
  this.loaded = false;
  this.img = new Image();
  this.img.onload = function() {
    this.loaded = true;
  }.bind(this);
  this.img.src = this.url;
}
