window.addEventListener('load', function() {
    
    var Q = window.Q = Quintus({ development: true })
            .include('Scenes, Sprites, 2D, UI, Anim, Audio, Touch')
            .include('GameScenes, GameSprites')
            .setup({
                width: 144,
                height: 256
            })
            .touch()
            .enableSound();
    
    Q.random = function(max) {
        return Math.floor(Math.random() * max);
    }
    
    Q.displayNumbers = function(number, container, sheet) {
        var number = number.toString();

        for (var n = 0, len = number.length; n < len; n++) {
            var children = container.children;
            
            if (children.length === 0) {
                container.insert(new Q.Number({
                    sheet: sheet,
                    frame: number[n]
                }));
            } else if (children.length < n + 1) {
                var child = children[children.length - 1];
                container.insert(new Q.Number({
                    sheet: sheet,
                    x: child.p.x + child.p.w + 1,
                    frame: number[n]
                }));
            }

            children[n].p.frame = number[n];
        }
    }

    //Q.debug = true;
    Q.gravityY = 428,
    Q.groundY = 200,
    Q.flyHeight = 140,
    Q.upRotationSpeed = .25,
    Q.downRotationSpeed = .4,
    Q.pipes = [],
    Q.personalBest = localStorage.getItem('FlappyBird.personalBest');

    if (Q.personalBest === null) {
        Q.personalBest = 0;
    }
    
    Q.animations('bird', {
        fly: { frames: [0, 1, 2], rate: 1 / 3.5 },
        fall: { frames: [1] }
    });
    
    Q.animations('medal', {
        sparkle: { frames: [0, 1, 2], rate: 1 / 3.5, loop: false, trigger: 'new' }
    });
    
    Q.load([
        'background.png', 'background.json', 'sprites.png', 'sprites.json', 'pipe_shaft.png',
        'sfx_wing.ogg', 'sfx_hit.ogg', 'sfx_die.ogg', 'sfx_point.ogg', 'sfx_swooshing.ogg'
    ], function() {
        Q.compileSheets('background.png', 'background.json');
        Q.compileSheets('sprites.png', 'sprites.json');
       
        Q.stageScene('Background');
        Q.stageScene('Level', 1, { sort: true });
        Q.stageScene('Menu', 2);
    });
    
});