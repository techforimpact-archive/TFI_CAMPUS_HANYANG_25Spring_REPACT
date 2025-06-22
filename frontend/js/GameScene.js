class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        localStorage.clear();
        sessionStorage.clear();
        console.log('GameScene: Constructor 실행.');

        this.lastTouchTime = 0;
        this.canClick = true; 


        this.level = 2;
        this.currentRound = 1; 
        this.maxRounds = 5; 
        this.score = 0; 
        this.health = 3; 
        this.AVERAGE_LEVEL_TIME = 60 * 1000; 



        this.levelRounds = {
            1: [
                { round: 1, itemId: 'glass_bottle', type: 1 },
                { round: 2, itemId: 'milk_carton', type: 2 },
                { round: 3, itemId: 'newspaper', type: 1 },
                { round: 4, itemId: 'plastic_bottle', type: 2 },
                { round: 5, itemId: 'chicken_bone', type: 3 }
            ],
            2: [
                { round: 1, itemId: 'can', type: 1 },
                { round: 2, itemId: 'tang', type: 3 },
                { round: 3, itemId: 'book', type: 1 },
                { round: 4, itemId: 'deliverplastic', type: 2 },
                { round: 5, itemId: 'soimilk', type: 2 }
            ],
            3: [
                { round: 1, itemId: 'handwash', type: 2 },
                { round: 2, itemId: 'localstock', type: 1 },
                { round: 3, itemId: 'heimili', type: 2 },
                { round: 4, isSpecial: true } 

            ],

        };
        this.getRoundData = () => this.levelRounds[this.level] || [];

        this.scoreText = null;
        this.levelText = null;
        this.roundText = null; 
        this.timeText = null;
        this.heartGraphics = [];
        this.itemNameText = null;


        this.preprocessingSteps = null;
        this.currentPreprocessingStep = 0;
        this.currentCommandIndex = 0; 
        this.messageCommandImages = []; 
        this.messageTexts = [];


        this.ANIMATION_TIMING = {
            BLINK_DURATION: 150,      
            BLINK_COUNT: 3,          
            FADE_OUT_DURATION: 1000,   
            NEXT_ROUND_DELAY: 2500,  
            LINE_BLINK_DURATION: 200, 
            LINE_BLINK_COUNT: 3      
        };


        this.currentGameType = 1; 
        this.gameState = 'playing'; 
        this.itemTimeLimit = 10; 
        this.itemTimeRemaining = this.itemTimeLimit;
        this.currentTrashItemGraphic = null;
        this.currentTrashItemData = null;
        this.cursors = null;
        this.spaceKey = null;
        this.fastFallMultiplier = 4;
        this.currentLaneIndex = 0;
        this.isFalling = false;
        this.isProcessingResult = false;


        this.moveLeft = false;
        this.moveRight = false;
        this.moveDownFast = false;
        this.keyboardMoveDelay = 150;
        this.lastKeyboardMoveTime = 0;
        this.lastLandedLaneIndex = 0;


        this.wasteRulesData = [

            {
                id: 'glass_bottle',
                name: '유리병',
                type: 1,
                difficulty: 1,
                correctBin: 'bin_glass',
                messageInitial: '유리병이 나타났어.\n어디에 분리배출 해야 할까?',
                messageCorrect: '정답이야!\n유리병은 유리 전용 수거함에 버려야 해!',
                messageIncorrect: '오답이야!\n유리병의 배출 방법을 다시 생각해볼까?'
            },
            {
                id: 'newspaper',
                name: '신문지',
                type: 1,
                difficulty: 1,
                correctBin: 'bin_paper',
                messageInitial: '신문지가 나타났어.\n어디에 분리배출 해야 할까?',
                messageCorrect: '정답이야!\n신문지는 종이 전용 수거함에 버려야 해!',
                messageIncorrect: '오답이야!\n신문지의 배출 방법을 다시 생각해볼까?'
            },
            {
                id: 'can',
                name: '음료수 캔',
                type: 1,
                difficulty: 1,
                correctBin: 'bin_can',
                messageInitial: '음료수 캔이 나타났어.\n어디에 분리배출 해야 할까?',
                messageCorrect: '정답이야!\n음료수 캔은 캔 전용 수거함에 버려야 해!',
                messageIncorrect: '오답이야!\n음료수 캔의 배출 방법을 다시 생각해볼까?'
            },
            {
                id: 'book',
                name: '책',
                type: 1,
                difficulty: 1,
                correctBin: 'bin_paper',
                messageInitial: '책이 나타났어.\n어디에 분리배출 해야 할까?',
                messageCorrect: '정답이야!\n책은 종이 전용 수거함에 버려야 해!',
                messageIncorrect: '오답이야!\n책의 배출 방법을 다시 생각해볼까?'
            },
            {
                id: 'localstock',
                name: '비타민 가득 현미팩',
                type: 1,
                difficulty: 2,
                correctBin: 'bin_pack',
                messageInitial: '맛 좋은 유기농 로컬스톡 현미팩이 나타났어.\n어디에 분리배출 해야 할까?',
                messageCorrect: '정답이야! 현미팩은\n종이팩(멸균팩) 전용 수거함에 버려야 해!',
                messageIncorrect: '오답이야!\n현미팩의 배출 방법을 다시 생각해볼까?'
            },

            {
                id: 'milk_carton',
                name: '우유팩',
                preprocessedName: '세척하고 말린 우유팩',
                type: 2,
                difficulty: 3,
                correctBin: 'bin_pack',
                requiresPreprocessing: true,
                preprocessingSteps: [
                    {
                        text: '펼치고',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '물로 헹군 뒤',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                    {
                        text: '말린 다음',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '차곡 차곡 모으기',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                ],
                messageInitial: 'xx우유 500ml 쓰레기가 나타났어.\n근데 이대로는 분리배출이 안될 것 같은데...',
                messageWarning: 'xx우유 500ml 쓰레기가 나타났어.\n근데 이대로는 분리배출이 안될 것 같은데...',
                messagePreprocessingComplete: "휴, 드디어 우유팩을 분리배출 가능한 \n상태로 만들었어!", 
                messageAfterPreprocessing: "자, 이제 그럼 다시 분리배출 해볼까?", 
                messageCorrect: "정답이야!\n우유팩은 일반 종이팩으로 배출해야해.",
                messageIncorrect: "오답이야!\n우유팩의 배출 방법을 다시 생각해 볼까?"
            },
            {
                id: 'plastic_bottle',
                name: '플라스틱 병',
                preprocessedName: '라벨 제거한 플라스틱 병',
                type: 2,
                difficulty: 2,
                correctBin: 'bin_plastic',
                requiresPreprocessing: true,
                preprocessingSteps: [
                    {
                        text: '라벨을 떼서 버리고',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '물로 헹군 뒤',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                    {
                        text: '뚜껑을 분리하기',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                ],
                messageInitial: '플라스틱 병이 나타났어.\n분리배출하려면 준비가 필요해!',
                messageWarning: '쓰레기가 쓰레기통으로 떨어지지 않네?\n플라스틱 병의 분리배출 과정이 필요해!',
                messagePreprocessingComplete: "휴, 드디어 플라스틱 병을 분리배출 가능한 \n상태로 만들었어!",
                messageCorrect: "정답이야!\n플라스틱 병은 플라스틱으로 배출해야해.",
                messageIncorrect: "오답이야!\n우리 한 번 다시 생각해 볼까?"
            },
            {
                id: 'soimilk',
                name: '두유팩',
                preprocessedName: '세척하고 말린 두유팩',
                type: 2,
                difficulty: 3,
                correctBin: 'bin_pack',
                requiresPreprocessing: true,
                preprocessingSteps: [
                    {
                        text: '펼치고',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '물로 헹군 뒤',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                    {
                        text: '말린 다음',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '차곡 차곡 모으기',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                ],
                messageInitial: 'xx두유 200ml 쓰레기가 나타났어.\n근데 이대로는 분리배출이 안될 것 같은데...',
                messageWarning: 'xx두유 200ml 쓰레기가 나타났어.\n근데 이대로는 분리배출이 안될 것 같은데...',
                messagePreprocessed: "잘 정리됐어! 이제 종이팩 수거함에 넣자!",
                messagePreprocessingComplete: "휴, 드디어 두유팩을\n분리배출 가능한 상태로 만들었어!",
                messageAfterPreprocessing: "자, 이제 그럼 다시 분리배출 해볼까?", 
                messageCorrect: "정답이야! 두유팩은 멸균팩으로 배출해야해.\n 일반 종이팩과는 구별해야하니 명심해!!!",
                messageIncorrect: "오답이야!\n두유팩의 배출 방법을 다시 생각해 볼까?"
            },
            {
                id: 'deliverplastic',
                name: '양념이 묻은 배달용기',
                preprocessedName: '세척하고 말린 배달용기',
                type: 2,
                difficulty: 3,
                correctBin: 'bin_plastic',
                requiresPreprocessing: true,
                preprocessingSteps: [
                    {
                        text: '물로 헹구고',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                    {
                        text: '말린 뒤',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '용기만 남긴 채 배출',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' },
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                ],
                messageInitial: '양념이 묻은 배달용기가 나타났어.\n근데 이대로는 분리배출이 안될 것 같은데...',
                messageWarning: '양념이 묻은 배달용기 쓰레기가 나타났어.\n근데 이대로는 분리배출이 안될 것 같은데...',
                messagePreprocessed: "잘 정리됐어! 이제 종이팩 수거함에 넣자!",
                messagePreprocessingComplete: "휴, 드디어 양념이 묻은 배달용기를 \n분리배출 가능한 상태로 만들었어!", 
                messageAfterPreprocessing: "자, 이제 그럼 다시 분리배출 해볼까?", 
                messageCorrect: "정답이야!\n세척한 용기는 플라스틱으로 배출해야해.",
                messageIncorrect: "오답이야!\n배달용기의 배출 방법을 다시 생각해 볼까?"
            },

            {
                id: 'handwash',
                name: '유한킴벌리 핸드워시',
                preprocessedName: '펼쳐서 말린 핸드워시',
                type: 2,
                difficulty: 3,
                correctBin: 'bin_pack',
                requiresPreprocessing: true,
                preprocessingSteps: [
                    {
                        text: '펌프와 홀더는 분리해 재사용하고',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '물로 헹군 뒤',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                    {
                        text: '펼치고',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '말린 다음',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '차곡 차곡 모으기',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                ],

                messageInitial: '다 쓴 유한킴벌리 핸드워시가 나타났어.\n분리배출 후 리필 제품으로 교체하자!',
                messageWarning: '다 쓴 유한킴벌리 핸드워시가 나타났어.\n분리배출 후 리필 제품으로 교체하자!',
                messagePreprocessingComplete: "휴, 드디어 핸드워시 팩을\n분리배출 가능한 상태로 만들었어!", 
                messageAfterPreprocessing: "펼쳐서 말린 핸드워시 팩은\n어디에 버려야 할까?", 
                messageCorrect: "정답이야! 종이팩(멸균팩)으로 버려야 해.\n일반 종이팩과 구분해야 하는 점 잊지마!",
                messageIncorrect: "오답이야!\n핸드워시 팩 배출 방법을 다시 생각해 볼까?"
            },
            {
                id: 'heimili',
                name: '헤이밀리 주방 세제',
                preprocessedName: '플라스틱을 제거한 세재팩',
                type: 2,
                difficulty: 3,
                correctBin: 'bin_pack',
                requiresPreprocessing: true,
                preprocessingSteps: [
                    {
                        text: '입구의 플라스틱 캡을 제거하고',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '물로 헹군 뒤',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                    {
                        text: '펼치고',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '말려서',
                        commands: [
                            { action: 'left', key: '←', color: '#FF9500' },
                            { action: 'right', key: '→', color: '#0080FF' }
                        ]
                    },
                    {
                        text: '차곡 차곡 모으기',
                        commands: [
                            { action: 'down', key: '↓', color: '#00FF00' }
                        ]
                    },
                ],
                messageInitial: '다 쓴 헤이밀리 주방 세제가 나타났어.\n미세플라스틱 걱정없이 세척할 수 있었어!',
                messageWarning: '다 쓴 헤이밀리 주방 세제가 나타났어.\n미세플라스틱 걱정없이 세척할 수 있었어!',
                messagePreprocessingComplete: "휴, 드디어 헤이밀리 팩을\n분리배출 가능한 상태로 만들었어!", 
                messageAfterPreprocessing: "아까 분리한 입구와 캡은\n어디에 버려야 할까?", 
                messageCorrect: "정답이야! 종이팩(멸균팩)으로 버려야 해.\n일반 종이팩과 구분해야 하는 점 잊지마!",
                messageIncorrect: "오답이야!\n헤이밀리 팩 배출 방법을 다시 생각해 볼까?"
            },


            {
                id: 'chicken_bone',
                name: '닭뼈',
                type: 3,
                difficulty: 2,
                correctBin: 'bin_general', 
                quizQuestion: '닭뼈는 어떤 종류의 쓰레기일까?\n알맞은 분리배출 방법을 선택해보자!',
                quizOptions: {
                    left: '일반쓰레기',
                    right: '음식쓰레기'
                },
                correctAnswer: 'left',
                messageCorrect: '정답이야!\n닭뼈는 일반쓰레기로 버려야 해!',
                messageIncorrect: '오답이야!\n닭뼈의 배출 방법을 다시 생각해볼까?'
            },
            {
                id: 'tang',
                name: '귤 껍질',
                type: 3,
                difficulty: 2,
                correctBin: 'bin_food', 
                quizQuestion: '귤 껍질은 어떤 종류의 쓰레기일까?\n알맞은 분리배출 방법을 선택해보자!',
                quizOptions: {
                    left: '일반쓰레기',
                    right: '음식쓰레기'
                },
                correctAnswer: 'right', 
                messageCorrect: '정답이야!\n귤 껍질은 음식쓰레기로 버려야 해!',
                messageIncorrect: '오답이야!\n귤 껍질의 배출 방법을 다시 생각해볼까?'
            }
        ];
        this.specialData = {
            id: 'special_paper_recycle',

            popupMessage: '잠깐! 이렇게 분리배출한 종이팩들은 \n어떻게 재활용되는걸까?',

            warningImageKey: 'special_warning_slide_img',

            introText: '종이팩이 재활용 되는 과정을 알아보자',

            startMessage: '종이팩의 재활용 과정을 알아보자!',

            steps: [
                {
                    text: '1. 깨끗한 종이팩을 따로 골라줘요.',
                    imageKey: 'special_step1_img',
                    commands: [
                        { action: 'left', key: '←' }
                    ]
                },
                {
                    text: '2. 물에 담가 펄프와 비닐,\n알루미늄을 깨끗하게 분리해요.',
                    imageKey: 'special_step2_img',
                    commands: [
                        { action: 'down', key: '↓' },
                        { action: 'down', key: '↓' },
                        { action: 'right', key: '→' }
                    ]
                },
                {
                    text: '3. 남은 이물질을 정리하고,\n펄프만 남겨 깨끗하게 다듬어요.',
                    imageKey: 'special_step3_img',
                    commands: [
                        { action: 'right', key: '→' },
                        { action: 'left', key: '←' }
                    ]
                },
                {
                    text: '4. 정리된 펄프는\n부드러운 화장지로 다시 태어나요.',
                    imageKey: 'special_step4_img',
                    commands: [
                        { action: 'right', key: '→' },
                        { action: 'right', key: '→' }
                    ]
                }
            ],
            completeMessage: 'Special Round 500포인트 획득!\n그럼 이제 종이팩 재활용 실천하러 가자!'
        };


        this.binKeys = ['bin_glass', 'bin_paper', 'bin_pack', 'bin_can', 'bin_plastic'];
        this.binNames = ['유리병', '종이', '종이팩', '캔고철', '플라스틱'];
        this.binColors = {
            'bin_glass': 0x00ff00,
            'bin_paper': 0x0000ff,
            'bin_pack': 0xff0000,
            'bin_can': 0xffff00,
            'bin_plastic': 0x800080
        };
        this.laneCenterXPositions = [];
        this.binTopLabelYPositions = [];
        this.binImages = [];
        this.currentOpenBinIndex = -1;
        this.binGraphics = [];
        this.commandButtons = {};


        this.uiContainers = {};


        this.currentPreprocessingStep = 0;
        this.isWaitingForCommand = false;
        this.preprocessingStepGraphics = [];


        this.quizDropZones = [];
        this.selectedQuizAnswer = null;


        this.panel = { x: 0, y: 0, width: 0, height: 0 };
        this.messageArea = { x: 0, y: 0, width: 0, height: 0 };
        this.commandButtonArea = { y: 0 };


        this.messageAreaGraphic = null;
        this.messageTextObject = null;
        this.resultButton = null;
        this.resultButtonText = null;
        this.lastResultIsCorrect = false;
    }

    preload() {
        console.log('GameScene: preload 실행.');
        this.load.image('panel_img', 'assets/images/mainA.png');
        this.load.image('type3_panel_img', 'assets/images/mainC.png');
        this.load.image('message_area_img', 'assets/images/message_board.png');
        this.load.image('heart_full_img', 'assets/images/heart_full.png');
        this.load.image('heart_empty_img', 'assets/images/heart_empty.png');
        this.load.image('back_button_img', 'assets/images/back.png');
        this.load.image('menu_button_img', 'assets/images/menu.png');
        this.load.image('lane_line_img', 'assets/images/type1_line.png');
        this.load.image('green_line_img', 'assets/images/right_line.png');
        this.load.image('red_line_img', 'assets/images/false_line.png');
        this.load.image('retry_button', 'assets/images/retry_button.png');


        this.load.image('round_black_img', 'assets/images/round_black.png');
        this.load.image('round_gray_img', 'assets/images/round_gray.png');
        this.load.image('round_connected_img', 'assets/images/round_connected.png');


        this.load.image('button_left_img', 'assets/images/button_left.png');
        this.load.image('button_down_img', 'assets/images/button_down.png');
        this.load.image('button_right_img', 'assets/images/button_right.png');

        this.load.image('button_left_pressed_img', 'assets/images/button_left_p.png');
        this.load.image('button_down_pressed_img', 'assets/images/button_down_p.png');
        this.load.image('button_right_pressed_img', 'assets/images/button_right_p.png');

        this.binKeys.forEach(key => {
            const binImageKey = `${key}_img`;
            const binImagePath = `assets/images/${key}.png`;
            this.load.image(binImageKey, binImagePath);

            const binOpenImageKey = `${key}_open_img`;
            const binOpenImagePath = `assets/images/${key}_open.png`;
            this.load.image(binOpenImageKey, binOpenImagePath);
        });


        this.wasteRulesData.forEach(item => {
            if (item.type === 1) {
                this.load.image(`${item.id}_img`, `assets/item/${item.id}.png`);
                this.load.image(`${item.id}_black_img`, `assets/item/${item.id}_black.png`);
            }
            if (item.type === 3) {
                this.load.image(`${item.id}_img`, `assets/item/${item.id}.png`);
                this.load.image(`${item.id}_black_img`, `assets/item/${item.id}_black.png`);
            }
        });


        this.wasteRulesData.forEach(item => {
            if (item.type === 2) {

                this.load.image(`${item.id}_warning_img`, `assets/item/${item.id}_warning.png`);


                if (item.preprocessingSteps) {
                    for (let i = 1; i <= item.preprocessingSteps.length + 1; i++) {
                        this.load.image(`${item.id}_step${i}_img`, `assets/item/${item.id}_step${i}.png`);
                    }
                }


                this.load.image(`${item.id}_preprocessed_img`, `assets/item/${item.id}_preprocessed.png`);
            }
        });


        this.load.image('warning_slide_img', 'assets/images/warning_animation.png');
        this.load.image('popup_bg_img', 'assets/images/popup_bg.png');
        this.load.image('left_key_img', 'assets/images/cd_button_left.png');
        this.load.image('down_key_img', 'assets/images/cd_button_down.png');
        this.load.image('right_key_img', 'assets/images/cd_button_right.png');
        this.load.image('left_key_dim_img', 'assets/images/left_key_dim.png');
        this.load.image('down_key_dim_img', 'assets/images/down_key_dim.png');
        this.load.image('right_key_dim_img', 'assets/images/right_key_dim.png');


        this.load.image('special_warning_slide_img', 'assets/images/special_warning_slide_img.png');
        this.load.image('special_step1_img', 'assets/images/special_step1_img.png');
        this.load.image('special_step2_img', 'assets/images/special_step2_img.png');
        this.load.image('special_step3_img', 'assets/images/special_step3_img.png');
        this.load.image('special_step4_img', 'assets/images/special_step4_img.png');
    }

    init(data) {
        this.fromBlackOverlay = data.fromBlackOverlay || false;



        this.level = (data && data.level) ? data.level : parseInt(localStorage.getItem('level') || '1', 10);
        this.currentRound = 1;
        this.maxRounds = this.getRoundData().length;
        this.score = 0;

        if (typeof data.health === 'number') {
            this.health = data.health;
        } else if (typeof this.health !== 'number') {
            this.health = 3;
        }
        this.isFalling = false;
        this.isProcessingResult = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveDownFast = false;
        this.lastKeyboardMoveTime = 0;
        this.lastLandedLaneIndex = 0;
        this.itemTimeRemaining = this.itemTimeLimit;
        this.currentOpenBinIndex = -1;
        this.gameState = 'playing';
        this.currentGameType = 1;
        this.fallCount = 0;
        this.levelStartTime = 0;
        this.currentTrashItemGraphic = null;
        this.currentTrashItemData = null;
        this.touchText = null;
        this.preprocessingSteps = null;
        this.currentPreprocessingStep = 0;
        this.currentCommandIndex = 0;
        this.messageCommandImages = [];
        this.messageTexts = [];
        this.lastResultIsCorrect = false;
        this.isWaitingForCommand = false;
        this.selectedQuizAnswer = null;
        this.cursors = null;
        this.spaceKey = null;
        this.fastFallMultiplier = 4;
        this.laneCenterXPositions = [];
        this.binTopLabelYPositions = [];
        this.binImages = [];
        this.binGraphics = [];
        this.binNameTexts = [];
        this.commandButtons = {};
        this.uiContainers = {};
        this.heartGraphics = [];
        this.itemNameText = null;
        this.roundGraphics = [];
        this.resultButton = null;
        this.resultButtonText = null;
        this.messageAreaGraphic = null;
        this.messageTextObject = null;
        this.difficultyText = null;
        this.levelText = null;
        this.scoreText = null;
        this.roundText = null;
        this.timeText = null;
        this.warningSlide = null;
        this.preprocessingPopupBg = null;
        this.preprocessingItemImage = null;
        this.type3Panel = null;
        this.type3TempPanel = null;
        this.type3LeftPanel = null;
        this.type3RightPanel = null;
        this.type3LeftText = null;
        this.type3RightText = null;
        this.leftChoiceText = null;
        this.rightChoiceText = null;
        this.incorrectPopupBg = null;
        this.retryButton = null;
        this.retryButtonText = null;
        this.blackOverlay = null;
        this.lastFallTime = 0;
        this.selectedQuizAnswer = null;
        this.quizDropZones = [];
        this.fromBlackOverlay = data && data.fromBlackOverlay;


        if (data.level) {
            this.level = data.level;

            this.currentRound = 1;
            this.maxRounds = this.getRoundData().length;
            console.log('GameScene: 새 레벨로 시작:', this.level);
        }
    }

    create() {
        console.log('GameScene: create 실행.');


        this.cameras.main.setBackgroundColor('#3cbb89');
        this.createUIContainers();
        this.createCommonUI();
        this.createType1UI();
        this.createType2UI();
        this.createType3UI();
         this.uiContainers.type1.setVisible(false);
        this.uiContainers.type2.setVisible(false);
        this.uiContainers.type3.setVisible(false);
        this.uiContainers.type2Popup.setVisible(false);
        this.setupInput();
        this.resetGameState();


        const { width, height } = this.sys.game.canvas;
        this.blackOverlay = this.add.rectangle(0, 0, width, height, 0x3cbb89)
            .setOrigin(0, 0)
            .setAlpha(1)
            .setDepth(100);


        this.tweens.add({
            targets: this.blackOverlay,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.blackOverlay.destroy();

                this.isFalling = true;
                this.lastFallTime = this.game.getTime();
            }
        });

        console.log('GameScene: create 완료.');
    }

    createUIContainers() {

        this.uiContainers.common = this.add.container(); 
        this.uiContainers.type1 = this.add.container();  
        this.uiContainers.type2 = this.add.container();  
        this.uiContainers.type3 = this.add.container();  
        this.uiContainers.type2Popup = this.add.container();

        this.uiContainers.type1.setVisible(false);
        this.uiContainers.type2.setVisible(false);
        this.uiContainers.type3.setVisible(false);
        this.uiContainers.type2Popup.setVisible(false);
    }

    createCommonUI() {
        const { width, height } = this.sys.game.canvas;


        this.cameras.main.setBackgroundColor('#3CBB89'); 


        this.panel.width = 330;
        this.panel.height = 445;
        this.panel.x = width / 2;
        this.panel.y = 180 + (this.panel.height * 0.5);


        this.mainPanelImage = this.add.image(this.panel.x, this.panel.y, 'panel_img')
            .setDisplaySize(this.panel.width, this.panel.height)
            .setOrigin(0.5)
            .setDepth(0);
        this.uiContainers.common.add(this.mainPanelImage);


        this.messageArea.width = 330;
        this.messageArea.height = 105;
        this.messageArea.x = width / 2;
        this.messageArea.y = 640 + this.messageArea.height / 2; 

        this.messageAreaGraphic = this.add.image(this.messageArea.x, this.messageArea.y, 'message_area_img')
            .setDisplaySize(this.messageArea.width, this.messageArea.height)
            .setOrigin(0.5)
            .setVisible(true);
        this.uiContainers.common.add(this.messageAreaGraphic);

        const messageStyle = {
            font: '16px "머니그라피"', 
            fill: '#303030',
            align: 'left', 
            wordWrap: { width: this.messageArea.width - 20 },
            letterSpacing: 0,   
            lineSpacing: 16   
        };


        this.messageTextObject = this.add.text(80, 663, '', messageStyle)
            .setOrigin(0, 0)
            .setDepth(1)
            .setVisible(true);
        this.uiContainers.common.add(this.messageTextObject);


        const topY = 120;


        this.add.text(width * 0.35, topY - 5, '레벨', {
            font: '12px 머니그라피',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5, 0);

        this.levelText = this.add.text(width * 0.35, topY + 12, '레벨 1', {
            font: '20px 머니그라피',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5, 0);
        this.uiContainers.common.add(this.levelText);


        this.add.text(width * 0.5, topY - 5, '환경 점수', {
            font: '12px 머니그라피',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5, 0);

        this.scoreText = this.add.text(width * 0.5, topY + 12, '점수: 0', {
            font: '20px 머니그라피',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5, 0);
        this.uiContainers.common.add(this.scoreText);


        this.add.text(width * 0.65, topY - 5, '난이도', {
            font: '12px 머니그라피',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5, 0);

        this.difficultyText = this.add.text(width * 0.65, topY + 12, '난이도 1', {
            font: '20px 머니그라피',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5, 0);
        this.uiContainers.common.add(this.difficultyText);


        const backButton = this.add.image(80, 120, 'back_button_img')
            .setDisplaySize(29, 33)
            .setInteractive()
            .setOrigin(0, 0)
            .on('pointerdown', () => this.handleBackButton());  
        this.uiContainers.common.add(backButton);


        const menuButton = this.add.image(330, 120, 'menu_button_img')
            .setDisplaySize(30, 33)
            .setInteractive()
            .setOrigin(0, 0)
            .on('pointerdown', () => this.handleMenuButton()); 
        this.uiContainers.common.add(menuButton);

        this.createRoundsUI();


        this.createHeartsUI();


        this.createCommandButtons();


        this.createResultButtons();
    }

    displayItemName(itemData) {
        const { width } = this.sys.game.canvas;


        console.log('displayItemName 호출됨');
        console.log('itemData:', itemData);
        console.log('itemData.type:', itemData.type);
        console.log('itemData.preprocessedName:', itemData.preprocessedName);
        console.log('currentTrashItemGraphic:', this.currentTrashItemGraphic);
        console.log('texture key:', this.currentTrashItemGraphic ? this.currentTrashItemGraphic.texture.key : 'null');


        if (this.itemNameText) {
            this.itemNameText.destroy();
        }


        let itemName = itemData.name;


        if (itemData.type === 2) {

            if (this.currentTrashItemGraphic &&
                this.currentTrashItemGraphic.texture.key.includes('_preprocessed')) {

                if (itemData.preprocessedName) {
                    itemName = itemData.preprocessedName;
                    console.log('TYPE2 전처리 후 이름 (preprocessedName):', itemName);
                } else {
                    itemName = itemData.name;
                    console.log('TYPE2 전처리 후 이름 (기본 name):', itemName);
                }
            } else {

                itemName = itemData.name + '?';
                console.log('TYPE2 전처리 전 이름:', itemName);
            }
        } else {

            itemName = itemData.name;
            console.log('TYPE1/TYPE3 기본 이름:', itemName);
        }


        this.itemNameText = this.add.text(width / 2, 210, itemName, {
            font: '24px "머니그라피"',
            fill: '#FFFFFF',
            align: 'center',
            letterSpacing: 5 
        })
            .setOrigin(0.5)
            .setDepth(15); 


        if (this.uiContainers && this.uiContainers.common) {
            this.uiContainers.common.add(this.itemNameText);
        }

        console.log('최종 아이템 이름 표시:', itemName);
    }

    handleBackButton() {

        console.log('뒤로가기 버튼 클릭됨');

        this.scene.start('PreviousScene');
    }

    handleMenuButton() {

        console.log('메뉴 버튼 클릭됨');

        this.showMenu();
    }

    createHeartsUI() {


        const heartY = 260;
        const firstHeartX = 285; 
        const heartWidth = 21;   
        const heartHeight = 18; 
        const heartSpacing = 6; 

        this.heartGraphics = [];


        for (let i = 0; i < 3; i++) {

            const x = firstHeartX + (i * (heartWidth + heartSpacing));

            const heartImg = this.add.image(x, heartY, 'heart_full_img')
                .setDisplaySize(heartWidth, heartHeight)
                .setOrigin(0, 0);

            this.heartGraphics.push(heartImg);
            this.uiContainers.common.add(heartImg);
        }
    }

    createRoundsUI() {

        if (this.roundGraphics) {
            this.roundGraphics.forEach(graphic => graphic.destroy());
        }
        this.roundGraphics = [];


        const currentLevelRounds = this.getRoundData().length;
        console.log('현재 레벨 라운드 수:', currentLevelRounds);


        const roundY = 260;
        const firstRoundX = 80;
        const roundSize = 15;
        const roundSpacing = 5;


        for (let i = 0; i < currentLevelRounds; i++) {
            const x = firstRoundX + (i * (roundSize + roundSpacing));


            const textureKey = (i === 0) ? 'round_black_img' : 'round_gray_img';

            const roundImg = this.add.image(x, roundY, textureKey)
                .setDisplaySize(roundSize, roundSize)
                .setOrigin(0, 0);

            this.roundGraphics.push(roundImg);
            this.uiContainers.common.add(roundImg);
        }


        this.maxRounds = currentLevelRounds;
        console.log('라운드 UI 생성 완료. 총 라운드:', currentLevelRounds);
    }

    createResultButtons() {
        const resultButtonWidth = 100;
        const resultButtonHeight = 40;
        const resultButtonX = this.messageArea.x + this.messageArea.width / 2 - resultButtonWidth - 10;
        const resultButtonY = this.messageArea.y + this.messageArea.height / 2 - resultButtonHeight - 10;

        this.resultButton = this.add.rectangle(resultButtonX, resultButtonY, resultButtonWidth, resultButtonHeight, 0x00ff00)
            .setInteractive()
            .setVisible(false);
        this.uiContainers.common.add(this.resultButton);

        const resultButtonStyle = { font: '18px Arial', fill: '#ffffff', align: 'center' };
        this.resultButtonText = this.add.text(resultButtonX, resultButtonY, '', resultButtonStyle)
            .setOrigin(0.5)
            .setDepth(1)
            .setVisible(false);
        this.uiContainers.common.add(this.resultButtonText);

        this.resultButton.on('pointerdown', () => { this.hideResultUIAndProceed(); }, this);
    }

    createType1UI() {

        this.createBinsUI();
        this.createCommandButtons();
        this.laneIndicatorLine = this.add.image(0, 0, 'lane_line_img')
            .setDepth(1)
            .setVisible(false);
        this.uiContainers.type1.add(this.laneIndicatorLine);
    }

    createBinsUI() {
        const binY = 581;
        const firstBinX = 75; 
        const binWidth = 50;
        const binHeight = 34;
        const binSpacing = 10
        const labelYOffset = 16;

        this.binGraphics = [];
        this.laneCenterXPositions = [];
        this.binTopLabelYPositions = [];
        this.binImages = [];
        this.binNameTexts = []; 

        this.binKeys.forEach((key, index) => {

            const binX = firstBinX + (index * (binWidth + binSpacing));
            const binCenterX = binX + (binWidth / 2); 


            const binImageKey = `${key}_img`;
            const binImg = this.add.image(binX, binY, binImageKey)
                .setDisplaySize(binWidth, binHeight)
                .setOrigin(0, 0) 
                .setDepth(5);
            this.binImages.push(binImg);
            this.uiContainers.type1.add(binImg);


            this.laneCenterXPositions.push(binCenterX);


            const labelY = binY - labelYOffset;
            this.binTopLabelYPositions[index] = labelY;


            this.binGraphics.push({
                key: key,
                x: binX,
                y: binY, 
                width: binWidth,
                height: binHeight,
                left: binX, 
                right: binX + binWidth
            });


            const nameStyle = { font: '14px 머니그라피', fill: '#303030', align: 'center' };
            const binName = this.binNames[index];

            const nameText = this.add.text(binCenterX, labelY, binName, nameStyle).setOrigin(0.5, 1);
            this.uiContainers.type1.add(nameText);
            this.binNameTexts.push(nameText);
        });
    }

    createCommandButtons() {

        if (this.commandButtons.left) this.commandButtons.left.destroy();
        if (this.commandButtons.down) this.commandButtons.down.destroy();
        if (this.commandButtons.right) this.commandButtons.right.destroy();

        const buttonSize = 80;
        const buttonHeight = 85;


        this.commandButtons.left = this.add.image(70, 760, 'button_left_img')
            .setDisplaySize(buttonSize, buttonHeight)
            .setOrigin(0, 0)
            .setInteractive();


        this.commandButtons.down = this.add.image(180, 760, 'button_down_img')
            .setDisplaySize(buttonSize, buttonHeight)
            .setOrigin(0, 0)
            .setInteractive();


        this.commandButtons.right = this.add.image(290, 760, 'button_right_img')
            .setDisplaySize(buttonSize, buttonHeight)
            .setOrigin(0, 0)
            .setInteractive();

        const setupButtonListeners = (button, direction, pressedTexture, normalTexture) => {
            button.removeAllListeners(); 

            let isProcessing = false; 

            button.on('pointerdown', () => {
                if (isProcessing) return; 

                if ((this.isProcessingResult && this.currentGameType === 2) ||
                    this.specialStepInputEnabled) {

                    if (this.canClick && this.checkTouchDelay()) {
                        isProcessing = true; // 처리 시작

                        if (this.isProcessingResult && this.currentGameType === 2) {
                            this.handlePreprocessingCommand(direction);
                        } else if (this.specialStepInputEnabled) {
                            this.processSpecialCommandInput(direction);
                        }

                        this.disableClickTemporarily();


                        this.time.delayedCall(300, () => {
                            isProcessing = false;
                        });
                    }
                } else {

                    switch (direction) {
                        case 'left':
                            this.moveLeft = true;
                            break;
                        case 'down':
                            this.moveDownFast = true;
                            break;
                        case 'right':
                            this.moveRight = true;
                            break;
                    }
                }
            });

            button.on('pointerup', () => {
                button.setTexture(normalTexture);
                switch (direction) {
                    case 'left':
                        this.moveLeft = false;
                        break;
                    case 'down':
                        this.moveDownFast = false;
                        break;
                    case 'right':
                        this.moveRight = false;
                        break;
                }
            });

            button.on('pointerout', () => {
                button.setTexture(normalTexture);
                switch (direction) {
                    case 'left':
                        this.moveLeft = false;
                        break;
                    case 'down':
                        this.moveDownFast = false;
                        break;
                    case 'right':
                        this.moveRight = false;
                        break;
                }
            });
        };


        setupButtonListeners(this.commandButtons.left, 'left', 'button_left_pressed_img', 'button_left_img');
        setupButtonListeners(this.commandButtons.down, 'down', 'button_down_pressed_img', 'button_down_img');
        setupButtonListeners(this.commandButtons.right, 'right', 'button_right_pressed_img', 'button_right_img');


        this.uiContainers.common.add(this.commandButtons.left);
        this.uiContainers.common.add(this.commandButtons.down);
        this.uiContainers.common.add(this.commandButtons.right);
    }


    checkTouchDelay() {
        const currentTime = new Date().getTime();
        if (currentTime - this.lastTouchTime < 100) { 
            return false;
        }
        this.lastTouchTime = currentTime;
        return true;
    }

    disableClickTemporarily() {
        this.canClick = false;
        this.time.delayedCall(100, () => {  
            this.canClick = true;
        });
    }

    createType2UI() {
        this.preprocessingInputEnabled = false;
        this.preprocessingSteps = null;
        this.currentPreprocessingStep = 0;

        console.log('GameScene: Type 2 UI 초기화 완료');
    }

    createType3UI() {
        const { width, height } = this.sys.game.canvas;

        console.log('GameScene: Type 3 UI 생성 시작');


        if (!this.type3LeftText) {
            this.type3LeftText = this.add.text(
                94, 570,
                '일반쓰레기',
                {
                    font: '20px 머니그라피',
                    fill: '#000000',
                    align: 'center',
                    fontStyle: 'bold'
                }
            ).setOrigin(0, 0).setDepth(10);
            this.uiContainers.type3.add(this.type3LeftText);
        }

        if (!this.type3RightText) {
            this.type3RightText = this.add.text(
                245, 570,
                '음식물쓰레기',
                {
                    font: '20px 머니그라피',
                    fill: '#000000',
                    align: 'center',
                    fontStyle: 'bold'
                }
            ).setOrigin(0, 0).setDepth(10);
            this.uiContainers.type3.add(this.type3RightText);
        }
        console.log('type3LeftText:', this.type3LeftText);
        console.log('type3RightText:', this.type3RightText);

        console.log('type3LeftText position:', this.type3LeftText.x, this.type3LeftText.y);
        console.log('type3RightText position:', this.type3RightText.x, this.type3RightText.y);


        this.uiContainers.type3.setVisible(false);

        console.log('GameScene: Type 3 UI 생성 완료');
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);


        this.input.keyboard.on('keydown', (event) => {
            if (this.preprocessingInputEnabled) {
                switch (event.keyCode) {
                    case Phaser.Input.Keyboard.KeyCodes.LEFT:
                        this.handlePreprocessingCommand('left');
                        break;
                    case Phaser.Input.Keyboard.KeyCodes.DOWN:
                        this.handlePreprocessingCommand('down');
                        break;
                    case Phaser.Input.Keyboard.KeyCodes.RIGHT:
                        this.handlePreprocessingCommand('right');
                        break;
                }
            }
        });
    }

    update(time, delta) {
        const deltaInSeconds = delta / 1000;


        if (time % 120 === 0) {

            const popupCount = this.children.list.filter(
                obj => obj.texture && obj.texture.key === 'popup_bg_img'
            ).length;

            if (popupCount > 0) {
                console.log('현재 팝업 배경 객체 수:', popupCount);
            }
        }


        if (time % 60 === 0 && this.currentTrashItemGraphic) {
            console.log('아이템 상태:',
                'visible:', this.currentTrashItemGraphic.visible,
                'active:', this.currentTrashItemGraphic.active,
                'y:', this.currentTrashItemGraphic.y);
        }


        switch (this.currentGameType) {
            case 1:
                this.updateType1(time, delta);
                break;
            case 2:
                if (this.gameState === 'preprocessing') {
                    this.updateType2Preprocessing();
                } else {
                    this.updateType1(time, delta); 
                }
                break;
            case 3:
                this.updateType3(time, delta);
                break;
        }
    }

    updateType1(time, delta) {

        if (!this.currentTrashItemGraphic || !this.isFalling || this.isProcessingResult) return;

        const currentTime = time;


        if (!this.lastFallTime) {
            this.lastFallTime = currentTime;
        }

        let fallInterval = 710;
        if (this.cursors.down.isDown || this.moveDownFast) {
            fallInterval = fallInterval / this.fastFallMultiplier; 
        }

        if (currentTime - this.lastFallTime >= fallInterval) {

            this.currentTrashItemGraphic.y += 20;
            this.lastFallTime = currentTime;


            this.fallCount = (this.fallCount || 0) + 1;


            console.log('낙하 횟수:', this.fallCount, '게임 타입:', this.currentGameType);


            if (this.currentGameType === 2 && this.fallCount === 1 && !this.touchText) {
                console.log('터치 텍스트 생성 시도');

                const itemWidth = this.currentTrashItemGraphic.displayWidth;
                const touchX = this.currentTrashItemGraphic.x + itemWidth / 2;
                const touchY = this.currentTrashItemGraphic.y - 2;

                this.touchText = this.add.text(touchX, touchY, '터 치!', {
                    font: '16px 머니그라피',
                    fill: '#E2250E',
                    stroke: '#FFFFFF',
                    strokeThickness: 2,
                    align: 'center'
                })
                    .setOrigin(0.5, 1)
                    .setDepth(11);

                console.log('터치 텍스트 생성 완료:', this.touchText);
            }


            if (this.touchText) {
                this.touchText.y = this.currentTrashItemGraphic.y - 2;
                this.touchText.x = this.currentTrashItemGraphic.x + this.currentTrashItemGraphic.displayWidth / 2;
            }
        }


        if (this.cursors.left.isDown || this.moveLeft || this.cursors.right.isDown || this.moveRight) {
            if (currentTime - this.lastKeyboardMoveTime > this.keyboardMoveDelay) {
                const direction = (this.cursors.left.isDown || this.moveLeft) ? -1 : 1;
                this.moveLaneHorizontal(direction);
                this.lastKeyboardMoveTime = currentTime;
            }
        } else {
            this.lastKeyboardMoveTime = currentTime - this.keyboardMoveDelay;
        }


        const collisionY = 535; 



        const isPreprocessed = this.currentTrashItemGraphic.texture.key.includes('_preprocessed');


        let itemBottomY;
        if (isPreprocessed) {

            itemBottomY = this.currentTrashItemGraphic.y + 60;


            console.log('전처리된 아이템 충돌 계산:',
                'y:', this.currentTrashItemGraphic.y,
                'bottomY:', itemBottomY,
                'collisionY:', collisionY,
                'diff:', collisionY - itemBottomY);
        } else {

            itemBottomY = this.currentTrashItemGraphic.y + this.currentTrashItemGraphic.height;
        }

        if (itemBottomY >= collisionY && !this.isProcessingResult) {
            console.log('GameScene: 아이템이 충돌 판정 위치에 도달!');
            this.isFalling = false;


            this.currentTrashItemGraphic.y = collisionY - (isPreprocessed ? 60 : this.currentTrashItemGraphic.height);


            if (this.currentGameType === 2 && this.touchText) {
                this.touchText.y = this.currentTrashItemGraphic.y - 2;
            }


            if (this.currentGameType === 2 && !this.currentTrashItemGraphic.texture.key.includes('_preprocessed')) {

                if (this.messageTextObject && this.currentTrashItemGraphic.itemData.messageWarning) {
                    this.messageTextObject.setText(this.currentTrashItemGraphic.itemData.messageWarning);
                }


                this.tweens.add({
                    targets: [this.currentTrashItemGraphic, this.touchText],
                    alpha: 0.6,
                    yoyo: true,
                    duration: 500,
                    repeat: -1
                });

                console.log('GameScene: Type 2 아이템 대기 상태로 전환');
            } else {

                this.isProcessingResult = true;
                this.triggerResultState(this.currentLaneIndex, 'collision');
            }
        }


        if (this.currentTrashItemGraphic.y > this.sys.game.canvas.height && !this.isProcessingResult) {
            console.log('GameScene: 화면 밖으로 떨어짐');
            this.isFalling = false;
            this.isProcessingResult = true;
            this.triggerResultState(null, 'floor');
        }
    }


    updateType2Preprocessing() {

        if (this.isWaitingForCommand) {
            if (this.leftKey.isDown) {
                this.handlePreprocessingCommand('left');
            } else if (this.rightKey.isDown) {
                this.handlePreprocessingCommand('right');
            } else if (this.downKey.isDown) {
                this.handlePreprocessingCommand('down');
            }
        }
    }

    updateType3(time, delta) {
        if (!this.currentTrashItemGraphic || !this.isFalling) return;

        const currentTime = time;
        const { width, height } = this.sys.game.canvas;


        if (!this.lastFallTime) {
            this.lastFallTime = currentTime;
        }


        let fallInterval = 700;
        if (this.cursors.down.isDown || this.moveDownFast) {
            fallInterval = fallInterval / this.fastFallMultiplier;
        }

        if (currentTime - this.lastFallTime >= fallInterval) {
            this.currentTrashItemGraphic.y += 20;
            this.lastFallTime = currentTime;
        }


        if (this.cursors.left.isDown || this.moveLeft || this.cursors.right.isDown || this.moveRight) {
            if (currentTime - this.lastKeyboardMoveTime > this.keyboardMoveDelay) {
                const newLaneIndex = (this.cursors.left.isDown || this.moveLeft) ? 0 : 1;
                if (this.currentLaneIndex !== newLaneIndex) {
                    this.currentLaneIndex = newLaneIndex;
                    const leftX = 110;
                    const rightX = 270;
                    const targetX = (this.currentLaneIndex === 0) ? leftX : rightX;
                    this.currentTrashItemGraphic.x = targetX;
                    this.lastKeyboardMoveTime = currentTime;
                    console.log('GameScene: Type 3 아이템 이동 ->', this.currentLaneIndex ? '오른쪽' : '왼쪽');
                }
            }
        } else {
            this.lastKeyboardMoveTime = currentTime - this.keyboardMoveDelay;
        }


        const panelBottom = 535; 
        const itemBottomY = this.currentTrashItemGraphic.y + this.currentTrashItemGraphic.height;


        if (itemBottomY >= panelBottom) {
            console.log('TYPE3 충돌 감지! itemBottomY:', itemBottomY, 'panelBottom:', panelBottom);
            this.isFalling = false;
            this.isProcessingResult = true;


            this.currentTrashItemGraphic.y = panelBottom - this.currentTrashItemGraphic.height;


            const isCorrect = (this.currentLaneIndex === 0 && this.currentTrashItemGraphic.itemData.correctAnswer === 'left') ||
                (this.currentLaneIndex === 1 && this.currentTrashItemGraphic.itemData.correctAnswer === 'right');

            this.triggerResultState(this.currentLaneIndex, 'collision', isCorrect);
        }


        if (this.currentTrashItemGraphic.y > this.sys.game.canvas.height + 200) {
            console.log('GameScene: 화면 밖으로 떨어짐, y:', this.currentTrashItemGraphic.y);
            this.isFalling = false;
            this.isProcessingResult = true;
            this.triggerResultState(null, 'floor');
        }
    }



    switchGameTypeUI(gameType) {
        console.log('GameScene: UI 전환 - 타입', gameType);


        if (this.currentTrashItemGraphic) {
            this.currentTrashItemGraphic.destroy();
            this.currentTrashItemGraphic = null;
        }


        this.uiContainers.type1.setVisible(false);
        this.uiContainers.type2.setVisible(false);
        this.uiContainers.type3.setVisible(false);
        this.uiContainers.type2Popup.setVisible(false);


        this.uiContainers.common.setVisible(true);


        switch (gameType) {
            case 1:
                console.log('GameScene: Type 1 UI 표시');
                this.uiContainers.type1.setVisible(true);
                break;
            case 2:
                console.log('GameScene: Type 2 UI 표시');
                this.uiContainers.type1.setVisible(true); 
                break;
            case 3:
                console.log('GameScene: Type 3 UI 표시');
                this.uiContainers.type3.setVisible(true);
                break;
        }


        const mainPanel = this.children.getByName('main_panel');
        if (mainPanel) {
            mainPanel.setVisible(gameType !== 3);
            console.log('GameScene: 메인 패널 표시 여부:', gameType !== 3);
        }

        this.gameState = 'playing';
    }

    spawnWasteItem() {
        console.log('GameScene: 아이템 생성 시작, 현재 라운드:', this.currentRound);


        this.currentLaneIndex = 2; 
        this.currentOpenBinIndex = -1; 


        this.resetAllBins();


        this.cleanupType3UI();


        const currentRoundData = this.getRoundData().find(round => round.round === this.currentRound);
        if (!currentRoundData) {
            console.error('GameScene: 현재 라운드 데이터를 찾을 수 없음:', this.currentRound);
            return;
        }

        const itemData = this.wasteRulesData.find(item => item.id === currentRoundData.itemId);
        if (!itemData) {
            console.error('GameScene: 아이템 데이터를 찾을 수 없음:', currentRoundData.itemId);
            return;
        }

        console.log('GameScene: 생성할 아이템:', itemData.name, '타입:', itemData.type);

        this.updateBinVisuals(this.currentLaneIndex);


        if (this.difficultyText) {
            this.difficultyText.setText(`${itemData.difficulty}`);
        }

        this.currentTrashItemData = itemData;
        this.currentGameType = itemData.type;


        this.updateMainPanelForGameType(this.currentGameType);


        if (this.currentGameType === 1) {
            this.spawnType1Item(itemData);
        } else if (this.currentGameType === 2) {
            this.spawnType2Item(itemData);
        } else if (this.currentGameType === 3) {
            this.spawnType3Item(itemData);
        }
    }


    updateMainPanelForGameType(gameType) {
        console.log('GameScene: 메인 패널 업데이트, 게임 타입:', gameType);


        if (!this.mainPanelImage) {
            console.error('GameScene: 메인 패널 참조가 없음!');
            return;
        }


        if (gameType === 3) {

            if (this.textures.exists('type3_panel_img')) {

                this.mainPanelImage.setTexture('type3_panel_img');
                console.log('GameScene: 메인 패널 이미지를 Type 3로 변경 성공');
            } else {
                console.error('GameScene: type3_panel_img 텍스처가 존재하지 않음!');
            }


            this.binImages.forEach(bin => bin.setVisible(false));


            if (this.binNameTexts) {
                this.binNameTexts.forEach(text => text.setVisible(false));
            }

            if (this.laneIndicatorLine) {
                this.laneIndicatorLine.setVisible(false);
            }

            console.log('GameScene: Type 3 - 쓰레기통과 이름 숨김, 커맨드 버튼 유지');
        } else {

            this.mainPanelImage.setTexture('panel_img');
            console.log('GameScene: 메인 패널 이미지를 기본으로 변경');


            if (this.leftChoiceText) this.leftChoiceText.setVisible(false);
            if (this.rightChoiceText) this.rightChoiceText.setVisible(false);


            this.binImages.forEach(bin => bin.setVisible(true));


            if (this.binNameTexts) {
                this.binNameTexts.forEach(text => text.setVisible(true));
            }

            console.log('GameScene: Type 1 UI 복원 완료');
        }
    }

    spawnType1Item(itemData) {
        const itemWidth = 60;
        const itemHeight = 60;
        const firstLaneX = 70; 
        const startY = 300;   


        this.currentLaneIndex = 2;
        const lanePositions = [];
        for (let i = 0; i < this.binKeys.length; i++) {
            lanePositions.push(firstLaneX + (i * 60));
        }
        this.laneCenterXPositions = lanePositions; 

        const startX = this.laneCenterXPositions[this.currentLaneIndex];


        const itemImageKey = `${itemData.id}_img`;


        this.currentTrashItemGraphic = this.add.image(startX, startY, itemImageKey)
            .setDisplaySize(itemWidth, itemHeight)
            .setOrigin(0, 0) 
            .setDepth(10);  

        console.log('아이템 생성 확인:', this.currentTrashItemGraphic.texture.key,
            'x:', this.currentTrashItemGraphic.x,
            'y:', this.currentTrashItemGraphic.y);

        this.currentTrashItemGraphic.itemData = itemData;
        this.currentTrashItemGraphic.setActive(true);


        if (this.messageTextObject && itemData.messageInitial) {
            this.messageTextObject.setText(itemData.messageInitial);
        }

        console.log('spawnType1Item에서 displayItemName 호출');
        this.displayItemName(itemData);



        this.itemTimeRemaining = this.itemTimeLimit;
        this.isFalling = true;
        this.isProcessingResult = false;
        this.lastFallTime = this.game.getTime(); 


        this.updateBinVisuals(this.currentLaneIndex);

        console.log('GameScene: Type 1 아이템 생성 완료:', itemData.name);
    }

    spawnType2Item(itemData) {

        this.gameState = 'playing';
        this.isProcessingResult = false;
        this.preprocessingInputEnabled = false;
        this.currentPreprocessingStep = 0;
        this.fallCount = 0;


        const itemWidth = 60;
        const itemHeight = 60;
        const firstLaneX = 70;
        const startY = 300;


        this.currentLaneIndex = 2;
        const lanePositions = [];
        for (let i = 0; i < this.binKeys.length; i++) {
            lanePositions.push(firstLaneX + (i * 60));
        }
        this.laneCenterXPositions = lanePositions;

        const startX = this.laneCenterXPositions[this.currentLaneIndex];


        const warningImageKey = `${itemData.id}_warning_img`;


        this.currentTrashItemGraphic = this.add.image(startX, startY, warningImageKey)
            .setDisplaySize(itemWidth, itemHeight)
            .setOrigin(0, 0)
            .setDepth(10)
            .setInteractive();


        this.currentTrashItemGraphic.itemData = itemData;
        this.currentTrashItemGraphic.setActive(true);


        console.log('spawnType2Item에서 displayItemName 호출');
        this.displayItemName(itemData);

        this.currentTrashItemGraphic.on('pointerdown', this.onType2ItemClick, this);


        this.currentTrashItemGraphic.itemData = itemData;
        this.currentTrashItemGraphic.setActive(true);


        if (this.messageTextObject && itemData.messageInitial) {
            this.messageTextObject.setText(itemData.messageInitial);
        }


        this.itemTimeRemaining = this.itemTimeLimit;
        this.isFalling = true;
        this.lastFallTime = this.game.getTime();


        this.updateBinVisuals(this.currentLaneIndex);

        console.log('GameScene: Type 2 아이템 생성:', itemData.name);
    }



    spawnType3Item(itemData) {
        console.log('GameScene: Type 3 아이템 생성');
        if (!this.type3LeftText || !this.type3RightText) {
            console.error('Type3 선택지 텍스트가 생성되지 않았습니다!');
        }

        if (this.uiContainers.type3) {
            this.uiContainers.type3.setVisible(true);
        }

        const { width, height } = this.sys.game.canvas;


        const itemWidth = 60;
        const itemHeight = 60;


        const startX = 110; 
        const startY = 300;


        const panelBottom = 555; 

        const itemImageKey = `${itemData.id}_img`;


        this.currentTrashItemGraphic = this.add.image(startX, startY, itemImageKey)
            .setDisplaySize(itemWidth, itemHeight)
            .setOrigin(0, 0)
            .setDepth(10);

        this.currentTrashItemGraphic.itemData = itemData;


        this.currentLaneIndex = 0;


        if (this.messageTextObject) {
            this.messageTextObject.setText(itemData.quizQuestion || '닭뼈는 어떤 종류의 쓰레기일까?\n왼쪽은 일반쓰레기, 오른쪽은 음식물쓰레기!');
        }


        if (this.type3LeftText) this.type3LeftText.setVisible(false);
        if (this.type3RightText) this.type3RightText.setVisible(false);


        if (this.type3LeftText) {
            this.type3LeftText.setText(itemData.quizOptions?.left || '일반쓰레기');
            this.type3LeftText.setVisible(true);
        }
        if (this.type3RightText) {
            this.type3RightText.setText(itemData.quizOptions?.right || '음식물쓰레기');
            this.type3RightText.setVisible(true);
        }

        console.log('spawnType3Item에서 displayItemName 호출');
        this.displayItemName(itemData);


        this.itemTimeRemaining = this.itemTimeLimit;
        this.isFalling = true;
        this.lastFallTime = this.game.getTime();

        console.log('GameScene: Type 3 아이템 생성 완료');
    }



    handleType3Collision() {
        if (!this.isFalling || this.isProcessingResult) return;

        this.isFalling = false;
        this.isProcessingResult = true;


        const isCorrect = (this.currentLaneIndex === 0 && this.currentTrashItemGraphic.itemData.correctAnswer === 'left') ||
            (this.currentLaneIndex === 1 && this.currentTrashItemGraphic.itemData.correctAnswer === 'right');

        this.triggerResultState(this.currentLaneIndex, 'collision', isCorrect);
    }


    cleanupType3UI() {

        if (this.type3LeftText) this.type3LeftText.setVisible(false);
        if (this.type3RightText) this.type3RightText.setVisible(false);


        if (this.binNameTexts && !this.binNameTexts[0].visible) {
            this.binNameTexts.forEach(text => text.setVisible(true));
        }


        if (this.binImages && !this.binImages[0].visible) {
            this.binImages.forEach(bin => bin.setVisible(true));
        }
    }


    showPreprocessingPopup() {

        this.preprocessingPopupBg = this.add.image(60, 240, 'popup_bg_img')
            .setDisplaySize(320, 375)
            .setOrigin(0, 0)
            .setAlpha(0)
            .setDepth(25);


        if (this.messageTextObject && this.currentTrashItemData.messageWarning) {
            this.messageTextObject.setText(this.currentTrashItemData.messageWarning);
        }


        this.tweens.add({
            targets: this.preprocessingPopupBg,
            alpha: 1,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                console.log('GameScene: 팝업 배경 표시 완료');

                this.showWarningSlideAnimation();
            }
        });
    }

    onType2ItemClick() {

        if (this.currentGameType !== 2 || this.isProcessingResult) return;

        console.log('GameScene: Type 2 아이템 클릭됨');


        this.tweens.killTweensOf(this.currentTrashItemGraphic);

        if (this.touchText) {
            this.tweens.killTweensOf(this.touchText);
            this.touchText.destroy(); 
            this.touchText = null;
        }
        this.currentTrashItemGraphic.alpha = 1;

        this.isFalling = false;


        this.isProcessingResult = true;
        this.showPreprocessingPopup();
    }

    showWarningSlideAnimation() {
        const { width, height } = this.sys.game.canvas;



        this.warningSlide = this.add.image(width + 700, 167, 'warning_slide_img')
            .setOrigin(0, 0) 
            .setDepth(26);   


        this.warningSlide.setDisplaySize(1417, 556);


        this.tweens.add({
            targets: this.warningSlide,
            x: -448, 
            duration: 2000, 
            ease: 'Power2',
            onComplete: () => {
                console.log('GameScene: 경고 슬라이드 애니메이션 완료');

                this.startPreprocessingMiniGame();
            }
        });
    }


    startPreprocessingMiniGame() {

        const itemId = this.currentTrashItemGraphic.itemData.id;


        const step1ImageKey = `${itemId}_step1_img`;
        const fallbackImageKey = this.currentTrashItemGraphic.texture.key;


        const imageKey = this.textures.exists(step1ImageKey) ? step1ImageKey : fallbackImageKey;

        this.preprocessingItemImage = this.add.image(80, 400, imageKey)
            .setDisplaySize(120, 120)
            .setOrigin(0, 0)
            .setDepth(26);


        this.preprocessingSteps = this.currentTrashItemGraphic.itemData.preprocessingSteps || [];
        this.currentPreprocessingStep = 0;
        this.currentCommandIndex = 0;


        this.commandKeyImages = [];


        if (this.messageTextObject) {
            this.messageTextObject.setText("분리수거가 가능하게 바꿔보자!\n화면에 맞는 커맨드를 입력해봐");
        }


        if (this.messageTexts && this.messageTexts.length > 0) {
            this.messageTexts.forEach(txt => txt.destroy());
            this.messageTexts = [];
        }


        if (this.messageCommandImages && this.messageCommandImages.length > 0) {
            this.messageCommandImages.forEach(img => img.destroy());
            this.messageCommandImages = [];
        }


        this.setupCommandKeys();


        if (this.messageTextObject) {
            this.messageTextObject.setText("분리수거가 가능하게 바꿔보자!\n화면에 맞는 커맨드를 입력해봐");
            this.messageTextObject.setVisible(true);
        }



        if (this.commandKeyImages.length > 0) {
            this.commandKeyImages[0].active = true;
        }


    }


    setupCommandKeys() {

        this.commandKeyImages.forEach(key => {
            if (key.image) key.image.destroy();
        });
        this.commandKeyImages = [];


        let allCommands = [];
        for (let i = 0; i < this.preprocessingSteps.length; i++) {
            const step = this.preprocessingSteps[i];
            const commands = step.commands || [];

            for (let j = 0; j < commands.length; j++) {
                allCommands.push({
                    stepIndex: i,
                    commandIndex: j,
                    action: commands[j].action,
                    color: commands[j].color,
                    text: step.text
                });
            }
        }

        console.log('전체 커맨드 수:', allCommands.length);


        for (let i = 0; i < allCommands.length; i++) {
            const command = allCommands[i];
            let keyImageKey;


            switch (command.action) {
                case 'left': keyImageKey = 'left_key_dim_img'; break;
                case 'down': keyImageKey = 'down_key_dim_img'; break;
                case 'right': keyImageKey = 'right_key_dim_img'; break;
                default: keyImageKey = 'down_key_dim_img';
            }


            const keyX = 240 + (i * 24);
            const keyImage = this.add.image(keyX, 440, keyImageKey)
                .setDisplaySize(40, 43) 
                .setOrigin(0, 0)
                .setDepth(26 + (allCommands.length - i));

            this.commandKeyImages.push({
                image: keyImage,
                stepIndex: command.stepIndex,
                commandIndex: command.commandIndex,
                action: command.action,
                text: command.text,
                color: command.color,
                active: i === 0 
            });
        }


        if (this.commandKeyImages.length > 0) {
            const firstKey = this.commandKeyImages[0]
            let activeKeyImageKey;

            switch (firstKey.action) {
                case 'left': activeKeyImageKey = 'left_key_img'; break;
                case 'down': activeKeyImageKey = 'down_key_img'; break;
                case 'right': activeKeyImageKey = 'right_key_img'; break;
                default: activeKeyImageKey = 'down_key_img';
            }

            if (this.textures.exists(activeKeyImageKey)) {
                firstKey.image.setTexture(activeKeyImageKey);
                firstKey.image.setDisplaySize(40, 43);
            }
        }

        console.log(`총 ${this.commandKeyImages.length}개의 커맨드 키 생성됨`);
    }

    activateNextCommandKey() {

        let currentKeyIndex = 0;
        let found = false;

        for (let i = 0; i < this.commandKeyImages.length; i++) {
            const key = this.commandKeyImages[i];
            if (!key.active) {
                currentKeyIndex = i;
                found = true;
                break;
            }
        }


        if (!found) {
            this.completePreprocessing();
            return;
        }


        const currentKey = this.commandKeyImages[currentKeyIndex];


        let activeKeyImageKey;
        switch (currentKey.action) {
            case 'left': activeKeyImageKey = 'left_key_img'; break;
            case 'down': activeKeyImageKey = 'down_key_img'; break;
            case 'right': activeKeyImageKey = 'right_key_img'; break;
            default: activeKeyImageKey = 'down_key_img';
        }


        if (currentKey.image && !currentKey.image.destroyed) {
            try {
                currentKey.image.setTexture(activeKeyImageKey);
                currentKey.active = true;
            } catch (error) {
                console.error('텍스처 설정 중 오류:', error);
            }
        }
    }

    activateCommandKey(stepIndex, commandIndex) {

        if (stepIndex >= this.preprocessingSteps.length) {
            this.completePreprocessing();
            return;
        }


        this.currentPreprocessingStep = stepIndex;
        this.currentCommandIndex = commandIndex;


        const currentKeyObj = this.commandKeyImages.find(key =>
            key.stepIndex === stepIndex && key.commandIndex === commandIndex);

        if (currentKeyObj) {

            let activeKeyImageKey;
            switch (currentKeyObj.command.action) {
                case 'left': activeKeyImageKey = 'left_key_img'; break;
                case 'down': activeKeyImageKey = 'down_key_img'; break;
                case 'right': activeKeyImageKey = 'right_key_img'; break;
                default: activeKeyImageKey = 'down_key_img';
            }

            currentKeyObj.image.setTexture(activeKeyImageKey);
            currentKeyObj.active = true;
        }


    }


    activateNextCommandKey() {
        if (this.currentPreprocessingStep >= this.preprocessingSteps.length) {

            this.completePreprocessing();
            return;
        }


        const currentKeyObj = this.commandKeyImages[this.currentPreprocessingStep];
        const step = this.preprocessingSteps[this.currentPreprocessingStep];
        let activeKeyImageKey;


        switch (step.action) {
            case 'left': activeKeyImageKey = 'left_key_img'; break;
            case 'down': activeKeyImageKey = 'down_key_img'; break;
            case 'right': activeKeyImageKey = 'right_key_img'; break;
            default: activeKeyImageKey = 'down_key_img';
        }


        this.time.delayedCall(500, () => {
            currentKeyObj.image.setTexture(activeKeyImageKey);
            currentKeyObj.image.setDisplaySize(40, 43);
            currentKeyObj.image.setAlpha(1);
            currentKeyObj.active = true;


            this.updateMessageWithCommand(step);
        });
    }

    updateMessageWithCommand() {
        try {

            const maxWidth = 330 - 20; 
            const maxLines = 2;
            let currentX = 87;
            let currentY = 665;
            let lineCount = 0;


            let lines = [[]];
            let lineWidths = [0];


            const processedSteps = [];
            for (const key of this.commandKeyImages) {
                if (key.active || !key.image || key.image.destroyed) {
                    if (!processedSteps.includes(key.stepIndex)) {
                        processedSteps.push(key.stepIndex);
                    }
                }
            }
            processedSteps.sort((a, b) => a - b);


            const tempText = this.add.text(0, 0, '', { font: '16px 머니그라피' }).setVisible(false);


            for (const stepIndex of processedSteps) {
                const stepCommands = this.commandKeyImages.filter(key => key.stepIndex === stepIndex);
                if (stepCommands.length === 0) continue;


                const commandWidth = stepCommands.length * 20;

                tempText.setText(stepCommands[0].text);
                const textWidth = tempText.width + 10;

                const totalWidth = commandWidth + textWidth;


                if (lineWidths[lineCount] + totalWidth > maxWidth) {

                    lineCount++;
                    if (lineCount >= maxLines) {

                        this.messageCommandImages.forEach(img => { if (img && !img.destroyed) img.destroy(); });
                        this.messageTexts.forEach(txt => { if (txt && !txt.destroyed) txt.destroy(); });
                        this.messageCommandImages = [];
                        this.messageTexts = [];
                        lines = [[]];
                        lineWidths = [0];
                        lineCount = 0;
                        currentY = 665;
                    }
                    lines[lineCount] = [];
                    lineWidths[lineCount] = 0;
                }

                lines[lineCount].push({ stepIndex, stepCommands });
                lineWidths[lineCount] += totalWidth;
            }
            tempText.destroy();


            currentY = 665;
            for (let i = 0; i <= lineCount; i++) {
                currentX = 87;
                for (const { stepIndex, stepCommands } of lines[i]) {

                    const isStepCompleted = stepCommands.every(cmd => !cmd.image || cmd.image.destroyed);
                    const isCurrentStepWithSingleCommand = stepCommands.some(cmd => cmd.active) && stepCommands.length === 1;
                    const textStyle = {
                        font: '16px 머니그라피',
                        fill: (isStepCompleted || isCurrentStepWithSingleCommand) ? '#303030' : '#C8C8C8',
                        fontStyle: 'normal' 
                    };

                    for (const command of stepCommands) {
                        let keyImageKey;
                        if (!command.image || command.image.destroyed) {
                            switch (command.action) {
                                case 'left': keyImageKey = 'left_key_img'; break;
                                case 'down': keyImageKey = 'down_key_img'; break;
                                case 'right': keyImageKey = 'right_key_img'; break;
                                default: keyImageKey = 'down_key_img';
                            }
                        } else {
                            switch (command.action) {
                                case 'left': keyImageKey = command.active ? 'left_key_img' : 'left_key_dim_img'; break;
                                case 'down': keyImageKey = command.active ? 'down_key_img' : 'down_key_dim_img'; break;
                                case 'right': keyImageKey = command.active ? 'right_key_img' : 'right_key_dim_img'; break;
                                default: keyImageKey = command.active ? 'down_key_img' : 'down_key_dim_img';
                            }
                        }
                        const keyImage = this.add.image(currentX, currentY, keyImageKey)
                            .setDisplaySize(20, 20)
                            .setOrigin(0, 0)
                            .setDepth(20);
                        this.messageCommandImages.push(keyImage);
                        currentX += 20;
                    }

                    const stepText = this.add.text(currentX, currentY, stepCommands[0].text, textStyle)
                        .setOrigin(0, 0)
                        .setDepth(20);
                    this.messageTexts.push(stepText);
                    currentX += stepText.width + 10;
                }
                currentY += 32;
            }
            if (this.messageTextObject) this.messageTextObject.setVisible(false);
            console.log('메시지 창 업데이트 완료');
        } catch (error) {
            console.error('메시지 창 업데이트 중 오류:', error);
        }
    }

    handlePreprocessingCommand(action) {
        try {

            if (this.specialStepInputEnabled) {

                return;
            }
            const currentKeyIndex = this.commandKeyImages.findIndex(key => key.active);
            if (currentKeyIndex === -1) {
                console.log('활성화된 커맨드 키가 없음');
                return;
            }
            const currentKey = this.commandKeyImages[currentKeyIndex];


            if (currentKey.stepIndex === 4 && currentKey.commandIndex === 0) {

                if (this.messageCommandImages && this.messageCommandImages.length > 0) {
                    this.messageCommandImages.forEach(img => { if (img && !img.destroyed) img.destroy(); });
                }
                this.messageCommandImages = [];
                if (this.messageTexts && this.messageTexts.length > 0) {
                    this.messageTexts.forEach(txt => { if (txt && !txt.destroyed) txt.destroy(); });
                }
                this.messageTexts = [];
            }


            if (currentKey.action === action) {
                console.log('올바른 키 입력:', action);


                const isFirstCommandOfNewStep = currentKeyIndex === 0 ||
                    (currentKeyIndex > 0 &&
                        this.commandKeyImages[currentKeyIndex].stepIndex !==
                        this.commandKeyImages[currentKeyIndex - 1].stepIndex);


                if (isFirstCommandOfNewStep) {
                    this.updateItemImage(currentKey.stepIndex + 2);
                    console.log(`새로운 상황 시작: "${currentKey.text}" - step${currentKey.stepIndex + 2} 이미지로 변경`);
                }


                const isLastCommand = currentKeyIndex === this.commandKeyImages.length - 1;


                this.updateMessageWithCommand();


                this.tweens.add({
                    targets: currentKey.image,
                    y: currentKey.image.y - 50,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {

                        if (currentKey.image) {
                            currentKey.image.destroy();
                            currentKey.image = null;
                        }


                        for (let i = currentKeyIndex + 1; i < this.commandKeyImages.length; i++) {
                            const key = this.commandKeyImages[i];
                            if (key.image) {
                                this.tweens.add({
                                    targets: key.image,
                                    x: 240 + ((i - currentKeyIndex - 1) * 24),
                                    duration: 300
                                });
                            }
                        }


                        currentKey.active = false;

                        const remainingCommandsInStep = this.commandKeyImages.filter(key =>
                            key.stepIndex === currentKey.stepIndex &&
                            key.image &&
                            !key.image.destroyed &&
                            this.commandKeyImages.indexOf(key) > currentKeyIndex);

                        if (remainingCommandsInStep.length === 0) {

                            this.updateMessageWithCommand();
                            console.log(`상황 "${currentKey.text}" 완료 - 텍스트 진하게 변경`);
                        }

                        if (isLastCommand) {
                            this.time.delayedCall(1500, () => {
                                this.startCompletionSequence();
                            });
                        } else {

                            const nextKey = this.commandKeyImages[currentKeyIndex + 1];
                            nextKey.active = true;


                            if (nextKey.image) {
                                let activeKeyImageKey;
                                switch (nextKey.action) {
                                    case 'left': activeKeyImageKey = 'left_key_img'; break;
                                    case 'down': activeKeyImageKey = 'down_key_img'; break;
                                    case 'right': activeKeyImageKey = 'right_key_img'; break;
                                    default: activeKeyImageKey = 'down_key_img';
                                }

                                if (this.textures.exists(activeKeyImageKey)) {
                                    nextKey.image.setTexture(activeKeyImageKey);
                                    nextKey.image.setDisplaySize(40, 43);
                                }
                            }
                        }
                    }
                });
            } else {

                if (currentKey.image) {
                    this.tweens.add({
                        targets: currentKey.image,
                        x: currentKey.image.x + 5,
                        duration: 50,
                        yoyo: true,
                        repeat: 3
                    });
                }
            }
        } catch (error) {
            console.error('커맨드 처리 중 오류:', error);
        }
    }


    activateNextKey(currentIndex) {
        const nextIndex = currentIndex + 1;
        if (nextIndex < this.commandKeyImages.length) {
            const nextKey = this.commandKeyImages[nextIndex];
            if (nextKey && nextKey.image) {
                nextKey.active = true;
                let activeKeyImageKey;
                switch (nextKey.action) {
                    case 'left': activeKeyImageKey = 'left_key_img'; break;
                    case 'down': activeKeyImageKey = 'down_key_img'; break;
                    case 'right': activeKeyImageKey = 'right_key_img'; break;
                    default: activeKeyImageKey = 'down_key_img';
                }
                nextKey.image.setTexture(activeKeyImageKey);
            }
        } else {

            this.time.delayedCall(1000, () => {
                this.startCompletionSequence();
            });
        }
    }

    updateItemImage(stepNumber) {
        try {

            const itemId = this.currentTrashItemGraphic.itemData.id;
            const stepImageKey = `${itemId}_step${stepNumber}_img`;


            const originalWidth = this.preprocessingItemImage.displayWidth;
            const originalHeight = this.preprocessingItemImage.displayHeight;


            if (this.textures.exists(stepImageKey)) {
                this.preprocessingItemImage.setTexture(stepImageKey);

                this.preprocessingItemImage.setDisplaySize(originalWidth, originalHeight);
                console.log(`전처리 이미지 업데이트: ${stepImageKey}`);
            } else {
                console.log(`전처리 이미지 없음: ${stepImageKey} (기본 이미지 유지)`);
            }
        } catch (error) {
            console.error('전처리 이미지 업데이트 중 오류:', error);
        }
    }

    startCompletionSequence() {
        try {

            this.clearMessageBoard();


            if (this.messageTextObject && this.currentTrashItemData.messagePreprocessingComplete) {
                this.messageTextObject.setVisible(true);
                this.messageTextObject.setText(this.currentTrashItemData.messagePreprocessingComplete);
            }


            if (this.preprocessingItemImage) {
                this.tweens.add({
                    targets: this.preprocessingItemImage,
                    alpha: 0,
                    duration: 1500, 
                    onComplete: () => {

                        this.time.delayedCall(500, () => {
                            this.startCleanupAnimation();
                        });
                    }
                });
            } else {

                this.time.delayedCall(1500, () => {
                    this.startCleanupAnimation();
                });
            }

            console.log('전처리 완료 시퀀스 시작');
        } catch (error) {
            console.error('완료 시퀀스 중 오류:', error);
        }
    }


    clearMessageBoard() {
        try {

            if (this.messageCommandImages && this.messageCommandImages.length > 0) {
                this.messageCommandImages.forEach(img => {
                    if (img && !img.destroyed) img.destroy();
                });
            }
            this.messageCommandImages = [];


            if (this.messageTexts && this.messageTexts.length > 0) {
                this.messageTexts.forEach(txt => {
                    if (txt && !txt.destroyed) txt.destroy();
                });
            }
            this.messageTexts = [];

            console.log('메시지 보드 정리 완료');
        } catch (error) {
            console.error('메시지 보드 정리 중 오류:', error);
        }
    }



    startCleanupAnimation() {

        if (this.warningSlide) {
            this.tweens.add({
                targets: this.warningSlide,
                x: -1500, 
                duration: 1500,
                ease: 'Power2',
                onComplete: () => {

                    this.warningSlide.destroy();


                    this.fadeOutBackground();
                }
            });
        } else {

            this.fadeOutBackground();
        }


        this.commandKeyImages.forEach(keyObj => {
            if (keyObj.image && keyObj.image.active !== null) {
                this.tweens.add({
                    targets: keyObj.image,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        keyObj.image.destroy();
                    }
                });
            }
        });
    }

    fadeOutBackground() {

        this.tweens.add({
            targets: this.preprocessingPopupBg,
            alpha: 0,
            duration: 1000,
            onComplete: () => {

                this.preprocessingPopupBg.destroy();


                this.restartGameWithPreprocessedItem();
            }
        });
    }



    startCleanupAnimation() {

        this.tweens.add({
            targets: this.preprocessingItemImage,
            alpha: 0,
            duration: 500,
            onComplete: () => {

                this.preprocessingItemImage.destroy();


                if (this.warningSlide) {
                    this.tweens.add({
                        targets: this.warningSlide,
                        x: -1500, 
                        duration: 1500,
                        ease: 'Power2',
                        onComplete: () => {

                            this.warningSlide.destroy();


                            this.fadeOutBackground();
                        }
                    });
                } else {

                    this.fadeOutBackground();
                }
            }
        });


        this.commandKeyImages.forEach(keyObj => {
            if (keyObj.image && keyObj.image.active !== null) {
                this.tweens.add({
                    targets: keyObj.image,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        keyObj.image.destroy();
                    }
                });
            }
        });
    }

    fadeOutBackground() {

        this.tweens.add({
            targets: this.preprocessingPopupBg,
            alpha: 0,
            duration: 1000,
            onComplete: () => {

                this.preprocessingPopupBg.destroy();


                this.restartGameWithPreprocessedItem();
            }
        });
    }

    restartGameWithPreprocessedItem() {
        console.log('GameScene: 전처리 완료 후 게임 재시작 시작');


        this.currentGameType = 1;


        const oldItem = this.currentTrashItemGraphic;
        const itemData = oldItem ? { ...oldItem.itemData } : null; 


        if (oldItem) {
            oldItem.setVisible(false);
            oldItem.destroy();
            this.currentTrashItemGraphic = null;
        }


        const itemId = itemData ? itemData.id : null;
        const preprocessedImageKey = itemId ? `${itemId}_preprocessed_img` : null;

        if (!preprocessedImageKey || !this.textures.exists(preprocessedImageKey)) {
            console.error('전처리된 이미지를 찾을 수 없음:', preprocessedImageKey);
            return;
        }


        this.currentLaneIndex = 2; 
        this.currentOpenBinIndex = -1;
        const startX = this.laneCenterXPositions[this.currentLaneIndex];
        const startY = 300; 


        this.currentTrashItemGraphic = this.add.sprite(startX, startY, preprocessedImageKey)
            .setDisplaySize(60, 60)
            .setOrigin(0, 0)
            .setDepth(10);


        this.currentTrashItemGraphic.itemData = itemData;


        this.currentTrashItemGraphic.addToDisplayList();


        this.currentLaneIndex = 2;
        this.currentOpenBinIndex = -1;

        this.resetAllBins();


        this.isFalling = true;
        this.isProcessingResult = false;
        this.lastFallTime = this.game.getTime();


        this.updateBinVisuals(this.currentLaneIndex);


        if (this.messageTextObject) {
            this.messageTextObject.setText("자, 이제 그럼 다시 분리배출 해볼까?");
            this.messageTextObject.setVisible(true);
        }


        console.log('restartGameWithPreprocessedItem에서 displayItemName 호출');
        console.log('preprocessed 이미지 키:', preprocessedImageKey);
        this.displayItemName(itemData);

        console.log('전처리 완료 후 Type 1 게임으로 재개 완료');
    }



    updateBinVisuals(newLaneIndex) {
        console.log('updateBinVisuals 호출:', newLaneIndex, '현재 게임 타입:', this.currentGameType);


        if (this.currentGameType === 3) {
            if (this.laneIndicatorLine) {
                this.laneIndicatorLine.setVisible(false);
            }
            return;
        }


        const closedBinSize = { width: 50, height: 34 };
        const closedBinY = 581;

        const openBinSize = { width: 51.14, height: 46.47 };
        const openBinY = 568.53;
        const openBinXOffset = -2; 


        if (this.currentOpenBinIndex !== -1 && this.currentOpenBinIndex !== newLaneIndex) {
            const prevBinImg = this.binImages[this.currentOpenBinIndex];
            const prevBinKey = this.binKeys[this.currentOpenBinIndex];
            const prevBinX = this.binGraphics[this.currentOpenBinIndex].x;

            if (prevBinImg) {

                prevBinImg.setTexture(`${prevBinKey}_img`);


                prevBinImg.setDisplaySize(closedBinSize.width, closedBinSize.height);
                prevBinImg.setPosition(prevBinX, closedBinY);
            }
        }


        if (newLaneIndex !== -1 && newLaneIndex >= 0 && newLaneIndex < this.binImages.length) {
            const currentBinImg = this.binImages[newLaneIndex];
            const currentBinKey = this.binKeys[newLaneIndex];
            const currentBinX = this.binGraphics[newLaneIndex].x;

            if (currentBinImg) {

                currentBinImg.setTexture(`${currentBinKey}_open_img`);


                currentBinImg.setDisplaySize(openBinSize.width, openBinSize.height);
                currentBinImg.setPosition(currentBinX + openBinXOffset, openBinY);


                if (this.laneIndicatorLine) {

                    const lineX = 70; 
                    const lineY = 280; 
                    const lineXAdjusted = lineX + (newLaneIndex * 60); 

                    this.laneIndicatorLine
                        .setTexture('lane_line_img') 
                        .setPosition(lineXAdjusted, lineY)
                        .setDisplaySize(60, 335)
                        .setVisible(true)
                        .setOrigin(0, 0);

                    console.log('라인 표시:', lineXAdjusted, lineY);
                } else {
                    console.log('라인 객체가 없음');
                }
            }
        }

        this.currentOpenBinIndex = newLaneIndex;
    }


    moveLaneHorizontal(direction) {
        if (!this.currentTrashItemGraphic || !this.isFalling) return;

        const { width } = this.sys.game.canvas;

        if (this.currentGameType === 3) {

            const newLaneIndex = direction === -1 ? 0 : 1;
            this.currentLaneIndex = newLaneIndex;


            const targetX = newLaneIndex === 0 ?
                width / 2 - this.panel.width * 0.8 / 4 :
                width / 2 + this.panel.width * 0.8 / 4;

            this.currentTrashItemGraphic.x = targetX;
            console.log('GameScene: Type 3 선택지 이동 ->', this.currentLaneIndex);
            return;
        }


        const numberOfBins = this.binKeys.length;
        let nextLaneIndex = this.currentLaneIndex + direction;

        if (nextLaneIndex < 0 || nextLaneIndex >= numberOfBins) {
            console.log('GameScene: 경계입니다.');
            return;
        }

        this.currentLaneIndex = nextLaneIndex;
        const targetX = this.laneCenterXPositions[this.currentLaneIndex];
        this.currentTrashItemGraphic.x = targetX;


        if (this.currentGameType === 2 && this.touchText) {
            this.touchText.x = targetX + this.currentTrashItemGraphic.displayWidth / 2;
        }


        this.updateBinVisuals(this.currentLaneIndex);

        console.log('GameScene: 칸 이동 ->', this.currentLaneIndex);
    }

    triggerResultState(itemLaneIndex, reason = 'incorrect') {
        console.log('GameScene: 결과 상태 트리거 시작! 이유:', reason, '게임타입:', this.currentGameType);

        if (!this.currentTrashItemGraphic) {
            console.log('GameScene: 처리할 아이템이 없습니다.');
            return;
        }

        this.currentTrashItemGraphic.setActive(false);
        this.lastLandedLaneIndex = (itemLaneIndex !== null) ? itemLaneIndex : this.currentLaneIndex;

        let isCorrect = false;
        const itemData = this.currentTrashItemData;
        let message = '';


        if (this.currentGameType === 3) {

            const correctLane = itemData.correctAnswer === 'left' ? 0 : 1;
            isCorrect = (this.currentLaneIndex === correctLane);
            message = isCorrect ? itemData.messageCorrect : itemData.messageIncorrect;
        }

        else if (reason === 'collision') {
            let landedBinKey = null;
            if (itemLaneIndex !== null && itemLaneIndex >= 0 && itemLaneIndex < this.binKeys.length) {
                landedBinKey = this.binKeys[itemLaneIndex];
            }
            isCorrect = (landedBinKey !== null && itemData.correctBin === landedBinKey);
            message = isCorrect ? itemData.messageCorrect : itemData.messageIncorrect;
        } else if (reason === 'floor') {
            isCorrect = false;
            message = itemData.messageIncorrect;
        } else if (reason === 'correct') {
            isCorrect = true;
            message = itemData.messageCorrect;
        } else if (reason === 'incorrect') {
            isCorrect = false;
            message = itemData.messageIncorrect;
        }
        this.lastResultIsCorrect = isCorrect;


        this.updateLineColor(isCorrect);


        this.showItemCollisionEffect(isCorrect);


        if (this.messageTextObject) {
            this.messageTextObject.setText(message);
        }


        if (!isCorrect) {
            console.log('GameScene: 오답 처리 플로우 (체력 감소 등).');
            this.health--;
            this.updateHealthUI();


            if (this.health <= 0) {
                console.log('GameScene: 체력 0! 게임 오버.');
                this.gameOver();
                return;
            }


            if (this.currentTrashItemGraphic) {
                this.tweens.killTweensOf(this.currentTrashItemGraphic);


                if (this.currentTrashItemGraphic.anims) {
                    this.currentTrashItemGraphic.anims.stop();
                }
            }


            this.time.delayedCall(800, () => {
                this.showIncorrectPopup();
            });
        } else {

            this.showItemCollisionEffect(isCorrect);


            this.time.delayedCall(this.ANIMATION_TIMING.NEXT_ROUND_DELAY, () => {

                if (this.isProcessingResult) {
                    this.handleResult(isCorrect);
                    this.proceedToNextRound();
                }
            }, [], this);
        }
    }

    updateLineColor(isCorrect) {

        if (this.laneIndicatorLine) {

            const lineImageKey = isCorrect ? 'green_line_img' : 'red_line_img';
            this.laneIndicatorLine.setTexture(lineImageKey);
        }
        const lineX = 70 + (this.currentLaneIndex * 60); 
        const lineY = 280;
        this.laneIndicatorLine
            .setPosition(lineX, lineY)
            .setDisplaySize(60, 335);
    }



    showItemCollisionEffect(isCorrect) {
        if (!this.currentTrashItemGraphic) return;


        const itemGraphic = this.currentTrashItemGraphic;

        this.tweens.add({
            targets: itemGraphic,
            alpha: 0.5,
            duration: this.ANIMATION_TIMING.BLINK_DURATION,
            yoyo: true,
            repeat: this.ANIMATION_TIMING.BLINK_COUNT,
            onComplete: () => {

                if (!itemGraphic || !itemGraphic.scene) return;


                const itemData = this.currentTrashItemData;
                let blackImageKey;

                if (this.currentGameType === 2 && isCorrect) {
                    blackImageKey = `${itemData.id}_preprocessed_black_img`;
                } else {
                    blackImageKey = `${itemData.id}_black_img`;
                }

                if (this.textures.exists(blackImageKey)) {
                    itemGraphic.setTexture(blackImageKey);
                }


                this.tweens.add({
                    targets: itemGraphic,
                    alpha: 0,
                    duration: this.ANIMATION_TIMING.FADE_OUT_DURATION,
                    ease: 'Power2',
                    onComplete: () => {

                        if (itemGraphic && itemGraphic.scene) {
                            itemGraphic.destroy();
                        }


                        if (this.currentTrashItemGraphic === itemGraphic) {
                            this.currentTrashItemGraphic = null;
                        }
                    }
                });
            }
        });
    }



    showIncorrectPopup() {

        if (this.incorrectPopupBg) {
            this.incorrectPopupBg.destroy();
            this.incorrectPopupBg = null;
        }


        this.incorrectPopupBg = this.add.image(60, 240, 'popup_bg_img')
            .setDisplaySize(320, 375)
            .setOrigin(0, 0)
            .setAlpha(0)
            .setDepth(25);

        console.log('새 팝업 배경 생성:', this.incorrectPopupBg.texture.key);


        this.tweens.add({
            targets: this.incorrectPopupBg,
            alpha: 0.8, 
            duration: 800,
            ease: 'Linear',
            onComplete: () => {

                this.time.delayedCall(300, () => {
                    this.createRetryButton();
                });
            }
        });
    }


    createRetryButton() {


        this.retryButton = this.add.image(180, 360, 'retry_button')
            .setOrigin(0, 0)
            .setInteractive()
            .setDisplaySize(80, 85)
            .setDepth(26);


        this.retryButton.on('pointerdown', () => {

            this.hideIncorrectPopup();


            this.time.delayedCall(300, () => {
                this.resetCurrentRound();
            });
        });
    }


    hideIncorrectPopup() {
        console.log('팝업 숨김 시작');


        if (this.retryButton) {
            this.retryButton.destroy();
            this.retryButton = null;
        }

        if (this.retryButtonText) {
            this.retryButtonText.destroy();
            this.retryButtonText = null;
        }


        if (this.currentTrashItemGraphic) {
            this.currentTrashItemGraphic.destroy();
            this.currentTrashItemGraphic = null;
        }


        if (this.incorrectPopupBg) {
            console.log('팝업 배경 즉시 제거');
            this.incorrectPopupBg.destroy();
            this.incorrectPopupBg = null;
        }


        console.log('팝업 숨김 완료, 게임 재시작');
        this.resetCurrentRound();
    }




    hideResultUIAndProceed() {
        console.log('GameScene: 결과 UI 숨김 및 다음 진행.');

        if (this.health <= 0) {
            console.log('GameScene: 이미 게임 오버 상태이므로 다음 진행하지 않음.');
            return;
        }


        this.hideResultUI();


        if (this.currentTrashItemGraphic) {
            this.currentTrashItemGraphic.destroy();
            this.currentTrashItemGraphic = null;
        }


        this.handleResult(this.lastResultIsCorrect);


        this.setGameInputEnabled(true);

        this.resetCurrentRound();
    }

    hideResultUI() {
        console.log('GameScene: 결과 UI 숨김.');
        if (this.resultButton) { this.resultButton.setVisible(false); }
        if (this.resultButtonText) { this.resultButtonText.setVisible(false); }
        this.isProcessingResult = false;
    }

    setGameInputEnabled(enabled) {
        console.log('GameScene: 게임 입력 상태 변경 -', enabled ? '활성화' : '비활성화');


        if (this.commandButtons.left) {
            this.commandButtons.left.setInteractive(enabled);
            this.commandButtons.down.setInteractive(enabled);
            this.commandButtons.right.setInteractive(enabled);
        }
    }

    handleResult(isCorrect) {
        console.log('GameScene: 최종 판정 결과 처리 시작! 정답:', isCorrect);

        if (isCorrect) {

            const difficulty = this.currentTrashItemData.difficulty || 1;
            const baseScore = 100;
            const earnedScore = baseScore * difficulty;

            this.score += earnedScore;
            if (this.scoreText) {
                this.scoreText.setText(`${this.score}`);
            }
            console.log(`GameScene: 점수 업데이트 완료. 획득: ${earnedScore} (난이도 ${difficulty})`);
        } else {
            console.log('GameScene: 오답 처리 완료 (체력 감소됨).');
        }
    }

    proceedToNextRound() {
        console.log('GameScene: 다음 라운드로 진행, 현재:', this.currentRound, '-> 다음:', this.currentRound + 1);
        this.fallCount = 0;

        if (this.level === 3 && this.currentRound === 3) {

            this.time.delayedCall(1500, () => {
                this.startSpecialRound();
            });
            return;
        }

        if (this.currentRound >= this.getRoundData().length) { 

            this.completeLevel();
        } else {

            this.currentRound++;
            console.log('GameScene: 라운드 증가됨 ->', this.currentRound);


            this.currentLaneIndex = 0;
            this.currentOpenBinIndex = -1; 
            this.resetAllBins(); 


            this.updateRoundsUI();


            const nextRoundData = this.getRoundData().find(round => round.round === this.currentRound);
            console.log('GameScene: 다음 라운드 데이터:', nextRoundData);

            this.spawnWasteItem();
        }
    }


    startSpecialRound() {

        this.showSpecialPopup();
    }

    showSpecialPopup() {

        this.specialPopupBg = this.add.image(60, 240, 'popup_bg_img')
            .setDisplaySize(320, 375)
            .setOrigin(0, 0)
            .setAlpha(0)
            .setDepth(25);


        if (this.messageTextObject) {
            this.messageTextObject.setText(this.specialData.popupMessage);
            this.messageTextObject.setVisible(true);
        }


        this.tweens.add({
            targets: this.specialPopupBg,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                this.showSpecialWarningAnimation();
            }
        });
    }

    showSpecialWarningAnimation() {
        const { width } = this.sys.game.canvas;

        this.specialWarningSlide = this.add.image(width + 700, 243, this.specialData.warningImageKey)
            .setOrigin(0, 0)
            .setDepth(26)
            .setDisplaySize(1300, 353.53);


        this.tweens.add({
            targets: this.specialWarningSlide,
            x: -448,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {

                this.showSpecialIntroText();
            }
        });
    }

    showSpecialIntroText() {
        const centerX = this.sys.game.canvas.width / 2;


        const specialRoundText = this.add.text(
            centerX, 391,
            '<special round>',
            {
                font: '24px "머니그라피"',
                fill: '#303030',
                align: 'center'
            }
        ).setOrigin(0.5, 0)
            .setAlpha(0.5)
            .setDepth(30);


        const infoText = this.add.text(
            centerX, 423,
            this.specialData.introText,
            {
                font: '24px "머니그라피"',
                fill: '#303030',
                align: 'center'
            }
        ).setOrigin(0.5, 0)
            .setDepth(30);


        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: [specialRoundText, infoText],
                alpha: 0,
                duration: 700,
                onComplete: () => {
                    specialRoundText.destroy();
                    infoText.destroy();
                    this.initializeSpecialSteps();
                }
            });
        });
    }

    initializeSpecialSteps() {

        this.currentSpecialStep = 0;
        this.specialStepInputEnabled = true;


        this.displaySpecialStepContent(0);


        this.initializeSpecialCommandKeys();

    }

    displaySpecialStepContent(stepIndex) {

        if (this.specialStepImage) this.specialStepImage.destroy();
        if (this.specialStepText) this.specialStepText.destroy();

        const step = this.specialData.steps[stepIndex];

        if (this.messageTextObject) {
            this.messageTextObject.setText("종이팩의 재활용 과정을 알아보자!");
            this.messageTextObject.setVisible(true);
        }


        this.specialStepImage = this.add.image(40, 358, step.imageKey)
            .setOrigin(0, 0)
            .setDisplaySize(160, 160)
            .setDepth(27)
            .setAlpha(0); 


        this.specialStepText = this.add.text(80, 308, step.text, {
            font: '20px "머니그라피"',
            fill: '#303030',
            align: 'center'
        })
            .setOrigin(0, 0)
            .setDepth(27)
            .setAlpha(0); 


        this.tweens.add({
            targets: [this.specialStepImage, this.specialStepText],
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }

    initializeSpecialCommandKeys() {
        this.specialCommandKeys = [];
        this.specialCommands = [];
        this.activeKeyIndex = 0;


        this.specialData.steps.forEach((step, stepIndex) => {
            step.commands.forEach((cmd, cmdIndex) => {
                this.specialCommands.push({
                    ...cmd,
                    stepIndex,
                    commandIndex: cmdIndex
                });
            });
        });


        let keyX = 238;
        const keyY = 418;

        this.specialCommands.forEach((cmd, idx) => {
            const isActive = idx === 0;  
            const keyImg = this.add.image(
                keyX + (idx * 24),
                keyY,
                isActive ? `${cmd.action}_key_img` : `${cmd.action}_key_dim_img`
            )
                .setDisplaySize(40, 43)
                .setOrigin(0, 0)
                .setDepth(28 + (this.specialCommands.length - idx));


            keyImg.active = isActive;
            keyImg.action = cmd.action;
            keyImg.commandIndex = idx;
            keyImg.stepIndex = cmd.stepIndex;
            this.specialCommandKeys.push(keyImg);
        });


        this.handleSpecialCommand();
    }
    handleSpecialCommand() {

        this.input.keyboard.off('keydown');
        ['left', 'down', 'right'].forEach(dir => {
            if (this.commandButtons[dir]) {
                this.commandButtons[dir].off('pointerdown');
            }
        });


        const handleInput = (action) => {
            if (!this.specialStepInputEnabled) return;
            this.processSpecialCommandInput(action);
        };


        this.input.keyboard.on('keydown', (event) => {
            let action = null;
            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT) action = 'left';
            else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN) action = 'down';
            else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) action = 'right';

            if (action) handleInput(action);
        });


        ['left', 'down', 'right'].forEach(dir => {
            if (this.commandButtons[dir]) {
                this.commandButtons[dir].on('pointerdown', () => handleInput(dir));
            }
        });
    }
    
    processSpecialCommandInput(action) {

        if (!this.canClick || !this.checkTouchDelay()) return;

        const currentKey = this.specialCommandKeys[this.activeKeyIndex];
        if (!currentKey) return;

        if (action === currentKey.action) {

            this.disableClickTemporarily();


            currentKey.active = false;
            this.tweens.add({
                targets: currentKey,
                y: currentKey.y - 50,
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    currentKey.destroy();


                    for (let i = this.activeKeyIndex + 1; i < this.specialCommandKeys.length; i++) {
                        const key = this.specialCommandKeys[i];
                        if (key && !key.destroyed) {
                            this.tweens.add({
                                targets: key,
                                x: 238 + ((i - this.activeKeyIndex - 1) * 24),
                                duration: 300
                            });
                        }
                    }


                    this.activeKeyIndex++;
                    if (this.activeKeyIndex < this.specialCommandKeys.length) {
                        const nextKey = this.specialCommandKeys[this.activeKeyIndex];
                        if (nextKey && !nextKey.destroyed) {
                            nextKey.active = true;
                            nextKey.setTexture(`${nextKey.action}_key_img`);


                            if (nextKey.stepIndex !== currentKey.stepIndex) {
                                this.displaySpecialStepContent(nextKey.stepIndex);
                            }
                        }
                    } else {

                        this.goToNextSpecialStep();
                    }
                }
            });
        } else {

            this.tweens.add({
                targets: currentKey,
                x: currentKey.x + 5,
                duration: 50,
                yoyo: true,
                repeat: 2
            });
        }
    }

    goToNextSpecialStep() {
        console.log('goToNextSpecialStep 호출됨');


        this.specialStepInputEnabled = false;
        console.log('현재 스텝:', this.currentSpecialStep);

        if (this.messageTextObject) {
            this.messageTextObject.setText(this.specialData.completeMessage);
        }


        this.time.delayedCall(2500, () => {
            console.log('모든 스텝 완료, 정리 시작');
            this.cleanupSpecialRound();
        });
    }

    startSpecialStepSequence(stepIndex) {

        if (this.specialStepImage) this.specialStepImage.destroy();
        if (this.specialStepText) this.specialStepText.destroy();
        if (this.specialCommandKeys) this.specialCommandKeys.forEach(img => img.destroy());
        this.specialCommandKeys = [];


        if (this.messageTextObject) {
            this.messageTextObject.setText("종이팩의 재활용 과정을 알아보자!");
            this.messageTextObject.setVisible(true);
        }


        if (stepIndex >= this.specialData.steps.length) {

            if (this.messageTextObject) {
                this.messageTextObject.setText(this.specialData.completeMessage);
            }

            this.time.delayedCall(2000, () => {
                this.cleanupSpecialRound();
            });
            return;
        }


        const step = this.specialData.steps[stepIndex];


        this.specialStepImage = this.add.image(40, 358, step.imageKey)
            .setOrigin(0, 0)
            .setDisplaySize(160, 160)
            .setDepth(27);


        this.specialStepText = this.add.text(80, 308, step.text, {
            font: '20px "머니그라피"',
            fill: '#303030',
            align: 'center'
        }).setOrigin(0, 0).setDepth(27);


        this.setupSpecialCommandKeys(step);


        this.handleNextSpecialCommand();


        this.currentSpecialStep = stepIndex;
    }

    cleanupSpecialRound() {

        if (this.specialStepImage) this.specialStepImage.destroy();
        if (this.specialStepText) this.specialStepText.destroy();
        if (this.specialCommandKeys) {
            this.specialCommandKeys.forEach(key => key.destroy());
        }


        if (this.specialWarningSlide) {
            this.tweens.add({
                targets: this.specialWarningSlide,
                x: -1500,
                duration: 1500,
                onComplete: () => {
                    this.specialWarningSlide.destroy();
                    if (this.specialPopupBg) {

                        this.tweens.add({
                            targets: this.specialPopupBg,
                            alpha: 0,
                            duration: 500,
                            onComplete: () => {
                                this.specialPopupBg.destroy();

                                this.score += 500;
                                if (this.scoreText) {
                                    this.scoreText.setText(`${this.score}`);
                                }

                                this.completeLevel();
                            }
                        });
                    }
                }
            });
        }
    }


    resetCurrentRound() {
        console.log('GameScene: 현재 라운드 다시 시작');


        this.tweens.killAll();


        this.isFalling = false;
        this.isProcessingResult = false;
        this.gameState = 'playing';


        this.itemTimeRemaining = this.itemTimeLimit;
        this.lastFallTime = 0;


        this.preprocessingSteps = null;
        this.currentPreprocessingStep = 0;
        this.commandKeyImages = [];


        this.fallCount = 0;


        if (this.touchText) {
            this.touchText.destroy();
            this.touchText = null;
        }


        if (this.currentTrashItemGraphic) {
            this.currentTrashItemGraphic.destroy();
            this.currentTrashItemGraphic = null;
        }


        if (this.itemNameText) {
            this.itemNameText.destroy();
            this.itemNameText = null;
        }


        if (this.laneIndicatorLine) {
            this.laneIndicatorLine.setTexture('lane_line_img');
            this.laneIndicatorLine.setVisible(false);
        }


        this.currentLaneIndex = 0;
        this.currentOpenBinIndex = -1;



        this.spawnWasteItem();
    }

    completeLevel() {
        console.log('GameScene: 레벨 완료!');


        const topUI = [
            this.levelText,
            this.scoreText,
            this.difficultyText,

            ...this.uiContainers.common.list.filter(obj =>
                obj.texture && (obj.texture.key === 'back_button_img' || obj.texture.key === 'menu_button_img')
            ),

            ...this.children.list.filter(obj =>
                obj.text && (
                    obj.text === '레벨' ||
                    obj.text === '환경 점수' ||
                    obj.text === '난이도'
                )
            )
        ];


        const centerUI = [
            this.mainPanelImage,
            this.currentTrashItemGraphic,
            this.itemNameText,
            ...(this.heartGraphics || []),
            ...(this.roundGraphics || []),
            ...(this.binImages || []),
            ...(this.binNameTexts || []),
            this.laneIndicatorLine,
            this.type3LeftText,
            this.type3RightText
        ].filter(Boolean);


        const messageUI = [
            this.messageAreaGraphic,
            this.messageTextObject,
            ...(this.messageCommandImages || []),
            ...(this.messageTexts || [])
        ].filter(Boolean);


        const bottomUI = [
            this.commandButtons.left,
            this.commandButtons.down,
            this.commandButtons.right
        ];


        this.tweens.add({
            targets: topUI,
            x: '-=500',
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {

                this.tweens.add({
                    targets: centerUI,
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {

                        this.tweens.add({
                            targets: messageUI,
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2',
                            onComplete: () => {

                                this.tweens.add({
                                    targets: bottomUI,
                                    x: '-=500',
                                    alpha: 0,
                                    duration: 500,
                                    ease: 'Power2',
                                    onComplete: () => {

                                        this.time.delayedCall(200, () => {
                                            this.showResultScene();
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
   
    showResultScene() {

        const levelScore = this.score;


        const elapsed = this.time.now - this.levelStartTime;
        const avg = this.AVERAGE_LEVEL_TIME;
        let timeBonusRatio = avg / Math.max(elapsed, 1);

        timeBonusRatio = Math.min(Math.max(timeBonusRatio, 0.5), 2);


        const totalScore = Math.round(levelScore * timeBonusRatio);


        let totalPoint = parseInt(localStorage.getItem('totalPoint')) || 0;
        totalPoint += totalScore;
        localStorage.setItem('totalPoint', totalPoint);

        this.scene.start('ResultScene', {
            level: this.level,
            trashCount: this.maxRounds,
            baseScore: levelScore,
            totalScore,
            timeBonus: timeBonusRatio.toFixed(2),
            elapsed: Math.round(elapsed / 1000),
            health: this.health
        });
    }

    updateHealthUI() {
        console.log('GameScene: 체력 UI 업데이트. 현재 체력:', this.health);


        const totalHearts = this.heartGraphics.length;

        for (let i = 0; i < totalHearts; i++) {

            const heartImg = this.heartGraphics[i];

            if (i < this.health) {

                heartImg.setTexture('heart_full_img');
            } else {

                heartImg.setTexture('heart_empty_img');
            }
        }
    }

    updateRoundsUI() {
        console.log('GameScene: 라운드 UI 업데이트, 현재 라운드:', this.currentRound);

        const roundSize = 15;   
        const roundSpacing = 5; 
        const firstRoundX = 80;


        for (let i = 0; i < this.roundGraphics.length; i++) {
            const roundImg = this.roundGraphics[i];

            if (i === 0) {

                roundImg.setTexture('round_black_img');
                roundImg.setPosition(firstRoundX, 260);
            } else if (i < this.currentRound) {

                roundImg.setTexture('round_connected_img');



                const originalX = firstRoundX + (i * (roundSize + roundSpacing));
                roundImg.setPosition(originalX - roundSpacing, 260);
            } else {

                roundImg.setTexture('round_gray_img');
                const originalX = firstRoundX + (i * (roundSize + roundSpacing));
                roundImg.setPosition(originalX, 260);
            }
        }
    }

    resetItemForRetry() {
        console.log('GameScene: 같은 아이템으로 다시 출제.');
        this.hideResultUI();


        if (this.currentGameType === 1) {
            this.spawnType1Item(this.currentTrashItemData);
        } else if (this.currentGameType === 2) {
            this.spawnType2Item(this.currentTrashItemData);
        } else if (this.currentGameType === 3) {
            this.spawnType3Item(this.currentTrashItemData);
        }
    }


    resetGameState() {
        console.log('GameScene: 게임 상태 초기화 시작.');


        if (this.incorrectPopupBg) {
            this.incorrectPopupBg.destroy();
            this.incorrectPopupBg = null;
        }

        this.score = 0;

        this.currentRound = 1;
        this.maxRounds = this.getRoundData().length; 
        this.currentLaneIndex = 0;
        this.isFalling = false;
        this.isProcessingResult = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveDownFast = false;
        this.lastKeyboardMoveTime = 0;
        this.lastLandedLaneIndex = 0;
        this.itemTimeRemaining = this.itemTimeLimit;
        this.currentOpenBinIndex = -1;
        this.gameState = 'playing';
        this.currentGameType = 1;
        this.fallCount = 0;

        this.levelStartTime = this.time.now; 


        this.switchGameTypeUI(this.currentGameType);


        if (this.scoreText) { this.scoreText.setText(this.score); }
        if (this.levelText) {
            this.levelText.setText(`${this.level}`);
        }
        if (this.roundText) { this.roundText.setText(`${this.currentRound}`); }
        if (this.timeText) { this.timeText.setText(`${this.itemTimeLimit}`); }


        if (this.heartGraphics.length > 0) {
            this.updateHealthUI();
        }


        this.hideResultUI();


        if (this.currentTrashItemGraphic) {
            this.currentTrashItemGraphic.destroy();
            this.currentTrashItemGraphic = null;
        }

        this.currentLaneIndex = 0;
        this.currentOpenBinIndex = -1;


        this.resetAllBins();


        this.spawnWasteItem();


        console.log('GameScene: 게임 상태 초기화 완료. 첫 아이템 생성.');
    }

    resetAllBins() {
        console.log('모든 쓰레기통 리셋 시작');

        if (!this.binImages || this.binImages.length === 0) {
            console.log('쓰레기통 이미지가 초기화되지 않음');
            return;
        }


        const closedBinSize = { width: 50, height: 34 };
        const closedBinY = 581;

        this.binImages.forEach((bin, index) => {
            if (bin && this.binKeys && this.binKeys[index] && this.binGraphics && this.binGraphics[index]) {

                const closedImageKey = `${this.binKeys[index]}_img`;
                const originalBinX = this.binGraphics[index].x;

                if (this.textures.exists(closedImageKey)) {

                    bin.setTexture(closedImageKey);


                    bin.setDisplaySize(closedBinSize.width, closedBinSize.height);
                    bin.setPosition(originalBinX, closedBinY);

                    console.log(`쓰레기통 ${index} (${this.binKeys[index]}) 닫힌 상태로 리셋`);
                } else {
                    console.warn(`쓰레기통 이미지 없음: ${closedImageKey}`);
                }
            }
        });


        if (this.laneIndicatorLine) {
            this.laneIndicatorLine.setVisible(false);
        }

        console.log('모든 쓰레기통 리셋 완료');
    }

    shutdown() {

        this.tweens.killAll();


        if (this.incorrectPopupBg) {
            this.incorrectPopupBg.destroy();
            this.incorrectPopupBg = null;
        }


        if (this.currentTrashItemGraphic) {
            this.currentTrashItemGraphic.destroy();
            this.currentTrashItemGraphic = null;
        }

        console.log('GameScene: 씬 종료 및 객체 정리 완료');
    }


    gameOver() {
        console.log('GameScene: Game Over!');


        if (this.tweens) this.tweens.killAll();
        if (this.currentTrashItemGraphic && this.currentTrashItemGraphic.anims) {
            this.currentTrashItemGraphic.anims.stop();
        }


        if (this.messageTextObject) {
            this.messageTextObject.setText('게임 오버!\n다음에 다시 도전하세요!');
        }


        this.setGameInputEnabled(false);


        this.incorrectPopupBg = this.add.image(60, 240, 'popup_bg_img')
            .setDisplaySize(320, 375)
            .setOrigin(0, 0)
            .setAlpha(0)
            .setDepth(25);


        this.tweens.add({
            targets: this.incorrectPopupBg,
            alpha: 0.8,
            duration: 800,
            ease: 'Linear',
            onComplete: () => {

                const gameOverText = this.add.text(220, 350, '게임 오버', {
                    font: '32px "머니그라피"',
                    fill: '#ffffff',
                    align: 'center'
                })
                    .setOrigin(0.5)
                    .setDepth(26);


                const restartButton = this.add.rectangle(220, 450, 180, 60, 0x0000ff)
                    .setInteractive()
                    .setDepth(26);

                const restartText = this.add.text(220, 450, '다시 시작', {
                    font: '24px "머니그라피"',
                    fill: '#ffffff',
                    align: 'center'
                })
                    .setOrigin(0.5)
                    .setDepth(27);


                restartButton.on('pointerdown', () => {

                    if (this.commandButtons.left) this.commandButtons.left.destroy();
                    if (this.commandButtons.down) this.commandButtons.down.destroy();
                    if (this.commandButtons.right) this.commandButtons.right.destroy();
                    if (this.currentTrashItemGraphic) this.currentTrashItemGraphic.destroy();
                    if (this.incorrectPopupBg) this.incorrectPopupBg.destroy();



                    this.input.enabled = true;
                    if (this.input.keyboard) this.input.keyboard.enabled = true;
                    if (this.input.mouse) this.input.mouse.enabled = true;
                    if (this.input.touch) this.input.touch.enabled = true;


                    this.scene.stop('GameScene');
                    this.scene.start('BootScene');
                });
            }
        });
    }
}


class ResultScene extends Phaser.Scene {
    constructor() {
        super('ResultScene');
    }

    init(data) {

        this.resultData = data || {};
    }
    preload() {
        this.load.image('btn_home', 'assets/images/homebutton.png');
        this.load.image('btn_next', 'assets/images/nextbutton.png');
        this.load.image('btn_env', 'assets/images/refeelybutton.png');
        this.load.image('line', 'assets/images/finalline.png');

    }

    create() {
        const { width, height } = this.sys.game.canvas;


        this.cameras.main.setBackgroundColor('#3cbb89');


        this.resultContainer = this.add.container(0, 0).setAlpha(0);


        const panel = this.add.rectangle(0, 0, 340, 600, 0x3cbb89, 1);
        this.resultContainer.add(panel);


        const title = this.add.text(60, 200, '게임 결과', {
            font: '48px "머니그라피"',
            fill: '#fff',
            align: 'left'
        }).setOrigin(0, 0);
        this.resultContainer.add(title);


        const subtitle = this.add.text(60, 260, '분리배출의 전문가네요!', {
            font: '24px "머니그라피"',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0, 0);
        this.resultContainer.add(subtitle);


        const infoStartY = 332;
        const infoLineHeight = 40;
        const infoFont = '32px "머니그라피"';
        const infoColor = '#fff';


        const labels = ['레벨', '처리한 쓰레기', '환경 점수'];
        labels.forEach((label, i) => {
            this.resultContainer.add(
                this.add.text(60, infoStartY + i * infoLineHeight, label, {
                    font: infoFont,
                    fill: infoColor,
                    align: 'left'
                }).setOrigin(0, 0)
            );
        });


        const values = [
            this.resultData.level,
            `${this.resultData.trashCount}개`,
            this.resultData.baseScore?.toLocaleString() ?? ''
        ];
        values.forEach((val, i) => {
            this.resultContainer.add(
                this.add.text(380, infoStartY + i * infoLineHeight, val, {
                    font: infoFont,
                    fill: infoColor,
                    align: 'right'
                }).setOrigin(1, 0)
            );
        });


        const line = this.add.image(60, 457, 'line')
            .setOrigin(0, 0)
            .setInteractive()
            .setAlpha(1)
            .setDisplaySize(320, 2);
        this.resultContainer.add(line);


        const point = this.add.text(60, 468, '획득 포인트', {
            font: '32px "머니그라피"',
            fill: '#fff',
            align: 'left'
        }).setOrigin(0, 0);
        this.resultContainer.add(point);
        const pointvalue = this.add.text(380, 468, this.resultData.totalScore?.toLocaleString() ?? '', {
            font: '32px "머니그라피"',
            fill: '#fff',
            align: 'right'
        }).setOrigin(1, 0);
        this.resultContainer.add(pointvalue);


        const elapsedSec = this.resultData.elapsed || 0;
        const min = Math.floor(elapsedSec / 60);
        const sec = elapsedSec % 60;
        const elapsedStr = `${min}분 ${sec}초`;

        this.resultContainer.add(
            this.add.text(60, 508,
                `시간 스코어 x${this.resultData.timeBonus}  (${elapsedStr})`, {
                font: '16px "머니그라피"',
                fill: '#fff',
                align: 'left'
            }).setOrigin(0, 0)
        );


        const homeBtnImg = this.add.image(46, 650, 'btn_home')
            .setOrigin(0, 0)
            .setInteractive()
            .setAlpha(1)
            .setDisplaySize(164, 40); 
        this.resultContainer.add(homeBtnImg);


        const nextBtnImg = this.add.image(230, 650, 'btn_next')
            .setOrigin(0, 0)
            .setInteractive()
            .setAlpha(1)
            .setDisplaySize(164, 40);
        this.resultContainer.add(nextBtnImg);


        const envBtnImg = this.add.image(46, 555, 'btn_env')
            .setOrigin(0, 0)
            .setInteractive()
            .setAlpha(1)
            .setDisplaySize(348, 75);
        this.resultContainer.add(envBtnImg);


        this.tweens.add({
            targets: this.resultContainer,
            alpha: 1,
            duration: 700,
            ease: 'Power2'
        });


        envBtnImg.on('pointerdown', () => {
            window.open('https://refeely.com/', '_blank');
        });

        homeBtnImg.on('pointerdown', () => {
            this.fadeOutAndGoHome();
        });

        nextBtnImg.on('pointerdown', () => {
            this.fadeOutAndNextLevel();
        });
    }

    fadeOutAndGoHome() {

        const savedLevel = parseInt(localStorage.getItem('level') || '1', 10);
        if (this.resultData.level > savedLevel) {
            localStorage.setItem('level', this.resultData.level);
        }
        this.tweens.add({
            targets: this.resultContainer,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.scene.start('BootScene');
            }
        });
    }

    fadeOutAndNextLevel() {
        const nextLevel = (this.resultData.level || 1) + 1;


        if (nextLevel > 3) {

            const popupBg = this.add.rectangle(
                220, 478,  
                300, 200,  
                0x000000,  
                0.8       
            ).setDepth(100);


            const popupText = this.add.text(
                220, 478,
                '다음 레벨은\n준비중입니다!',
                {
                    font: '24px "머니그라피"',
                    fill: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5)
                .setDepth(101);


            this.time.delayedCall(2000, () => {
                popupBg.destroy();
                popupText.destroy();
            });

            return; 
        }


        const savedLevel = parseInt(localStorage.getItem('level') || '1', 10);
        if (nextLevel > savedLevel) {
            localStorage.setItem('level', nextLevel);
        }

        this.tweens.add({
            targets: this.resultContainer,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.scene.start('GameScene', {
                    level: nextLevel,
                    health: this.resultData.health
                });
            }
        });
    }
}





const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 440,
    height: 956,
    backgroundColor: '#3cbb89',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,

        min: {
            width: 220,
            height: 478
        },

        max: {
            width: 440,
            height: 956
        }
    },

    input: {
        touch: {
            capture: false
        }
    },
    scene: [
        LoginScene,
        SignupScene,
        LoginInputScene,
        BootScene,
        HowToPlayScene,
        MyPageScene,
        GameScene,
        DexScene,
        ResultScene
    ],
    dom: {
        createContainer: true  
    }
};
const game = new Phaser.Game(config);