// функция генерации стоки из случайной последовательности символов
exports.str_rand = function str_rand(length) {
    var result       = '';
    var words        = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    var max_position = words.length - 1;
        for( i = 0; i < length; ++i ) {
            position = Math.floor ( Math.random() * max_position );
            result = result + words.substring(position, position + 1);
        }
    return result;
}

exports.in_array = function in_array(value, array){
    for(var i = 0; i < array.length; i++) {
        if(array[i] == value) return true;
    }
    return false;
}