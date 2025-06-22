class LoginInputScene extends Phaser.Scene {
  constructor() {
    super('LoginInputScene');  
  }

  preload() {

    this.load.image('login_image', './assets/startscene/login.png');




  }

  create() {
    const { width, height } = this.sys.game.canvas;


    this.add.image(width / 2, height / 2, 'login_image')
      .setOrigin(0.5)
      .setDisplaySize(width, height);


    const inputStyle = 'width: 250px; padding: 10px; color: white; border: none; background: transparent; font-size: 18px; text-align: center; outline: none;';


    const idInput = this.add.dom(width * 0.5, height * 0.4).createFromHTML(`<input type="text" placeholder="" style="${inputStyle}">`);
    idInput.setOrigin(0.5);


    const pwInput = this.add.dom(width * 0.5, height * 0.54).createFromHTML(`<input type="password" placeholder="" style="${inputStyle}">`);
    pwInput.setOrigin(0.5);


    const loginButton = this.add.rectangle(width * 0.7, height * 0.64, 120, 40, 0x000000, 0)
      .setInteractive();


    const backButton = this.add.rectangle(width * 0.28, height * 0.64, 120, 40, 0x000000, 0)
      .setInteractive();


    this.blackOverlay = this.add.rectangle(0, 0, width, height, 0x3cbb89)
      .setOrigin(0, 0)
      .setAlpha(0)
      .setDepth(100) 
      .setVisible(false);


    loginButton.on('pointerdown', async () => {
      const username = idInput.node.querySelector('input').value;
      const password = pwInput.node.querySelector('input').value;

      if (!username || !password) {
        alert('아이디와 비밀번호를 입력해주세요.');
        return;
      }

      try {
        const response = await this.loginRequest(username, password);
        localStorage.setItem('username', username);
        alert('로그인 성공!');


        this.blackOverlay.setVisible(true);


        this.tweens.add({
          targets: this.blackOverlay,
          alpha: 1,
          duration: 300,
          onComplete: () => {

            this.scene.start('BootScene', { fromBlackOverlay: true });
          }
        });

      } catch (error) {
        alert('로그인 실패: ' + error.message);
      }
    });
    backButton.on('pointerdown', () => {
      this.scene.start('LoginScene');
    });


  }

  async loginRequest(username, password) {
    try {
      const response = await fetch('http://43.201.253.146:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  }
}
