module.exports.getString = function (search, data) {
    var type = "StrProperty";
    data = new Buffer(data);
    var bytes1 = data.indexOf(search);
    if(bytes1 == -1)
    {
        return false;
    }
    var bytes2 = data.indexOf(type, bytes1);
    var num = bytes2;
    var mid = data.readUInt8(num + type.length + 1, true);
    var midlength = mid - (num + type.length + 12 == 255 ? 6 : 5);
    var start = num + type.length + 13;
    var dt = data.toString('utf8', start, start + midlength);

    return dt;
};

module.exports.getInt = function (search, data) {
    var type = "IntProperty";
    data = new Buffer(data);
    var bytes1 = data.indexOf(search);
    if(bytes1 == -1)
    {
        return false;
    }
    var bytes2 = data.indexOf(type, bytes1);
    var end = bytes2 + type.length + 9;
    var dt = data.readUIntLE(end, 4);

    return dt;
};

module.exports.getUInt16 = function (search, data) {
    var type = "UInt16Property";
    data = new Buffer(data);
    var bytes1 = data.indexOf(search);
    if(bytes1 == -1)
    {
        return false;
    }
    var bytes2 = data.indexOf(type, bytes1);
    var end = bytes2 + type.length + 9;
    var dt = data.readUInt16LE(end, true);

    return dt;
};

module.exports.getUInt32 = function (search, data) {
    var type = "UInt32Property";
    data = new Buffer(data);
    var bytes1 = data.indexOf(search);
    if(bytes1 == -1)
    {
        return false;
    }
    var bytes2 = data.indexOf(type, bytes1);
    var end = bytes2 + type.length + 9;
    var dt = data.readUInt32LE(end, true);

    return dt;
};

module.exports.getUInt64 = function (search, data) {
    var type = "UInt64Property";
    data = new Buffer(data);
    var bytes1 = data.indexOf(search);
    if(bytes1 == -1)
    {
        return false;
    }
    var bytes2 = data.indexOf(type, bytes1);
    var end = bytes2 + type.length + 9;
    var dt = data.readUInt32LE(end, true);

    return dt;
};
