//rocket class

class Rocket extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    //to add object to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.isFiring = false;
    this.moveSpeed = 2;
    this.sfxShot = scene.sound.add("sfx-shot");
  }

  //rocket movement
  update(currentPlayer, keyLEFT, keyRIGHT, keyFIRE) {
    if (currentPlayer === 1 && this === this.scene.rocket) {
      // Player 1 control logic
      this.controlRocket(keyLEFT, keyRIGHT, keyFIRE);
    } else if (currentPlayer === 2 && this === this.scene.rocket) {
      // Player 2 control logic
      this.controlRocket(keyLEFT, keyRIGHT, keyFIRE);
    }
  }

  controlRocket(keyLEFT, keyRIGHT, keyFIRE) {
    if (!this.isFiring) {
      if (keyLEFT.isDown && this.x >= borderUISize + this.width) {
        this.x -= this.moveSpeed;
      } else if (
        keyRIGHT.isDown &&
        this.x <= game.config.width - borderUISize - this.width
      ) {
        this.x += this.moveSpeed;
      }
    }

    // Existing fire logic
    if (Phaser.Input.Keyboard.JustDown(keyFIRE) && !this.isFiring) {
      this.isFiring = true;
      this.sfxShot.play();
    }

    // Existing movement logic
    if (this.isFiring && this.y >= borderUISize * 3 + borderPadding) {
      this.y -= this.moveSpeed;
    }

    // Existing reset logic
    if (this.y <= borderUISize * 3 + borderPadding) {
      this.isFiring = false;
      this.y = game.config.height - borderUISize - borderPadding;
    }
  }

  reset() {
    this.isFiring = false;
    this.y = game.config.height - borderUISize - borderPadding;

    // Reduce timer for the current player by 3 seconds on a miss
    if (this.scene.currentPlayer === 1) {
      this.scene.timer = Math.max(0, this.scene.timer - 3000); // Ensure timer doesn't go negative
    } else {
      this.scene.timer = Math.max(0, this.scene.timer - 3000);
    }
  }
}
