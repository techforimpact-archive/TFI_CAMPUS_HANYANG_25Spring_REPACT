
console.log('MyPageScene.js loaded successfully');

class MyPageScene extends Phaser.Scene {
    constructor() {
        super('MyPageScene');
        console.log('MyPageScene constructor called');
        this.isTransitioning = false;
    }

    preload() {

        this.load.image('mypage_background', './assets/startscene/mypage (2).png');


        this.load.image('dex_button', './assets/images/back.png');
    }

    create() {

        this.isTransitioning = false;

        const { width, height } = this.sys.game.canvas;


        this.add.image(width / 2, height / 2, 'mypage_background')
            .setOrigin(0.5)
            .setDisplaySize(width, height);


        const userLevel = parseInt(localStorage.getItem('level') || '1', 10);
        const levelText = `${userLevel} / 10`;
        this.add.text(440 - 60, 412, levelText, {
            fontFamily: '머니그라피',
            fontSize: '16px',
            color: '#FFFFFF',
            align: 'right'
        }).setOrigin(1, 0);


        const levelBarMaxWidth = 320;
        const levelBarHeight = 20;
        const levelBarX = 60
        const levelBarY = 440;
        const levelBarFillWidth = Math.max(0, Math.min(userLevel / 10, 1)) * levelBarMaxWidth;




        if (levelBarFillWidth > 0) {
            this.add.rectangle(levelBarX, levelBarY, levelBarFillWidth, levelBarHeight, 0xffffff, 1)
                .setOrigin(0, 0);
        }


        const totalPoint = parseInt(localStorage.getItem('totalPoint') || '0', 10);

        this.add.text(380, 572, totalPoint, {
            fontFamily: '머니그라피',
            fontSize: '16px',
            color: '#ffffff',
            align: 'right'
        }).setOrigin(1, 0);


        const pointBarMaxWidth = 320;
        const pointBarHeight = 20;
        const pointBarX = 60;
        const pointBarY = 600;
        const pointBarFillWidth = Math.max(0, Math.min(totalPoint / 10000, 1)) * pointBarMaxWidth;






        if (pointBarFillWidth > 0) {
            this.add.rectangle(pointBarX, pointBarY, pointBarFillWidth, pointBarHeight, 0xffffff, 1)
                .setOrigin(0, 0);
        }


        const dexButton = this.add.image(120, 487, 'dex_button')
            .setOrigin(0, 0)  
            .setDisplaySize(29, 27)  
            .setFlipX(true) 
            .setInteractive();



        const userName = localStorage.getItem('name') || '김한양';
        const userId = localStorage.getItem('username') || 'hanyang123';


        this.add.text(60 + 95, 280 + 15, userName, {
            fontFamily: '머니그라피',
            fontSize: '28px',
            color: '#030303'
        }).setOrigin(0.5);


        this.add.text(60 + 95, 280 + 15 + 30, userId, {
            fontFamily: '머니그라피',
            fontSize: '16px',
            color: '#727272'
        }).setOrigin(0.5);


        const refeelyButton = this.add.rectangle(width * 0.3, height * 0.75, 130, 40, 0x000000, 0)
            .setInteractive();


        const ecoyaButton = this.add.rectangle(width * 0.7, height * 0.75, 130, 40, 0x000000, 0)
            .setInteractive();


        const backButton = this.add.rectangle(width * 0.29, height * 0.84, 130, 40, 0x000000, 0)
            .setInteractive();


        const editButton = this.add.rectangle(width * 0.71, height * 0.84, 130, 40, 0x000000, 0)
            .setInteractive();


        dexButton.on('pointerdown', () => {
            if (!this.isTransitioning) {
                this.isTransitioning = true;
                this.scene.start('DexScene');
            }
        });


        backButton.on('pointerdown', () => {
            if (!this.isTransitioning) {
                this.isTransitioning = true;
                this.scene.start('BootScene');
            }
        });

        editButton.on('pointerdown', () => {
            if (!this.isTransitioning) {
                alert('수정 기능은 준비 중입니다.');
            }
        });

        refeelyButton.on('pointerdown', () => {
            if (!this.isTransitioning) {

                window.open('https://refeely.com/', '_blank');
            }
        });

        ecoyaButton.on('pointerdown', () => {
            if (!this.isTransitioning) {
                window.open('https://makers.kakao.com/dailyupcycle?ct=home-mainbanner&f=url_share_dailyupcycle', '_blank');
            }
        });


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
}