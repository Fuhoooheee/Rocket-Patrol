class Menu extends Phaser.Scene{
  constructor (){
      super('menuScene')
  }

  preload(){
      //pre loading images
      this.load.image('rocket', './assets/rocket.png'),
      this.load.image('spaceship','./assets/spaceship.png')
      this.load.image('starfield', './assets/starfield.png')
      this.load.image('menuBackround','./assets/newSpaceMenu.png')
      this.load.spritesheet('explosion', './assets/explosion.png', {
          frameWidth: 64,
          frameHeight: 32,
          startFrame: 0,
          endFrame: 9
      })
      // load audio
      this.load.audio('menuMusic','./assets/menuMusic.mp3')
      this.load.audio('sfx-select', './assets/sfx-select.wav')
      this.load.audio('sfx-explosion01', './assets/sfx-explosion.wav')
      this.load.audio('sfx-explosion02', './assets/sfx-explo-1.wav')
      this.load.audio('sfx-explosion03', './assets/sfx-explo-2.wav')
      this.load.audio('sfx-explosion04', './assets/sfx-explo-3.wav')
      this.load.audio('sfx-explosion05', './assets/sfx-explo-4.wav')
      this.load.audio('sfx-shot', './assets/sfx-shot.wav')

      let loadingBar = this.add.graphics({
        fillStyle: {
          color: 0xffffff
        }
      })

      //for(let i=0;i<100;i++)

      this.load.on("progress",(percent)=>{
        loadingBar.fillRect(0,this.game.renderer.height/2,this.game.renderer.width*percent,50);
        console.log(percent);
      })

  }

  create(){

  // animation configuration
  this.anims.create({
  key: 'explode',
  frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
  frameRate: 30
  })

      //this.add.text(20,20, "Rocket Patrol Menu")
      //this.scene.start("playScene")
      this.sound.play("menuMusic",{volume: 0.5},{
        loop:true
      })

      this.add.image(this.game.renderer.width/2,this.game.renderer.height/2,"menuBackround").setDepth(1)
                      // display menu
              // define keys
      this.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
      this.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
  }
  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keyLEFT)) {
        // Easy mode
        game.settings = {
            spaceshipSpeed: 3,
            gameTimer: 60000    
        };
        this.sound.play('sfx-select');
        this.scene.start('playScene', game.settings);  
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyRIGHT)) {
        // Hard mode
        game.settings = {
            spaceshipSpeed: 4,
            gameTimer: 10000 // change back to 45000
        };
        this.sound.play('sfx-select');
        this.scene.start('playScene', game.settings);  
    }
}

}