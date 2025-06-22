class SignupScene extends Phaser.Scene {
    constructor() {
        super('SignupScene');
    }

    preload() {

        this.load.image('signup_image', './assets/startscene/3_signup.png');
    }

    create() {
        const { width, height } = this.sys.game.canvas;


        this.add.image(width / 2, height / 2, 'signup_image')
            .setOrigin(0.5)
            .setDisplaySize(width, height);


        const inputStyle = 'width: 70%; padding: 8px; color: white; border: none; background: transparent; font-size: 18px; text-align: center; outline: none;';


        const nameInput = this.add.dom(width * 0.55, height * 0.301).createFromHTML(`<input type="text" style="${inputStyle}">`);
        nameInput.setOrigin(0.5);


        const idInput = this.add.dom(width * 0.55, height * 0.421).createFromHTML(`<input type="text" style="${inputStyle}">`);
        idInput.setOrigin(0.5);


        const passwordInput = this.add.dom(width * 0.55, height * 0.541).createFromHTML(`<input type="password" style="${inputStyle}">`);
        passwordInput.setOrigin(0.5);


        const confirmPasswordInput = this.add.dom(width * 0.55, height * 0.661).createFromHTML(`<input type="password" style="${inputStyle}">`);
        confirmPasswordInput.setOrigin(0.5);


        const backButton = this.add.rectangle(width * 0.27, height * 0.76, 120, 40, 0x000000, 0)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('LoginScene');
            });


        const signupButton = this.add.rectangle(width * 0.73, height * 0.76, 120, 40, 0x000000, 0)
            .setInteractive()
            .on('pointerdown', async () => {
                const name = nameInput.node.querySelector('input').value;
                const username = idInput.node.querySelector('input').value;
                const password = passwordInput.node.querySelector('input').value;
                const confirmPassword = confirmPasswordInput.node.querySelector('input').value;


                if (!name) {
                    alert('이름을 입력해주세요.');
                    return;
                }
                if (!username) {
                    alert('아이디를 입력해주세요.');
                    return;
                }
                if (!password) {
                    alert('비밀번호를 입력해주세요.');
                    return;
                }
                if (!confirmPassword) {
                    alert('비밀번호 확인을 입력해주세요.');
                    return;
                }
                if (password !== confirmPassword) {
                    alert('비밀번호가 일치하지 않습니다.');
                    return;
                }

                try {
                    const response = await this.signupRequest(name, username, password);
                    alert(response.message || '회원가입이 완료되었습니다.');
                    this.scene.start('LoginScene');
                } catch (error) {
                    console.error('회원가입 에러:', error);
                    alert(error.message || '회원가입 처리 중 오류가 발생했습니다.');
                }
            });




    }


    async signupRequest(name, username, password) {
        try {

            const requestData = {
                name: name.trim(),
                username: username.trim(),
                password: password.trim(),

                email: `${username.trim()}@example.com`, 
                phone: "010-0000-0000" 
            };

            console.log("전송할 데이터:", requestData);

            const response = await fetch('http://43.201.253.146:8000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log('응답 상태:', response.status);
            
            const responseData = await response.text();
            console.log('응답 데이터:', responseData);

            if (!response.ok) {
                let errorMessage = '회원가입에 실패했습니다.';
                try {
                    const errorData = JSON.parse(responseData);
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = `서버 오류: ${response.status} - ${responseData}`;
                }
                throw new Error(errorMessage);
            }

            return JSON.parse(responseData);
        } catch (error) {
            console.error('Signup request failed:', error);
            throw error;
        }
    }
}
