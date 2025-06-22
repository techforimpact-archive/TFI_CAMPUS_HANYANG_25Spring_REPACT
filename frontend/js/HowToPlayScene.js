class HowToPlayScene extends Phaser.Scene {
    constructor() {
        super('HowToPlayScene');
        this.currentPage = 1;
        this.totalPages = 8;
        this.canClick = true;  
        this.lastTouchTime = 0; 

    }

    preload() {

        this.load.image('howto_background', './assets/images/main_background.png');

        this.load.image('back_button', './assets/images/back.png');
        this.load.image('right', './assets/startscene/right.png');
        this.load.image('left', './assets/startscene/left.png');



        for (let i = 1; i <= 8; i++) {
            this.load.image(`howtoplay${i}`, `./assets/startscene/howtoplay${i}.png`);
        }
    }

    create() {
        const { width, height } = this.sys.game.canvas;


        this.add.image(0, 0, 'howto_background')
            .setOrigin(0)
            .setDisplaySize(width, height);


        this.howtoImage = this.add.image(width / 2, height / 2, 'howtoplay1')
            .setOrigin(0.5);


        this.prevButton = this.add.image(12, 377, 'left')
            .setInteractive()
            .setOrigin(0, 0)
            .setDisplaySize(65, 70)
            .on('pointerdown', () => {
                if (this.canClick && this.checkTouchDelay()) {
                    this.changePage(-1);
                    this.disableClickTemporarily();
                }
            });


        this.nextButton = this.add.image(363, 377, 'right')
            .setInteractive()
            .setOrigin(0, 0)
            .setDisplaySize(65, 70)
            .on('pointerdown', () => {
                if (this.canClick && this.checkTouchDelay()) {
                    this.changePage(1);
                    this.disableClickTemporarily();
                }
            });


        const backButton = this.add.image(50, 50, 'back_button')
            .setDisplaySize(30, 34)
            .setInteractive()
            .on('pointerdown', () => {

                this.scene.stop('HowToPlayScene');
                this.scene.run('BootScene', { skipAnimation: true });
            });


        this.updateButtons();


        this.blackOverlay = this.add.rectangle(0, 0, width, height, 0x3cbb89)
            .setOrigin(0, 0)
            .setAlpha(1)
            .setDepth(100);

        this.tweens.add({
            targets: this.blackOverlay,
            alpha: 0,
            duration: 150,
            onComplete: () => {
                this.blackOverlay.destroy();
            }
        });
    }


    checkTouchDelay() {
        const currentTime = new Date().getTime();
        if (currentTime - this.lastTouchTime < 300) { 
            return false;
        }
        this.lastTouchTime = currentTime;
        return true;
    }


    disableClickTemporarily() {
        this.canClick = false;
        this.time.delayedCall(300, () => { 
            this.canClick = true;
        });
    }

    changePage(delta) {
        this.currentPage += delta;


        if (this.currentPage < 1) this.currentPage = 1;
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;


        this.howtoImage.setTexture(`howtoplay${this.currentPage}`);


        this.updateButtons();
    }

    updateButtons() {

        this.prevButton.setVisible(this.currentPage > 1);


        this.nextButton.setVisible(this.currentPage < this.totalPages);
    }
}


