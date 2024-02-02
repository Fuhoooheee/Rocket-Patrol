class Play extends Phaser.Scene{
    constructor(){
        super('playScene')

        //player turn variable
        this.currentPlayer=1
        this.p1Timer = 0;
        this.p2Timer = 0;
        this.isP1Turn = true;
        this.gameOver2 = false; // probably not useable
        this.showGameOverP1Text = false;
        this.showPressJToStartP2Text = false;
    }

    init(data){
        this.p1Timer=data.gameTimer;
        this.p2Timer=data.gameTimer;
        
    }

    create(){

        let gameOverConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        };

        //place tile sprite 
        this.starfield=this.add.tileSprite(0,0,640,480,'starfield').setOrigin(0,0)

        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0)
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0)
        //keybind definitions
        this.keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        this.keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        this.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        this.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
        this.keyP2turn= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)

        this.gameOver = false; // Initialize gameOver as false

        // Display timer for both players (initially showing only player 1's timer)
        this.timerP1Text = this.add.text(200, 55, 'P1 Time: ' + this.formatTime(this.p1Timer), { font: '28px Courier', fill: '#ffffff' });
        this.timerP2Text = this.add.text(200, 55, 'P2 Time: ' + this.formatTime(this.p2Timer), { font: '28px Courier', fill: '#ffffff' });
        this.timerP2Text.setVisible(false); // Hide P2 timer initially

        // Game over text for P1
        this.gameOverP1Text = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'P1 GAME OVER', gameOverConfig).setOrigin(0.5);
        this.gameOverP1Text.setVisible(false);

        // Press J to start P2 turn text
        this.pressJToStartP2Text = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 64, 'Press (J) to start P2', gameOverConfig).setOrigin(0.5);
        this.pressJToStartP2Text.setVisible(false);

            // Timer update
            // needs potential fix ???
        if (!this.gameOver) {
            this.updateTimer();
        }

        //p1 & p2 rockets
        //add rocket to p1
        this.p1Rocket=new Rocket(this,game.config.width/2,game.config.height - borderUISize-borderPadding,'rocket').setOrigin(0.5,0)
        //add rocket to p2
        this.p2Rocket = new Rocket(this, game.config.width / 2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);
        this.p2Rocket.setVisible(false); // Hide p2 rocket initially
        
        //initialize score
        this.p1Score=0
        this.p2Score=0

        // add spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0)
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0)
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0)

        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 100
            
        }
        //display p1 score on the left
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig)
                
        //display p2 score on the right
        this.scoreRight = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p2Score, scoreConfig).setOrigin(1,0);

        
        // 60-second play clock
        scoreConfig.fixedWidth = 0
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            //this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            //this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press (J) to start Player 2', scoreConfig).setOrigin(0.5);
            //this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press (R) to Restart or ← for Menu', scoreConfig).setOrigin(0.5);
        }, null, this);

    }

    //begininning of update()
    update() {
        // Update timers for both players
        this.updateTimer();
    
        // Base updates that are always active
        this.starfield.tilePositionX -= 4;
        this.ship01.update(); // Update spaceships
        this.ship02.update();
        this.ship03.update();

        this.checkCollisions();

        // Only check collisions if rockets and ships are properly initialized
        if (this.p1Rocket && this.p2Rocket && this.ship01 && this.ship02 && this.ship03) {
            this.checkCollisions();
        }

        //adding points per hit 
        if (this.currentPlayer === 1 && this.checkCollision(this.p1Rocket, this.ship01)) {
                // Handling collision...
            this.p1Score += ship.points;
            this.scoreLeft.text = this.p1Score;
        }
            //fix scoreLeft ( DO LATER DONT FORGET)
            //p2 collision
        if (this.currentPlayer === 1 && this.checkCollision(this.p2Rocket, this.ship01)) {
            // Handling collision
            this.p2Score += ship.points;
            this.scoreLeft.text = this.p2Score;
        }
    
        //main logic

        // Update game based on current player's turn and game over state
        if (!this.gameOver) {
            // In Play.js, within the update method:
            this.p1Rocket.update(this.currentPlayer, this.keyLEFT, this.keyRIGHT, this.keyFIRE);
            this.p2Rocket.update(this.currentPlayer, this.keyLEFT, this.keyRIGHT, this.keyFIRE);
            if(!this.isP1Turn){
            this.handlePlayerTurn();
            this.checkCollisions();
            this.endP1Turn();
            this.startP2Turn();
            }
        } else {
            // If game over for both players, handle accordingly (not detailed here)
            this.endP2Turn();
        }
    }
    
    //end of update()

    handlePlayerTurn() {
        this.updateTimer();
    
        // Handle input and updates for the current player
        if (this.currentPlayer === 1) {
            this.p1Rocket.update(); 
        } else if (this.currentPlayer === 2) {
            this.p2Rocket.update(); 
        }
    }

        formatTime(milliseconds) {
        // Convert milliseconds to seconds
        let seconds = Math.floor(milliseconds / 1000);

        // Calculate minutes and remaining seconds
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;

        // Format the time to have leading zeroes if necessary
        let formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        return formattedTime;
    }

    //keep player timer up to date
    updateTimer() {
        // Reduce timer based on whos currently playing
        if (this.currentPlayer === 1) {
            if (this.p1Timer > 0) {
                this.p1Timer -= 1000 / 60;
                this.timerP1Text.setText('P1 Time: ' + this.formatTime(this.p1Timer));
            } else {
                // Handle end of p1s turn
                this.endP1Turn();
            }
        } else if (this.currentPlayer === 2) {
            if (this.p2Timer > 0) {
                this.p2Timer -= 1000 / 60;
                this.timerP2Text.setText('P2 Time: ' + this.formatTime(this.p2Timer));
            } else {
                // Handle end of p2s turn
                this.endP2Turn();
            }
        }
    }
    
    
    
    
    checkCollision(rocket, ship) {
        // Verify both rocket and ship exist before checking collision
        if (!rocket || !ship) {
            return false; // One or both objects are undefined, so exit early
        }
    
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
            rocket.x + rocket.width > ship.x && 
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y) {
            return true;
        } else {
            return false;
        }
    }
    

    checkCollisions() {
        // Check collisions for active players rocket
        let rocket = this.isP1Turn ? this.p1Rocket : this.p2Rocket;
    
        // Check collision with ship03
        if (this.checkCollision(rocket, this.ship03)) {
            rocket.reset();
            this.shipExplode(this.ship03);
        }
    
        // Check collision with ship02
        if (this.checkCollision(rocket, this.ship02)) {
            rocket.reset();
            this.shipExplode(this.ship02);
        }
    
        // Check collision with ship01
        if (this.checkCollision(rocket, this.ship01)) {
            rocket.reset();
            this.shipExplode(this.ship01);
        }
    }
    


    shipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0
        // create explosion sprite at ships position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode')             // play explode animation
        boom.on('animationcomplete', () => {   // callback after anim completes
          ship.reset()                         // reset ship position
          ship.alpha = 1                       // make ship visible again
          boom.destroy()                       // remove explosion sprite

          if (this.currentPlayer === 1) {
            this.p1Score += ship.points;
            this.scoreLeft.text = this.p1Score;
            this.p1Timer += 5000; // Add 5 seconds to p1s timer
        } else {
            this.p2Score += ship.points;
            this.scoreRight.text = this.p2Score;
            this.p2Timer += 5000; // Add 5 seconds to p2s timer
        }
        this.sound.play('sfx-explosion'); //to let player know time was added 

          
        });
    }

    startP1Turn() {
        this.currentPlayer = 1;
        this.isP1Turn = true;
        this.p1Rocket.setVisible(true);
        this.timerP1Text.setVisible(true);
        this.p1Timer = this.initialTimerValue; 

        // Hide P2 elements
        this.p2Rocket.setVisible(false);
        this.timerP2Text.setVisible(false);
    }

