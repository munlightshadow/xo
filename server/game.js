var roomdata = require('roomdata'); // пакет для хранения данных для конкретной комнаты
var model_token = require('./model/token.js');
var func = require('./model/function.js');
var model_user = require('./model/user.js');
var config = require('config.json')('./config.json');


const COUNT_PLAYER_IN_ROOM = config.game.count_player_in_room;

var io;
var gameSocket;
var db;
var games = []; // id комнат в которых запущена игра

/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket, mysql){
    io = sio;
    gameSocket = socket;
    db = mysql;
    gameSocket.emit('connected', { message: "You are connected!" });

    // Host Events
    gameSocket.on('tokenRefresh', tokenRefresh);    

    // Player Events
    gameSocket.on('userRegistration', userRegistration);
    gameSocket.on('userAuthorization', userAuthorization);
    gameSocket.on('userLogOut', userLogOut);

    gameSocket.on('playerCreateNewGame', playerCreateNewGame);
    gameSocket.on('playerClickJoinOnIntroScreen', playerClickJoinOnIntroScreen);
    gameSocket.on('playerLeaveRoom', playerLeaveRoom);    
    gameSocket.on('playerJoinGame', playerJoinGame);

    // Game logic
    gameSocket.on('gameLogicSetTurn', gameSetTurn);    
    gameSocket.on('gameLogicSurrender', gameSurrender);    
    gameSocket.on('gameLogicLeaveRoomAfterWin', gameLeaveAfterWin);    
}


/* *****************************
   *                           *
   *       DESK FUNCTIONS      *
   *                           *
   ***************************** */


/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 */
function playerCreateNewGame(data) {
    var sock = this;
    model_token.check(db, gameSocket, io, data.token, function(valid, er){
        if (valid)    
        {
            // Create a unique Socket.IO Room
            var thisGameId = ( Math.random() * 100000 ) | 0;
            // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
            // Join the Room and wait for the players
            roomdata.joinRoom(sock, thisGameId);
            roomdata.set(sock, thisGameId, {gameEnd:false});
            console.log('-------Create new game---------');
            console.log('token ' + data.token + ' create game: ' + thisGameId );
            sock.emit('newGameCreated', {gameId: thisGameId, mySocketId: sock.id});
            //оповещаем комнату о новом присоединившемся игроке
            io.sockets.in(thisGameId).emit('addInLogArea', {message: 'Join user ' + sock.user.login + ' (' + io.nsps['/'].adapter.rooms[thisGameId].length + ')'});            
            //Оповещаем всех о создании новой комнаты
           UpdateListFreeRoom();
            // sock.join(thisGameId.toString());
        } else {
            sock.emit('tokenError', {error: er});
        }
    });            
};

/**
 * Пользователь нажал JOIN
 */
function playerClickJoinOnIntroScreen(data) {
    var sock = this;
    model_token.check(db, gameSocket, io, data.token, function(valid, er){
        if (valid)    
        {        
            console.log('-------Player click JOIN button---------');
            //Передаем пользователю список доступных комнат
            sock.emit('getFreeRooms', {rooms: getListFreeRoom()});
        } else {
            sock.emit('tokenError', {error: er});
        }
    });            
};


/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data) {
    var sock = this;
    model_token.check(db, gameSocket, io, data.token, function(valid, er){
        if (valid)    
        {    
            // Look up the room ID in the Socket.IO manager object.
            var room = io.nsps['/'].adapter.rooms[data.gameId];
            // If the room exists...
            if( room != undefined ){
                // attach the socket id to the data object.
                data.mySocketId = sock.id;

                // Join the room
                roomdata.joinRoom(sock, data.gameId);
                // sock.join(data.gameId);
                console.log('-------Join game---------');
                console.log('token ' + data.token + ' joining game: ' + data.gameId );

                // Emit an event notifying the clients that the player has joined the room.
                io.sockets.in(data.gameId).emit('playerJoinedRoom', data);

                // количество клиентов в комнате
                var clients = io.nsps['/'].adapter.rooms[data.gameId].length;                
                if (clients == COUNT_PLAYER_IN_ROOM){
                    hostPrepareGame(data.gameId, sock);
                }
                //оповещаем комнату о новом присоединившемся игроке
                io.sockets.in(data.gameId).emit('addInLogArea', {message: 'Join user ' + sock.user.login + ' (' + io.nsps['/'].adapter.rooms[data.gameId].length + ')'});            
            } else {
                // Otherwise, send an error message back to the player.
                sock.emit('errorRoom',{message: "This room does not exist."} );
            }
        } else {
            sock.emit('tokenError', {error: er});
        }
    });     
}


