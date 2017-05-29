var last_data_emit = []; //хранятся данные передаваемые на сервер в последнем запросе (необходим в случае если истек токен для повторной отправки запроса с обновленным токеном)
var last_emit; // хранится данные по пути куда отправлять emit

jQuery(function($){    
    'use strict';

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
     */
    var IO = {

        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },

        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents : function() {
            IO.socket.on('tokenError', IO.onTokenError );   // Если приходит ответ от сервера что токен не корректный                        
            IO.socket.on('tokenUpdate', IO.onTokenUpdate ); // Если приходет от сервера ответ после запроса на рефреш токена                       
            IO.socket.on('validAuthorization', App.Player.onValidAuthorization ); // Если приходет от сервера ответ о валидной авторизации
            IO.socket.on('validLogOut', App.Player.onValidLogOut ); // Если приходет от сервера ответ о валидном разлогинивании

            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
            IO.socket.on('beginNewGame', IO.beginNewGame );
            IO.socket.on('gameEnd', App.Game.gameEnd );

            IO.socket.on('updateListRoom', App.updateListRoom );
            IO.socket.on('getFreeRooms', App.updateListRoom );
            IO.socket.on('addInLogArea', App.onAddInLogArea ); // Изменение в составе комнаты (присоеденился / отсоиденился игрок)            

            IO.socket.on('error', IO.error );    
        },

        /**
         * Если токен вернулся с ошибкой
         */
        onTokenError : function(data) {        
            if (data.error == 'TIME_OUT_TOKEN'){
                IO.socket.emit('tokenRefresh', {token_refresh: localStorage.token_refresh});                            
            }
        },

        /**
         * Обновление токена + переотправка запроса
         */
        onTokenUpdate : function(data) {   
            if (data.error == "ALL_CORRECT")     
            {
                localStorage.token = data.token;
                last_data_emit['token'] = localStorage.token;

                IO.socket.emit(last_emit, last_data_emit);                
            } else
            {
                console.log(data.error);
            }

        },

        /**
         * The client is successfully connected!
         */
        onConnected : function() {
            // Cache a copy of the client's socket.IO session ID on the App
            App.mySocketId = IO.socket.socket.sessionid;
            // console.log(data.message);
        },

        /**
         * A new game has been created and a random game ID has been generated.
         * @param data {{ gameId: int, mySocketId: * }}
         */
        onNewGameCreated : function(data) {
            App.gameInit(data);
        },

        /**
         * A player has successfully joined the game.
         * @param data {{playerName: string, gameId: int, mySocketId: int}}
         */
        playerJoinedRoom : function(data) {
            // When a player joins a room, do the updateWaitingScreen funciton.
            // There are two versions of this function: one for the 'host' and
            // another for the 'player'.
            //
            // So on the 'host' browser window, the App.Host.updateWiatingScreen function is called.
            // And on the player's browser, App.Player.updateWaitingScreen is called.
            App.Player.updateWaitingScreen(data);
        },

        /**
         * Both players have joined the game.
         * @param data
         */
        beginNewGame : function(data) {
            App.gameCountdown(data);
        },


        /**
         * An error has occurred.
         * @param data
         */
        error : function(data) {
            alert(data.message);
        }

    };

    var App = {

        /**
         * Keep track of the gameId, which is identical to the ID
         * of the Socket.IO Room used for the players and host to communicate
         *
         */
        gameId: 0,

        /**
         * The Socket.IO socket object identifier. This is unique for
         * each player and host. It is generated when the browser initially
         * connects to the server when the page loads for the first time.
         */
        mySocketId: '',

        /**
         * Contains references to player data
         */
        players : [],

        /**
         * Flag to indicate if a new game is starting.
         * This is used after the first game ends, and players initiate a new game
         * without refreshing the browser windows.
         */
        isNewGame : false,


        /* *************************************
         *                Setup                *
         * *********************************** */

        /**
         * This runs when the page initially loads.
         */
        init: function () {
            App.cacheElements();
            App.showMainScreen();
            App.bindEvents();

            // Initialize the fastclick library
            FastClick.attach(document.body);
        },

        /**
         * Create references to on-screen elements used throughout the game.
         */
        cacheElements: function () {
            App.$doc = $(document);

            // Templates
            App.$gameArea = $('#gameArea');
            App.$templateMainScreen = $('#main-template').html();
            App.$templateRegUser = $('#registration-template').html();            
            App.$templateAuthUser = $('#authorization-template').html();            
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$templateNewGame = $('#create-game-template').html();
            App.$templateJoinGame = $('#join-game-template').html();

            App.$templateListFreeRoom = $('#template-update-free-room').html();
            App.$templateGameLogicMain = $('#game-logic-main').html();
            App.$templateGameLogicFinish = $('#game-logic-finish').html();
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {

            // Player
            App.$doc.on('click', '#btnRegUser', App.Player.onRegUserClick);
            App.$doc.on('click', '#btnAuthUser', App.Player.onAuthUserClick);
            App.$doc.on('click', '#btnSubmitRegUser', App.Player.onSubmitRegUserClick);
            App.$doc.on('click', '#btnSubmitAuthUser', App.Player.onSubmitAuthUserClick);        
            App.$doc.on('click', '#btnLogOut', App.Player.onLogOut);

            App.$doc.on('click', '#btnCreateGame', App.onCreateClick);            
            App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);        

            App.$doc.on('click', '#backToReg', App.Player.onbackToReg);
            App.$doc.on('click', '#backToIntroScreen', App.Player.onBackToIntroScreen);
            App.$doc.on('click', '#backToIntroScreenWithLeaveRoom', App.Player.onbackToIntroScreenWithLeaveRoom);
            
            App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);
           
            App.$doc.on('click', '.js_game_id', App.Player.addGameIdInInput);

            // Game logic
            App.$doc.on('click', '#btnGLMainWin', App.Game.winGame);
        },

        /* *********************************** *
         *             App Logic               *
         * *********************************** */


        /**
         * Главная страница с авторизацияей и регистрацией
         */
        showMainScreen: function() {
            App.$gameArea.html(App.$templateMainScreen);
            App.doTextFit('.title');
        },


        /**
         * Show the initial Anagrammatix Title Screen
         * (with Start and Join buttons)
         */
        showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);
            App.doTextFit('.title');
        },

        /**
         * Handler for the "Start" button on the Title Screen.
         */
        onCreateClick: function () {                    
            // console.log('Clicked "Create A Game"');
            last_data_emit = {token : localStorage.token};
            last_emit = 'playerCreateNewGame';        
            IO.socket.emit('playerCreateNewGame', last_data_emit);
        },


        /**
         * лог присоединеных пользователей к игре
         */        
        onAddInLogArea: function (data) {                    
            $('#log_area').text(data.message);
        },

        /**
         * обновление списка доступных комнат
         */        
        updateListRoom: function (data) {     
            var html = twig({data: App.$templateListFreeRoom});                    
            html = html.render({rooms: data.rooms})                
            $('#ulGames').html(html);
        },


        /**
         * The Host screen is displayed for the first time.
         * @param data{{ gameId: int, mySocketId: * }}
         */
        gameInit: function (data) {        	
            App.gameId = data.gameId;
            App.mySocketId = data.mySocketId;

            App.displayNewGameScreen();
            // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        },
        
        /**
         * Show the screen containing the game URL and unique game ID
         */
        displayNewGameScreen : function() {
            // Fill the game screen with the appropriate HTML
            App.$gameArea.html(App.$templateNewGame);

            // Display the URL on screen
            $('#gameURL').text(window.location.href);
            App.doTextFit('#gameURL');

            // Show the gameId / room id on screen
            $('#spanNewGameCode').text(App.gameId);
        },
        
        /**
         * Display 'Get Ready' while the countdown timer ticks down.
         * @param hostData
         */
        gameCountdown : function(hostData) {
            App.$gameArea.html(App.$templateGameLogicMain);                
        },



        /* *****************************
           *        PLAYER CODE        *
           ***************************** */

        Player : {
            /**
             * The player's name entered on the 'Join' screen.
             */
            myName: '',

            /**
             * Нажатие на кнопку возврата на главной страниц с выбором регистрации/авторизации
             */
            onbackToReg: function () {
                App.$gameArea.html(App.$templateMainScreen);
                App.doTextFit('.title');
            },

            /**
             * Нажатие на кнопку возврата на главной страниц IntroScreen
             */
            onBackToIntroScreen: function () {
                App.$gameArea.html(App.$templateIntroScreen);
                App.doTextFit('.title');
            },

            /**
             * Нажатие на кнопку возврата на главной страниц IntroScreen после завершения игры
             */
            onbackToIntroScreenWithLeaveRoom: function () {
                last_data_emit = {token : localStorage.token};
                last_emit = 'playerLeaveRoom';        
                IO.socket.emit('playerLeaveRoom', last_data_emit);                

                App.$gameArea.html(App.$templateIntroScreen);
                App.doTextFit('.title');
            },


            /**
             * Нажатие на кнопку регистрации на главной странице
             */
            onRegUserClick: function () {
                App.$gameArea.html(App.$templateRegUser);
            },

            /**
             * Нажатие на кнопку авторизации на главной странице
             */
            onAuthUserClick: function () {
                App.$gameArea.html(App.$templateAuthUser);     	                            	
            },
            /**
             * Отправка регистрационных данных на сервер
             */
            onSubmitRegUserClick: function() {
                // console.log('Player clicked "Start"');

                // если ответ с сервера с не верной авторизацией
                IO.socket.on('errorRegistration', function(data){
                    $('#errorRegistration').html(data.message);
                });

                // collect data to send to the server
                var data = {
                    login : $('#inputLogin').val(),
                    pass : $('#inputPass').val(),
                    mail : $('#inputMail').val()
                };

                // Send the gameId and playerName to the server
                IO.socket.emit('userRegistration', data);
            },            

            /**
             * Отправка авторизационных данных на сервер
             */
            onSubmitAuthUserClick: function() {
                // console.log('Player clicked "Start"');
                // если ответ с сервера с не верной авторизацией
                IO.socket.on('errorAuthorization', function(data){
                    $('#errorAuthorization').html(data.message);
                });

                // collect data to send to the server
                var data = {
                    login : $('#inputLogin').val(),
                    pass : $('#inputPass').val()
                };

                // Send the gameId and playerName to the server
                IO.socket.emit('userAuthorization', data);
            },            


            /**
             * ответ с сервера с верной авторизацией
             */
            onValidAuthorization: function(data) {                
                localStorage.token = data.token;
                localStorage.token_refresh = data.token_refresh;
                App.showInitScreen();                
            },


            /**
             * ответ с сервера с верной авторизацией
             */
            onValidLogOut: function(data) {                
                App.showMainScreen();                
            },
            

            /**
             * При нажатии на LogOut
             */
            onLogOut: function(data) {                
                var data = {
                    token : localStorage.token
                };

                last_data_emit = data;
                last_emit = 'userLogOut';
                IO.socket.emit('userLogOut', data);
            },


            /**
             * Click handler for the 'JOIN' button
             */
            onJoinClick: function () {
                App.$gameArea.html(App.$templateJoinGame); 

                var data = {
                    token : localStorage.token
                };

                last_data_emit = data;
                last_emit = 'playerClickJoinOnIntroScreen';
                IO.socket.emit('playerClickJoinOnIntroScreen', data);
            },

            /**
             * The player entered their name and gameId (hopefully)
             * and clicked Start.
             */
            onPlayerStartClick: function() {
                // console.log('Player clicked "Start"');

                // collect data to send to the server
                var data = {
                    gameId : +($('#inputGameId').val()),
                    token : localStorage.token
                };

                $('#btnStart').remove();
                $('.select_room').remove();
                $('#backToIntroScreen').attr('id', 'backToIntroScreenWithLeaveRoom');

                // Send the gameId and playerName to the server
                last_data_emit = data;
                last_emit = 'playerJoinGame';
                IO.socket.emit('playerJoinGame', data);

            },



            /**
             *  add game id in input
             */
            addGameIdInInput: function() {
                $("#inputGameId").val($(this).html());
            },            


            /**
             * Display the waiting screen for player
             * @param data
             */
            updateWaitingScreen : function(data) {
                if(IO.socket.socket.sessionid === data.mySocketId){
                    App.gameId = data.gameId;
                }
            },

        },

        /* *****************************
           *        Game logic         *
           ***************************** */

        Game : {
            /**
             * Нажатие на кнопку "Выграть"
             */
            winGame: function () {                
                // Кто-то нажал на кнопку win
                var data = {
                    token : localStorage.token,
                    gameId : App.gameId                    
                };
                last_data_emit = data;
                last_emit = 'gameLogicWinButton';

                IO.socket.emit('gameLogicWinButton', data);
            },

            /**
             * Кто-то победил
             */
            gameEnd : function(data) {
                App.$gameArea.html(App.$templateGameLogicFinish);
                if (data.win_token == localStorage.token){
                    $("#game-logic-win-text").html('ПОБЕДА');
                } else {
                    $("#game-logic-win-text").html('ПОРАЖЕНИЕ');
                }
            },            
        },


        /* **************************
                  UTILITY CODE
           ************************** */

        /**
         * Make the text inside the given element as big as possible
         * See: https://github.com/STRML/textFit
         *
         * @param el The parent element of some text
         */
        doTextFit : function(el) {
            textFit(
                $(el)[0],
                {
                    alignHoriz:true,
                    alignVert:false,
                    widthOnly:true,
                    reProcess:true,
                    maxFontSize:300
                }
            );
        }

    };

    IO.init();
    App.init();

}($));
