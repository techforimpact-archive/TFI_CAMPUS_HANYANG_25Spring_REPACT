class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');

        this.menuItems = [
            { text: '게임 시작', scene: 'GameScene' },
            { text: '게임 방법', scene: 'HowToPlayScene' },
            { text: '마이페이지', scene: 'MyPageScene' } 
        ];
        this.selectedMenuIndex = -1; 
        this.menuTexts = [];
        this.selectionBar = null;
        this.isTransitioning = false; 
        this.userName = ''; 
    }

    preload() {
        this.load.image('background_img', 'assets/images/main_background.png');
        this.load.image('selection_bar', 'assets/images/white_bar.png');
    }

    create() {
        this.isTransitioning = false;

        if (localStorage.getItem('returnToBootScene') === 'true') {
            localStorage.removeItem('returnToBootScene');
        }

        const { width, height } = this.sys.game.canvas;

        this.userName = localStorage.getItem('name') || localStorage.getItem('username') || '000';
        this.add.image(0, 0, 'background_img')
            .setOrigin(0, 0)
            .setDisplaySize(width, height);
        this.selectionBar = this.add.image(40, 520, 'selection_bar')
            .setOrigin(0, 0) 
            .setDisplaySize(360, 40) 
            .setVisible(false)
            .setAlpha(0);
        this.createMenuItems();

        this.input.on('pointerdown', this.handleMenuClick, this);

        this.blackOverlay = this.add.rectangle(0, 0, this.sys.game.canvas.width, this.sys.game.canvas.height, 0x3cbb89)
            .setOrigin(0, 0)
            .setAlpha(0)
            .setDepth(100)
            .setVisible(false);

        this.fadeInOverlay();

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

        this.selectionBar.setPosition(40, selectedText.y - 20);
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
                this.scene.start('GameScene', { level: 2, health: 3, fromBlackOverlay: true });

            });
        } else {
            this.fadeOutOverlay(() => {
                this.scene.start(selectedItem.scene, { fromBlackOverlay: true });
            });
        }
    }

}