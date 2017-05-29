exports.insert = function user_insert(db, data, callback) {
    db.query('INSERT INTO users (login, pass, email) VALUES (' + db.escape(data.login) + ', ' + db.escape(data.pass) + ', ' + db.escape(data.mail) + ')', function(){
        callback(true);
    });    
}

exports.auth = function user_auth(db, data, callback) {
    db.query('select * from users where login = ' + db.escape(data.login) + ' AND pass = ' + db.escape(data.pass), function(err, rows) {
        if(err) throw err;
        var valid = false;
        for(row in rows){
            if(row !== null){
                callback(true, rows[0]);    
                valid = true;
            }
        }
        if (!valid) {callback(false, null);}
    }); 
}

exports.valid_reg = function user_valid_reg(db, data, callback) {
    db.query('select * from users where login = ' + db.escape(data.login), function(err, rows) {
        if(err) throw err;
        var valid = true;
        var errorMessage = '';
        for(row in rows){
            if(row !== null){
                valid = false; 
                errorMessage += "Такой пользователь уже существует. ";
                callback(false, errorMessage);
            }
        }
    
        if (data.login == "") {valid = false; errorMessage += "Введите логин. ";}
        if (data.pass == "") {valid = false; errorMessage += "Введите пароль. ";}
        if (data.mail == "") {valid = false; errorMessage += "Введите email. ";}
        if( valid ){
            callback(true, '');
        } else {
            callback(false, errorMessage);
        }
    });
}