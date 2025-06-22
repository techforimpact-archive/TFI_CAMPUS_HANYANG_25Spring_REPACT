class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
        this.isTransitioning = false; 
    }

    preload() {
        this.load.image('login_background', './assets/images/main_background.png');
        this.load.image('white_bar', './assets/images/white_bar.png');
    }

    create() {

        this.isTransitioning = false;
        
        const { width, height } = this.sys.game.canvas;


        this.add.image(0, 0, 'login_background')
            .setOrigin(0)
            .setDisplaySize(width, height);


        const loginBar = this.add.image(width * 0.5, height * 0.56, 'white_bar')
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(0);

        const loginText = this.add.text(width * 0.75, height * 0.56, '로그인', {
            fontFamily: '머니그라피',
            fontSize: '28px',
            color: '#FFFFFF'
        }).setOrigin(0.5)
            .setInteractive()
            .setDepth(1);


        const signupBar = this.add.image(width * 0.5, height * 0.62, 'white_bar')
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(0);

        const signupText = this.add.text(width * 0.75, height * 0.62, '회원가입', {
            fontFamily: '머니그라피',
            fontSize: '28px',
            color: '#FFFFFF'
        }).setOrigin(0.5)
            .setInteractive()
            .setDepth(1);


        this.blackOverlay = this.add.rectangle(0, 0, width, height, 0x3cbb89)
            .setOrigin(0, 0)
            .setAlpha(0)
            .setDepth(100) 
            .setVisible(false);


        [loginText, signupText].forEach((text, index) => {
            const bar = index === 0 ? loginBar : signupBar;
            
            text.on('pointerover', () => {
                if (!this.isTransitioning) {
                    bar.setAlpha(1);
                    text.setColor('#4EB883'); 
                }
            });
            
            text.on('pointerout', () => {
                if (!this.isTransitioning) {
                    bar.setAlpha(0);
                    text.setColor('#FFFFFF');
                }
            });

            text.on('pointerdown', () => {
                if (!this.isTransitioning) {
                    this.showSelectionAndTransition(text, bar, index === 0 ? 'LoginInputScene' : 'SignupScene');
                }
            });
        });
    }

    showSelectionAndTransition(selectedText, selectedBar, targetScene) {

        this.isTransitioning = true;


        selectedBar.setAlpha(1);
        selectedText.setColor('#4EB883');


        this.time.delayedCall(500, () => {
            this.startSelectedScene(targetScene);
        });
    }

    startSelectedScene(targetScene) {

        this.blackOverlay.setVisible(true);


        this.tweens.add({
            targets: this.blackOverlay,
            alpha: 1,
            duration: 500,
            onComplete: () => {

                this.scene.start(targetScene, { fromBlackOverlay: true });
            }
        });
    }
}