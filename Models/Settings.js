const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const async = require('async');

// Create Schema TeamAccess
const Settings = new Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: String,
        required: false
    }
});

const model = mongoose.model('settings', Settings, 'settings');

model.getByKey = function (key) {
    return new Promise(function(resolve, reject) {
        model.findOne({ key: key }, function (err, stt) {
            if (err) {
                reject(err);
                return null;
            }
            resolve(stt ? stt.value : null);
        });
    });
};
model.getByKeyArr = function (keyArr) {
    return new Promise(function(resolve, reject) {
        model.find({ key: {$in:keyArr} }, function (err, sttArr) {
            if (err) {
                reject(err);
                return null;
            }

            let results = {}
            for (let i in sttArr) {
                results[sttArr[i].key] = sttArr[i].value;
            }

            resolve(results);
        });
    });
};
model.updateByObj = function (obj) {
    return new Promise(function(resolve, reject) {
        async.eachOfLimit(obj, 20, function(value, key, cb) {
            if (!value) {
                cb();
                return null
            }

            model.updateOne({
                key: key,
            },{
                value:value,
            },{
                upsert: true
            }, function (err, ct) {
                if (err) {
                    reject(err);
                }
                cb();
            });
        }, function() {
            resolve();
        });
    });
};

module.exports = model;
