Quintus.GameScenes = function(Q) {
    
    Q.scene('Background', function(stage) {
        Q.bg = stage.insert(new Q.Sprite({
            sheet: 'background',
            x: Q.width / 2,
            y: 100,
            frame: Q.random(2)
        }));
    });
    
    Q.scene('Level', function(stage) {
        Q.pipes = [];
        Q.state.set('score', 0);

        Q.bird = stage.insert(new Q.Bird());

        stage.insert(new Q.Ground());

        stage.insert(new Q.Repeater({
            sheet: 'floor',
            y: 100,
            speedX: 1.0,
            repeatY: false,
            z: 3
        }));
        
        stage.add('viewport').follow(Q.bird, {
            x: true,
            y: false
        });
        stage.viewport.offsetX = Q.bird.p.cx - 2;
    });
    
    Q.scene('Menu', function(stage) {
        stage.insert(new Q.Sprite({
            sheet: 'title',
            x: Q.width / 2,
            y: (Q.height / 2) - 30
        }));
        
        stage.insert(new Q.UI.Button({
            sheet: 'play',
            x: Q.width / 2,
            y: (Q.height / 2) + 32
        }, function() {
            this.destroy();
            Q.stageScene('Fade', 3);
            Q.audio.play('sfx_swooshing.ogg');
            Q.bird.p.pipes = true;
        }));
    });
    
    Q.scene('HUD', function(stage) {
        Q.bird.stage.viewport.offsetX -= 27;
        
        var getReady = stage.insert(new Q.Sprite({
            sheet: 'get_ready',
            x: Q.width / 2,
            y: (Q.height / 2) - 41
        }));
        
        var tap = stage.insert(new Q.Sprite({
            sheet: 'tap',
            x: Q.width / 2,
            y: Q.height / 2 + 7
        }));
        
        Q.scoreContainer = stage.insert(new Q.UI.Container({
            x: Q.width / 2,
            y: 50
        }));

        Q.scoreContainer.insert(new Q.Sprite({
            sheet: 'large_number',
            frame: [0]
		}));
        
        stage.insert(new Q.UI.Button({
			x: Q.width / 2,
			y: Q.height / 2,
			w: Q.width,
			h: Q.height
		}, function() {
            getReady.destroy();
            tap.destroy();
            
            Q.bird.off('zigZag');
            Q.bird.add('2d');
			Q.bird.trigger('flyUp');

            Q.bird.stage.insert(new Q.PipeCreator());
		}));
    });
    
    Q.scene('GameOver', function(stage) {
        setTimeout(function() {
            var gameover = stage.insert(new Q.GameOver());
            setTimeout(function() {
                var scoreboard = stage.insert(new Q.ScoreBoard()),
                    score = Q.state.get('score'),
                    medal = 0;

                if (score >= 40) medal = 4;      // platinum
                else if (score >= 30) medal = 3; // gold
                else if (score >= 20) medal = 2; // silver
                else if (score >= 10) medal = 1; // bronze

                if (medal) {
                    var medal = stage.insert(new Q.Medal({ frame: medal - 1 }), scoreboard);
                    stage.insert(new Q.Sparkle(), medal);
                }

                var scoreContainer = stage.insert(new Q.UI.Container(), scoreboard);
                Q.displayNumbers(score, scoreContainer, 'small_number');
                scoreContainer.p.x = scoreboard.p.cx - (scoreContainer.children.length * 8) - 6.5;
                scoreContainer.p.y = -7;
                
                if (score > Q.personalBest) {
                    localStorage.setItem('FlappyBird.personalBest', score);
                    Q.personalBest = score;
                    
                    stage.insert(new Q.Sprite({
                        sheet: 'new',
                        x: 18,
                        y: 4
                    }), scoreboard);
                }
                
                var bestContainer = stage.insert(new Q.UI.Container(), scoreboard);
                Q.displayNumbers(Q.personalBest, bestContainer, 'small_number');
                bestContainer.p.x = scoreboard.p.cx - (bestContainer.children.length * 8) - 6.5;
                bestContainer.p.y = 14;

                scoreboard.animate({ y: Q.height / 2 }, .5, Q.Easing.Quadratic.Out, {
                    callback: function() {
                        setTimeout(function() {
                            Q.bird.destroy();
                            
                            stage.insert(new Q.UI.Button({
                                sheet: 'play',
                                x: Q.width / 2,
                                y: (Q.height / 2) + 58
                            }, function() {
                                this.destroy();
                                Q.stageScene('Fade', 3);
                                Q.audio.play('sfx_swooshing.ogg');
                            }));
                        }, 250);
                    }
                });
            }, 850);
        }, 750);
    });

    Q.scene('Fade', function(stage) {
        stage.insert(new Q.LightBox({
            between: function() {
                Q.bg.p.frame = Q.random(2);
                Q.clearStage(1);
                Q.clearStage(2);
                Q.stageScene('Level', 1, { sort: true });
                Q.stageScene('HUD', 2);
            }
        }));
    });
    
    Q.scene('Flash', function(stage) {
        var lightbox = stage.insert(new Q.LightBox({
            color: '#fff',
            opacity: .5,
            duration: .16
        }));
    });
};