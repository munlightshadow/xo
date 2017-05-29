var md5 = require('md5');
var func = require('./function.js');
var config = require('config.json')('./config.json');

//conf.token.token_life_time - время жизни токена. Посл чего запрашивается рефреш токен
//conf.token.token_refresh_life_time - время жизни рефреш токена. После чего необходима авторизация
const REFRESH_EMIT = 'tokenRefresh'; //запрос у клиента рефреш токена
const GET_REFRESH_ON = 'getTokenRefresh'; //получкние от клиента рефреш токен
const UPDATE_TOKEN_EMIT = 'tokenUpdate'; //передача клиенту обновленного токена


/*
 * Формирование токена. Функция вызывается при авторизации пользователя. Токен и рефреш токен формируется на основе
 * таймштампа + случайной строки символов с использованием md5. Токен отправляется пользователю. Так же сохраняется ip
 * с которого была произведена авторизация. 
*/
exports.create = function create_token(db, gameSocket, user_id) {
    var token = [];
    // token['ip'] = gameSocket.handshake.address.address + ':' + gameSocket.handshake.address.port;    
    // token['ip'] = gameSocket.handshake.address;    
    token['ip'] = 'no_checked';
    token['token'] = md5(Date.now() + func.str_rand(8));
    token['full_token'] = md5(token['token'] + token['ip']);
    token['token_refresh'] = md5(func.str_rand(15) + Date.now());
    // token['create_token'] = Date.now();
    // token['create_refresh'] = Date.now();
  
    db.query('INSERT INTO token (user_id, token, refresh_token, ip, full_token, create_token, create_refresh) \
    					VALUES (' + db.escape(user_id) + ', ' 
    							+ db.escape(token['token']) + ', '
    							+ db.escape(token['token_refresh']) + ', '
    							+ db.escape(token['ip']) + ', '
    							+ db.escape(token['full_token']) + ', '
    							+ 'NOW(), '
		    					+ 'NOW()' + ')');         
    return token;
}

/*
 * Проверка токена вызывается каждый раз когда приходит запрос на сервер. Проверка происходит на основе токена и ip которые приходят от клиента.
 * если в базе есть совпадение, то проверяется не истек ли срок действия токена. И возвращается ошибка либо подтверждение.
*/
exports.check = function check_token(db, gameSocket, io, token, callback) {
    // var ip = gameSocket.handshake.address.address + ':' + gameSocket.handshake.address.port;    
    // var ip = gameSocket.handshake.address;    
    var ip = 'no_checked';
    var full_token = md5(token + ip);
  
    db.query('SELECT user_id, UNIX_TIMESTAMP(create_token) as token_time FROM token WHERE full_token = ' + db.escape(full_token), function(err, rows) {
        if(err) throw err;

        var token_bd = rows[0];

        if( token_bd != null ){
            if (Date.now() - (token_bd.token_time * 1000) > config.token.token_life_time * 1000){
                console.log('!!!!!!!!!!!!!!!!!TIME_OUT_TOKEN!!!!!!!!!!!!!!!!!!!');
                callback(false, 'TIME_OUT_TOKEN'); // время действие токена истекло            
            } else {
                callback(true, 'TOKEN_CORRECT'); // токен подтвержден                
            }
        } else {            
            console.log('!!!!!!!!!!!!!!!!!!!!NOT_ISSET_TOKEN!!!!!!!!!!!!!!!!!');
            callback(false, 'NOT_ISSET_TOKEN'); // токена не существует
        }

    }); 
}

/*
 * Обновленеи токена на основе присланного рефреш токена. Работает так же как и с токеном, за исключением чтого что если все в порядке, отправляется новый токен.
*/
exports.refresh = function refresh_token(db, gameSocket, io, refresh_token, callback) {
    // var ip = gameSocket.handshake.address.address + ':' + gameSocket.handshake.address.port;
    // var ip = gameSocket.handshake.address;    
    var ip = 'no_checked';
    db.query('SELECT user_id, refresh_token, UNIX_TIMESTAMP(create_refresh) as token_refresh_time FROM token WHERE refresh_token = ' + db.escape(refresh_token) + ' AND ip = ' + db.escape(ip), function(err, rows) {
        if(err) throw err;
        var token_bd = rows[0];

        if(token_bd != null) {
            if (Date.now() - (token_bd.token_refresh_time * 1000) < config.token.token_refresh_life_time * 1000){ 
                var token = [];
                token['ip'] = ip;
                token['token'] = md5(Date.now() + func.str_rand(8));
                token['full_token'] = md5(token['token'] + token['ip']);    
  
                db.query('UPDATE token SET token='+ db.escape(token['token']) + 
                                        ', full_token = '+ db.escape(token['full_token']) + 
                                        ', create_token = ' + 'NOW()' + ' WHERE refresh_token = ' + db.escape(refresh_token) + ' AND ip = ' + db.escape(ip)); 

                callback(true, token['token']);
            } else {
                callback(false, 'TIME_OUT_REFRESH_TOKEN');
            }
        } else {
            callback(false, 'NOT_ISSET_REFRESH_TOKEN');
        }
    });         
}


exports.delete_token = function user_logout(db, data, callback) {
    db.query('DELETE FROM token WHERE token = ' + db.escape(data.token), function(err, rows) {
        callback(true);
    }); 
}
