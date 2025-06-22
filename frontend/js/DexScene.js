class DexScene extends Phaser.Scene {
    constructor() {
        super('DexScene');
        this.isTransitioning = false;
    }

    create() {
        this.isTransitioning = false;
        
        const { width, height } = this.sys.game.canvas;
        
        this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
        
        this.add.text(width / 2, height * 0.1, '도감', {
            fontFamily: '머니그라피',
            fontSize: '36px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        const backButton = this.add.rectangle(width * 0.1, height * 0.05, 80, 40, 0x34495e)
            .setInteractive();
            
        this.add.text(width * 0.1, height * 0.05, '뒤로가기', {
            fontFamily: '머니그라피',
            fontSize: '16px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        backButton.on('pointerdown', () => {
            if (!this.isTransitioning) {
                this.isTransitioning = true;
                this.scene.start('MyPageScene');
            }
        });
    }
}