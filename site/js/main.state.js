'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '');


var MainState = function() {};

MainState.prototype = {
    preload: function() {
        // load only the splashscreen and loading state necessaries here
        game.load.image('splashscreen', 'assets/sprites/splashscreen.png');
        game.load.script('SplashState',   'js/splash.state.js');
        game.load.script('LoadingState',  'js/loading.state.js');
	    game.load.script('globalsScript', 'js/globals.js');
        // allow the player to right click without the menu popping up
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
    },
    create: function() {
        game.state.add('SplashState', SplashState);
        game.state.add('LoadingState',  LoadingState);
        game.state.start('SplashState');
    }
};

game.state.add('MainState', MainState);
game.state.start('MainState');