endP1Turn() {
    // Declare and initialize gameOverConfig at the beginning of the method
    let gameOverConfig = {
        fontFamily: 'Courier',
        fontSize: '28px',
        backgroundColor: '#F3B141',
        color: '#843605',
        align: 'center',
        padding: {
            top: 5,
            bottom: 5,
        },
        fixedWidth: 0
    };

    // Toggle to player 2
    this.currentPlayer = 2;
    // Reset player 1s rocket and hide it
    this.p1Rocket.setVisible(false);
    // Show player 2s rocket
    this.p2Rocket.setVisible(true);
    // Swap timers
    this.timerP1Text.setVisible(false);
    this.timerP2Text.setVisible(true);
    // Reset the timer for player 2
    this.p2Timer = game.settings.gameTimer;

    this.showGameOverP1Text = true;
    this.showPressJToStartP2Text = true;

    // Update visibility based on flags
    this.gameOverP1Text.setVisible(this.showGameOverP1Text);
    this.pressJToStartP2Text.setVisible(this.showPressJToStartP2Text);

    // Listen for 'J' key press to start P2's turn
this.keyP2turn.on('down', () => {
    this.p2Timer = this.initialP2TimerValue; 
    this.startP2Turn();
}, this);
}

    
    startP2Turn() {
        this.currentPlayer = 2;
        this.isP1Turn = false;
        this.p2Rocket.setPosition(game.config.width / 2, game.config.height - borderUISize - borderPadding);
        this.p2Timer = this.initialTimerValue; // Set P2s timer to initial value
        this.timerP2Text.setVisible(true); // Make P2s timer visible
        this.p2Rocket.setVisible(true);
        this.checkCollision();
    
        // Hide P1 elements and game over text
        this.p1Rocket.setVisible(false);
        this.timerP1Text.setVisible(false);

        this.showGameOverP1Text = false;
        this.showPressJToStartP2Text = false;
    
        this.gameOverP1Text.setVisible(this.showGameOverP1Text);
        this.pressJToStartP2Text.setVisible(this.showPressJToStartP2Text);

    }
    
    //wraps up game    
    endP2Turn() {
        this.gameOver = true;
    
        // Display game over message for P2 and option to restart or return to menu
        let gameOverConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        };
        this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'P2 GAME OVER', gameOverConfig).setOrigin(0.5);
        this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 64, 'Press (R) to Restart or ← for Menu', gameOverConfig).setOrigin(0.5);
    
        this.timerP2Text.setVisible(false);
    }
    
}