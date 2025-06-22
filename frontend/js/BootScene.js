class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');


        this.menuItems = [
            { text: '게임 시작', scene: 'GameScene' },
            { text: '게임 방법', scene: 'HowToPlayScene' },
            { text: '마이페이지', scene: 'MyPageScene' } // 유저 이름은 동적으로 설정
        ];
        this.selectedMenuIndex = -1; // 초기에는 선택된 메뉴 없음
        this.menuTexts = [];
        this.selectionBar = null;
        this.isTransitioning = false; // 전환 중인지 여부
        this.userName = ''; // 기본 유저 이름
    }

    preload() {



        this.load.image('bin_lid_img', 'assets/images/bin_lid.png');
        this.load.image('title_img', 'assets/images/title.png');

        this.load.image('selection_bar', 'assets/images/white_bar.png');
    }

    create() {

        this.isTransitioning = false;

        this.selectedMenuIndex = -1;


        if (localStorage.getItem('returnToBootScene') === 'true') {
            localStorage.removeItem('returnToBootScene');

        }

        const { width, height } = this.sys.game.canvas;


        this.userName = localStorage.getItem('name') || localStorage.getItem('username') || '000';


        this.createMenuItems();


        this.selectionBar = this.add.image(40, 520, 'selection_bar')
            .setOrigin(0, 0) // 왼쪽 상단을 기준점으로 설정
            .setDisplaySize(360, 40) // 바 크기를 360x40으로 설정
            .setVisible(false)
            .setAlpha(0);

        this.binLid = this.add.image(40, 406, 'bin_lid_img')
            .setOrigin(0, 0)
            .setDepth(11);


        this.titleImage = this.add.image(40, 280, 'title_img')
            .setOrigin(0, 0)
            .setAlpha(0)
            .setVisible(false)
            .setDepth(12);


        this.menuTexts.forEach(text => text.setVisible(false));
        this.selectionBar.setVisible(false);


        this.blackOverlay = this.add.rectangle(0, 0, width, height, 0x3cbb89)
            .setOrigin(0, 0)
            .setAlpha(0)
            .setDepth(100)
            .setVisible(false);




        const skipAnimation = this.scene.settings.data?.skipAnimation || false;


        this.menuTexts.forEach(text => text.setVisible(false));
        this.selectionBar.setVisible(false);
        this.titleImage.setVisible(false);
        this.binLid.setVisible(true);

        if (skipAnimation) {

            this.titleImage.setVisible(true).setAlpha(1);
            this.menuTexts.forEach(text => text.setVisible(true).setAlpha(1));
            this.selectionBar.setVisible(false).setAlpha(0); // 선택 바 초기 상태 설정
            this.binLid.setVisible(false); // 뚜껑 숨김


            this.input.on('pointerdown', this.handleMenuClick, this);
        } else {

            this.input.once('pointerdown', this.playBinOpenAnimation, this);

        }
    }


    playBinOpenAnimation() {

        this.tweens.add({
            targets: this.binLid,
            y: this.binLid.y - 180,
            angle: 0,
            alpha: 0,
            duration: 700,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                this.binLid.setVisible(false);
            }
        });


        this.titleImage.setVisible(true);
        this.tweens.add({
            targets: this.titleImage,
            alpha: 1,
            duration: 600,
            delay: 400
        });


        this.time.delayedCall(700, () => {
            this.menuTexts.forEach((text, i) => {
                text.setVisible(true);
                text.setAlpha(0);
                this.tweens.add({
                    targets: text,
                    alpha: 1,
                    duration: 400,
                    delay: i * 100
                });
            });
            this.selectionBar.setVisible(true);


            this.input.on('pointerdown', this.handleMenuClick, this);
        });
    }

    createMenuItems() {
        const startY = 522;
        const spacing = 40;
        const menuX = this.sys.game.canvas.width - 60;

        this.menuTexts = [];

        this.menuItems.forEach((item, index) => {
            const y = startY + (index * spacing);


            const text = this.add.text(menuX, y, item.text, {
                font: '32px "머니그라피"',
                fill: '#ffffff',
                align: 'right'
            })
                .setOrigin(1, 0.5)
                .setInteractive();


            text.menuIndex = index;

            this.menuTexts.push(text);
        });
    }

    handleMenuClick(pointer) {

        if (this.isTransitioning) return;


        let clickedIndex = -1;

        this.menuTexts.forEach(text => {
            if (Phaser.Geom.Rectangle.Contains(text.getBounds(), pointer.x, pointer.y)) {
                clickedIndex = text.menuIndex;
            }
        });


        if (clickedIndex !== -1) {
            this.showSelectionAndTransition(clickedIndex);
        }
    }

    showSelectionAndTransition(index) {

        if (index < 0 || index >= this.menuItems.length) return;


        this.isTransitioning = true;


        this.menuTexts.forEach(text => {
            text.setFill('#ffffff');
        });


        this.selectedMenuIndex = index;
        const selectedText = this.menuTexts[index];


        this.selectionBar.setPosition(40, selectedText.y - 20); // y에서 20을 빼서 텍스트 중앙에 맞춤
        this.selectionBar.setVisible(true);
        this.selectionBar.setAlpha(1);


        selectedText.setFill('#3cbb89');


        this.selectionBar.setDepth(1);
        selectedText.setDepth(2);

        this.time.delayedCall(500, () => {
            this.startSelectedScene();
        });
    }

    fadeInOverlay() {
        this.blackOverlay.setAlpha(1).setVisible(true);
        this.tweens.add({
            targets: this.blackOverlay,
            alpha: 0,
            duration: 150,
            onComplete: () => {
                this.blackOverlay.setVisible(false);
            }
        });
    }

    fadeOutOverlay(callback) {
        this.blackOverlay.setAlpha(0).setVisible(true);
        this.tweens.add({
            targets: this.blackOverlay,
            alpha: 1,
            duration: 150,
            onComplete: () => {
                if (callback) callback();
            }
        });
    }

    startSelectedScene() {
        const selectedItem = this.menuItems[this.selectedMenuIndex];

        if (selectedItem.scene === 'GameScene') {
            const userLevel = parseInt(localStorage.getItem('level') || '1', 10);
            this.fadeOutOverlay(() => {


                this.scene.start('GameScene', { level: userLevel, health: 3, fromBlackOverlay: true });
            });
        } else {

            this.fadeOutOverlay(() => {
                this.scene.start(selectedItem.scene, { fromBlackOverlay: true });
            });
        }
    }

}