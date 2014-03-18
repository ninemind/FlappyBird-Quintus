Quintus.GameSprites = function(Q) {

    Q.Sprite.extend('Ground', {
        init: function(p) {
            this._super(p, {
                color: '#ded895',
                x: 0,
                y: Q.height - 27,
                w: Q.width + 60,
                h: 54,
                z: 2
            });
        },
        step: function(dt) {
            if (!Q.bird.p.collided) {
                this.p.x++;
            }
        }
    });
    
    Q.Sprite.extend('Bird', {
        init: function(p) {
            var colors = ['yellow', 'red', 'blue'];
            
            this._super(p, {
                sprite: 'bird',
                sheet: colors[Q.random(colors.length)] + '_bird',
                y: Q.height / 2,
                z: 2,
                points: [ 
                    [ -2.5, -6 ], [  3.5, -6 ], [  6.5, -3 ],
                    [  6.5, -1 ], [  8.5,  2 ], [  7.5,  3 ],
                    [  7.5,  4 ], [  6.5,  5 ], [  2.5,  5 ],
                    [  1.5,  6 ], [ -3.5,  6 ], [ -4.5,  5 ],
                    [ -5.5,  5 ], [ -6.5,  4 ], [ -6.5,  3 ],
                    [ -7.5,  2 ], [ -7.5, -2 ], [ -4.5, -5 ],
                    [ -3.5, -5 ]
                ],
                landed: false,
                float: 'bottom',
                collided: false
            });
            
            this.add('animation, tween');
            this.play('fly');
            
            this.on('zigZag', function() {
                if (this.p.float == 'bottom') {
                    this.p.y -= .18;
                    if (this.p.y <= 126) this.p.float = 'top';
                } else if (this.p.float == 'top') {
                    this.p.y += .18;
                    if (this.p.y >= 130) this.p.float = 'bottom';
                }
            });
            
            this.on('fall', function() {
                this.play('fall');
                this.animate({ angle: 90 }, Q.downRotationSpeed);
            });
            
            this.on('flyUp', function() {
                if (this.p.y > 0) {
                    this.stop();
                    this.play('fly');
                    this.p.vy = -Q.flyHeight;
                    this.animate({ angle: -22.5 }, Q.upRotationSpeed);
                    Q.audio.play('sfx_wing.ogg');
                }
            });
            
            this.on('hit.sprite', function(collision) {
                if (!this.p.collided) {
                    this.p.collided = true;
                    Q.stageScene('Flash', 3);
                    Q.audio.play('sfx_hit.ogg');

                    if (!collision.obj.isA('Ground')) {
                        Q.audio.play('sfx_die.ogg');
                    }

                    Q('PipeCap', 1).set('sensor', true);
                    Q('PipeShaft', 1).set('sensor', true);

                    this.off('flyUp');
                }

                if (!this.p.landed) {
                    if (collision.obj.isA('Ground')) {
                        this.p.landed = true;
                        Q.clearStage(2);
                        Q.stageScene('GameOver', 2);
                    }
                }
            });
        },
        step: function(dt) {
            this.trigger('zigZag');
            
            if (!this.p.collided) {
                this.p.x++;

                if (Q.pipeCreator !== undefined && this.p.x % 75 == 0) {
                    Q.pipeCreator.p.createPipe = true;
                }
            }

            if (this.p.vy > 100) {
                this.trigger('fall');
            }

            if (Q.pipes.length > 0) {
                if (this.p.x > Q.pipes[0]) {
                    Q.state.inc('score', 1);
                    Q.displayNumbers(Q.state.get('score'), Q.scoreContainer, 'large_number');
                    Q.audio.play('sfx_point.ogg');
                    Q.pipes.splice(0, 1);
                }
            }
        }
    });
    
    Q.Sprite.extend('LightBox', {
        init: function(p) {
            this._super(p, {
                x: Q.width / 2,
                y: Q.height / 2,
                w: Q.width,
                h: Q.height,
                opacity: 0,
                color: '#000',
                duration: 1,
                maxOpacity: 1,
                between: function() {}
            });
            
            this.add('tween');
            this
                .animate({ opacity: this.p.maxOpacity }, this.p.duration / 2, {
                    callback: function() {
                        this.p.between();
                    }
                })
                .chain({ opacity: 0 }, this.p.duration / 2, {
                    callback: function() {
                        Q.clearStage(3);
                    }
                });
        }
    });

    Q.Sprite.extend('Number', {
        init: function(p) {
            this._super(p, {
                sheet: 'large_number',
                frame: 0
            });
        }
    });

    Q.Sprite.extend('GameOver', {
        init: function(p) {
            this._super(p, {
                sheet: 'game_over',
                x: Q.width / 2,
                y: (Q.height / 2) - 51,
                opacity: 0
            });
            
            this.add('tween');
            Q.audio.play('sfx_swooshing.ogg');
            this.animate({ y: this.p.y - 5, opacity: 1 }, .15)
                .chain({ y: this.p.y + 5 }, .15);
        }
    });
    
    Q.Sprite.extend('ScoreBoard', {
        init: function(p) {
            this._super(p, {
                sheet: 'scoreboard',
                x: Q.width / 2,
                y: Q.height + 30
            });
            
            this.add('tween');
            Q.audio.play('sfx_swooshing.ogg');
        }
    });
    
    Q.Sprite.extend('Medal', {
		init: function(p) {
			this._super(p, {
				sheet: 'medal',
                x: -33,
                y: 3
			});
		}
	});
    
    Q.Sprite.extend('Sparkle', {
        init: function(p) {
			this._super(p, {
                sprite: 'medal',
				sheet: 'sparkle',
                x: Q.random(22) - 11,
                y: Q.random(22) - 11,
                frame: 3
			});
            
            this.add('animation');
            this.play('sparkle');
            
            this.on('new', function() {
                this.stage.insert(new Q.Sparkle(), this.container);
                this.destroy();
            });
		}
    });

    Q.Sprite.extend('PipeCap', {
        init: function(p) {
            this._super(p, {
                sheet: 'pipe_cap',
                x: Q.bird.p.x + 200,
                z: 1
            });
        }
    });

    Q.Sprite.extend('PipeShaft', {
        init: function(p) {
            this._super(p, {
                asset: 'pipe_shaft.png',
                x: Q.bird.p.x + 200,
                z: 1
            });
        }
    });

    Q.GameObject.extend('PipeCreator', {
        init: function() {
            this.p = {
                createPipe: false,
                levels: [110, 120, 130, 140, 150, 160, 170, 180, 190]
            }

            Q.pipeCreator = this;
        },
        update: function(dt) {
            if (this.p.createPipe) {
                this.p.createPipe = false;

                Q.pipes.push(Q.bird.p.x + 200);

                var r = this.p.levels[Q.random(this.p.levels.length)] - 1;
                var bc = this.stage.insert(new Q.PipeCap({ y: r }));

                this.stage.insert(new Q.PipeShaft({ y: bc.p.y + 81 }));

                var tp = this.stage.insert(new Q.PipeCap({ y: r - 64, angle: 180 }));
                this.stage.insert(new Q.PipeShaft({ y: tp.p.y - 81 }));
            }
        }
    });
    
};