// функция выхода игрока из комнаты
function playerLeaveRoom(data) {
    var sock = this;
    model_token.check(db, gameSocket, io, data.token, function(valid, er){
        if (valid)    
        {    
            var roomId = sock.roomdata_room;
            roomdata.leaveRoom(sock);
            //проверяем, последний ли это вышедший из комнаты в которой была игра. Если да - забываем про это комнату
            if (func.in_array(roomId, games) && io.nsps['/'].adapter.rooms[roomId].length == 0){
                games.splice(games.indexOf(roomId), 1);                
            }

            console.log('-------Player leave room---------');
            //если при выходе комната удаляется, убираем ее из доступных комнат для игры
            if (io.nsps['/'].adapter.rooms[roomId] == undefined){
                UpdateListFreeRoom();
            } else {
                io.sockets.in(roomId).emit('addInLogArea', {message: 'Leave user ' + sock.user.login + ' (' + io.nsps['/'].adapter.rooms[roomId].length + ')'});            
            }

        } else {
            sock.emit('tokenError', {error: er});
        }
    });     
}

/**
 * Обновляет всем список созданных игр
 */
function UpdateListFreeRoom() {    
    io.sockets.emit('updateListRoom', {rooms: getListFreeRoom()});
}

/**
 * Возвращает всем список созданных игр
 */
function getListFreeRoom() {    
    var rooms = [];
    for (var property in io.nsps['/'].adapter.rooms) {
        //позволить присоединяться к комнате которая не общая и игроков меньше максимального значения, а так же игра не является активной.
        if (!isNaN(property) && io.nsps['/'].adapter.rooms[property].length < COUNT_PLAYER_IN_ROOM && !func.in_array(property, games))
        {
            rooms.push(property);
        }
    }        
    return rooms;
}




/* *****************************
   *                           *
   *     PLAYER FUNCTIONS      *
   *                           *
   ***************************** */

/**
 * Регистраия пользователя с валидацией
 */

function userRegistration(data) {
    var valid = true;
    var errorMessage = "";
    var sock = this;

    model_user.valid_reg(db, data, function(valid, err){    
        if( valid ){
            //добавление пользователя
            console.log('-------Reg new user---------');
            model_user.insert(db, data, function(){
                //выполняем его авторизацию
                userAuthorization({login : data.login, pass : data.pass, sock : sock});                
            })
        } else {
            // Otherwise, send an error message back to the player.
            console.log(err);
            sock.emit('errorRegistration',{message: err} );
        }
    }); 
}

/**
 * Авторизация пользователя
 */

function userAuthorization(data) {
    var sock;   
    if (data.sock != null) {sock = data.sock;} else {sock = this;}
    var valid = false;
    var errorMessage = "";

    var user;
    model_user.auth(db, data, function(valid, user){    
        if( valid ){
            console.log('-------Auth user---------');
            sock.user = user;
            var user_token = model_token.create(db, gameSocket, user['id']);
            sock.emit('validAuthorization', {token: user_token['token'], token_refresh: user_token['token_refresh']});
        } else {
            // Otherwise, send an error message back to the player.
            errorMessage += "Такой пользователь не существует. Либо пароль введен не верно";
            console.log(errorMessage);
            sock.emit('errorAuthorization',{message: errorMessage} );
        }
    }); 
}

/**
 * LogOut пользователя
 */
function userLogOut(data) {
    // A reference to the player's Socket.IO socket object
    var sock = this;

    model_token.check(db, gameSocket, io, data.token, function(valid, er){
        if (valid)    
        {
            console.log('-------Log out user---------');
            model_token.delete_token(db, data, function(){
                sock.emit('validLogOut');
            })            
        } else {
            sock.emit('tokenError', {error: er});
        }
    });
    
}


/**
 * Обнавляем токен
 */
function tokenRefresh(data) {
    // A reference to the player's Socket.IO socket object
    var sock = this;

    model_token.refresh(db, gameSocket, io, data.token_refresh, function(valid, info){
        if (valid)    
        {
            console.log('!!!!!!!!!!!!!!!!!!Token refresh!!!!!!!!!!!!!!!!!!!!!!!');
            sock.emit('tokenUpdate', {token: info, error: "ALL_CORRECT"});
        } else {
            sock.emit('tokenUpdate', {token: 0, error: info});
        }
    });    
}

/* *************************
   *                       *
   *      GAME LOGIC       *
   *                       *
   ************************* */

/*
 * Two players have joined. Alert the host!
 * @param gameId The game ID / room ID
 */
function hostPrepareGame(gameId, sock_last_joined_player) {
    var sock = sock_last_joined_player;
    var all_data = {
        mySocketId : sock.id,
        gameId : gameId
    };
    
    games.push(gameId);
    UpdateListFreeRoom();

    console.log('START!!!');
    io.sockets.in(gameId).emit('beginNewGame', all_data);
    
    var clientsId = io.nsps['/'].adapter.rooms[gameId];
    var clients = [];
    var board = new Array(15);

    for(var i = 0; i < 15; i++)
        board[i] = new Array(15);


    var i = 0;
    for (var id in clientsId.sockets) {
        clients[i] = io.sockets.connected[id];
        i++;
    }    

    var room_data = {
        players   : clients,
        curTurn   : 1,
        board     : board,
        gameEnd : false
    };

    roomdata.set(sock, gameId, room_data);

    clients[0].emit('gameInit', {symbol : "X"});
    clients[1].emit('gameInit', {symbol : "O"});

    clients[0].emit('gameGetTurn', {});
}


