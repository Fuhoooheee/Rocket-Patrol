
class Play extends Phaser.Scene{
    constructor(){
        super('playScene')

        //player turn variable
        this.currentPlayer=1
        this.p1Timer = 0;
        this.p2Timer = 0;
        this.isP1Turn = true;
        this.gameOver2 = false; // New flag for p2s  game over state
    }

    init(data){
        this.p1Timer=data.gameTimer;
        this.p2Timer=data.gameTimer;
        
    }

    create(){


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
        keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
        keyP2turn= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)

        this.gameOver = false; // Initialize gameOver as false

        //NEEDS TO BE TUNED POTENTIALLY AFTER IMPLEMENTING PLAYER 2 (need to fix p2 timer to be acurate)
        // Display timer for both players (initially showing only player 1's timer)
        this.timerP1Text = this.add.text(200, 55, 'P1 Time: ' + this.formatTime(this.p1Timer), { font: '28px Courier', fill: '#ffffff' });
        this.timerP2Text = this.add.text(200, 55, 'P2 Time: ' + this.formatTime(this.p2Timer), { font: '28px Courier', fill: '#ffffff' });
        this.timerP2Text.setVisible(false); // Hide P2 timer initially

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

    //begeninning of update()
update() {
    // Update timers for both players
    this.updateTimer();
    
    // Base updates that are always active
    this.starfield.tilePositionX -= 4;
    this.ship01.update(); // Update spaceships
    this.ship02.update();
    this.ship03.update();

            //Update rockets to avoid p1 rocket from showing in p2 turn
    if (!this.gameOver) {
            this.p1Rocket.update(this.currentPlayer); // Update player 1's rocket
            this.p2Rocket.update(this.currentPlayer); // Update player 2's rocket
    }
    
    // Check and handle collisions
    this.checkCollisions();

        //adding points per hit 
    if (this.currentPlayer === 1 && this.checkCollision(this.p1Rocket, this.ship01)) {
            // Handling collision...
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;
    }
        //fix scoreLeft ( DO LATER DONT FORGET)
        //p2 collision
    if (this.currentPlayer === 1 && this.checkCollision(this.p2Rocket, this.ship01)) {
         // Handling collision...
        this.p2Score += ship.points;
        this.scoreLeft.text = this.p2Score;
    }

    if (!this.gameOver) {
        if (this.isP1Turn) {
            // Update logic specific to p1 turn
            this.p1Rocket.update();
        } else {
            // Update logic specific to p2 turn
            this.p2Rocket.update();
        }
    }

    // Switch to P2s turn if P1s turn is over
    if (!this.isP1Turn && Phaser.Input.Keyboard.JustDown(keyP2turn)) {
        this.startP2Turn();
    }
}
    //end of update()

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
        if (this.isP1Turn) {
            if (this.p1Timer > 0) {
                this.p1Timer -= 1000 / 60;
                this.timerP1Text.setText('P1 Time: ' + this.formatTime(this.p1Timer));
            } else {
                this.endP1Turn();
            }
        } else {
            if (!this.gameOver2 && this.p2Timer > 0) {
                this.p2Timer -= 1000 / 60;
                this.timerP2Text.setText('P2 Time: ' + this.formatTime(this.p2Timer));
            } else if (!this.gameOver2) {
                this.endP2Turn();
            }
        }
    }
    
    
    

    checkCollision(rocket, ship) {
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
          rocket.x + rocket.width > ship.x && 
          rocket.y < ship.y + ship.height &&
          rocket.height + rocket.y > ship. y) {
          return true
        } else {
          return false
        }
    }

    checkCollisions() {
        // Check collisions for active player's rocket
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
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode')             // play explode animation
        boom.on('animationcomplete', () => {   // callback after anim completes
          ship.reset()                         // reset ship position
          ship.alpha = 1                       // make ship visible again
          boom.destroy()                       // remove explosion sprite

          if (this.currentPlayer === 1) {
            this.p1Score += ship.points;
            this.scoreLeft.text = this.p1Score;
            this.p1Timer += 5000; // Add 5 seconds to player 1's timer
        } else {
            this.p2Score += ship.points;
            this.scoreRight.text = this.p2Score;
            this.p2Timer += 5000; // Add 5 seconds to player 2's timer
        }
        this.sound.play('sfx-explosion'); //to let player know time was added 

          
        });
    }

    startP1Turn() {
        this.currentPlayer = 1;
        this.isP1Turn = true;
        this.p1Rocket.setVisible(true);
        this.timerP1Text.setVisible(true);
        this.p1Timer = this.initialTimerValue; // currently not working for some reason

        // Hide P2 elements
        this.p2Rocket.setVisible(false);
        this.timerP2Text.setVisible(false);
    }

    endP1Turn() {
        this.currentPlayer = 2;
        this.isP1Turn = false;
        this.timerP1Text.setVisible(false);
        this.p1Rocket.setVisible(false); // Hide P1's rocket
    
        // Display game over message for P1
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
        this.gameOverP1Text=this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'P1 GAME OVER', gameOverConfig).setOrigin(0.5);
        this.keyP2turn=this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 64, 'Press (J) to start P2', gameOverConfig).setOrigin(0.5);

    }
    
    startP2Turn() {
        this.currentPlayer = 2;
        this.isP1Turn = false;
        this.p2Rocket.setPosition(game.config.width / 2, game.config.height - borderUISize - borderPadding);
        this.p2Timer = this.initialTimerValue; // Set P2's timer to initial value
        this.timerP2Text.setVisible(true); // Make P2's timer visible
        this.p2Rocket.setVisible(true);
    
        // Hide P1 elements and game over text
        this.p1Rocket.setVisible(false);
        this.timerP1Text.setVisible(false);
        if (this.gameOverP1Text) {
            this.gameOverP1Text.destroy();
        }
        if (this.keyP2turn) {
            this.keyP2turn.destroy();
        }
    }
    
    

    endP2Turn() {
        this.gameOver2 = true;
    
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