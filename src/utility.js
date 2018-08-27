/*
Utility Classes
---------------

(Shaun A. Noordin || shaunanoordin.com || 20160901)
--------------------------------------------------------------------------------
 */

export function ImageAsset(url) {
  this.url = url;
  this.loaded = false;
  this.img = new Image();
  this.img.onload = function() {
    this.loaded = true;
  }.bind(this);
  this.img.src = this.url;
}

export function AudioAsset(url) {
  console.log('New Audio: ', url);
  
  this.url = url;
  this.loaded = false;
  this.audio = new Audio();
  
  //Fetch the audio object using XMLHttpRequest instead of just using
  //this.audio.src = "..." to ensure the file is fully loaded before playing.
  //See http://dinbror.dk/blog/how-to-preload-entire-html5-video-before-play-solved/
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = 'blob';
  req.onload = function() {
    if (!req || req.readyState !== 4 || req.status !== 200) {
      console.error(`AudioAsset error ${this.url}: `, err);
      return;
    }
    this.audio.src = URL.createObjectURL(req.response);
    this.loaded = true;
  }.bind(this);
  req.onerror = function(err) {
    console.error(`AudioAsset error ${this.url}: `, err);
  }.bind(this);
  req.send();
  
  //Interface functions
  this.play = function() {
    if (!this.loaded || !this.audio) return;
    this.audio.play();
  }.bind(this);
  
  this.stop = function() {
    if (!this.loaded || !this.audio) return;
    this.audio.currentTime = 0;
    this.audio.pause();
  }.bind(this);
}