/**
 * Игрок сделал ход
 */
function gameSetTurn(data) {
    // A reference to the player's Socket.IO socket object
    var sock = this;

    model_token.check(db, gameSocket, io, data.token, function(valid, er){
        if (valid)    
        {
            var room_data = roomdata.get(sock, data.gameId);                            
            
            if (!room_data.gameEnd) {
                console.log('-------Send turn---------');
                io.sockets.in(data.gameId).emit('gameTurn', {symbol: data.symbol, x: data.x, y: data.y});
                            
                room_data.board[data.y][data.x] = data.symbol;
                var win = finishCheck(room_data.board, data.symbol, data.x, data.y, 15);
                if (win) {
                    room_data.gameEnd = true;
                    if (room_data.curTurn == 0) {
                        room_data.players[0].emit('gameEnd', {win : false});
                        room_data.players[1].emit('gameEnd', {win : true});
                    } else {
                        room_data.players[0].emit('gameEnd', {win : true});
                        room_data.players[1].emit('gameEnd', {win : false});                    
                    }
                    
                } else
                {
                    console.log('-------Set turn to next player---------');
                    room_data.players[room_data.curTurn].emit('gameGetTurn', {});
                }

                if (room_data.curTurn == COUNT_PLAYER_IN_ROOM - 1) {room_data.curTurn = 0;} else {room_data.curTurn++;}
                roomdata.set(sock, data.gameId, room_data);                
            }

        } else {
            sock.emit('tokenError', {error: er});
        }
    });
    
}   

function gameSurrender(data) {
    var sock = this;
    model_token.check(db, gameSocket, io, data.token, function(valid, er){
        if (valid)    
        {    
            var roomId = sock.roomdata_room;
            var room_data = roomdata.get(sock, data.gameId);                
            room_data.gameEnd = true;
            roomdata.set(sock, data.gameId, room_data);

            roomdata.leaveRoom(sock);
            console.log('-------Surrender---------');
            io.sockets.in(data.gameId).emit('gameEnd', {win : true});
        } else {
            sock.emit('tokenError', {error: er});
        }
    });      
}   

function gameLeaveAfterWin(data) {
    var sock = this;
    model_token.check(db, gameSocket, io, data.token, function(valid, er){
        if (valid)    
        {    
            console.log('-------Go back---------');
            var roomId = sock.roomdata_room;
            roomdata.leaveRoom(sock);
        } else {
            sock.emit('tokenError', {error: er});
        }
    });      
}   

function finishCheck(board, symbol, x, y, field) {
//vert
    let countInLine = 0;
    for(var iy = y-1; iy > y-5; iy--) {
        if (iy >= 0 && iy < field) {
            if (board[iy][x] == symbol) {countInLine++;} else {break;}
        }
    }
    for(var iy = y; iy < y+5; iy++) {
        if (iy >= 0 && iy < field) {
            if (board[iy][x] == symbol) {countInLine++;} else {break;}
        }
    }
    if (countInLine >= 5) {return true;} else {countInLine = 0;}

    //gor
    for(var ix = x-1; ix > x-5; ix--) {
        if (ix >= 0 && ix < field) {
            if (board[y][ix] == symbol) {countInLine++;} else {break;}
        }
    }
    for(var ix = x; ix < x+5; ix++) {
        if (ix >= 0 && ix < field) {
            if (board[y][ix] == symbol) {countInLine++;} else {break;}
        }
    }
    if (countInLine >= 5) {return true;} else {countInLine = 0;}

    //diag1
    var iy = y-1;
    for(var ix = x-1; ix > x-5; ix--) {
        if (ix >= 0 && iy >= 0 && ix < field && iy < field) {
            if (board[iy][ix] == symbol) {countInLine++;} else {break;}
        }
        iy--;
    }
    iy = y;
    for(var ix = x; ix < x+5; ix++) {
        if (ix >= 0 && iy >= 0 && ix < field && iy < field) {
            if (board[iy][ix] == symbol) {countInLine++;} else {break;}
        }
        iy++;
    }
    if (countInLine >= 5) {return true;} else {countInLine = 0;}

    //diag2
    iy = y+1;
    for(var ix = x-1; ix > x-5; ix--) {
        if (ix >= 0 && iy >= 0 && ix < field && iy < field) {
            if (board[iy][ix] == symbol) {countInLine++;} else {break;}
        }
        iy++;
    }
    iy = y;
    for(var ix = x; ix < x+5; ix++) {
        if (ix >= 0 && iy >= 0 && ix < field && iy < field) {
            if (board[iy][ix] == symbol) {countInLine++;} else {break;}
        }
        iy--;
    }
    if (countInLine >= 5) {return true;} else {countInLine = 0;}


    return false;
}