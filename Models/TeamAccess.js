const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema TeamAccess
const TeamAccessSchema = new Schema({
    team_id: {
        type: String,
        required: true,
        unique: true
    },
    access_token: {
        type: String,
        required: false
    },
    user_id: {
        type: String,
        required: false
    },
    team_name: {
        type: String,
        required: false
    },
    bot: {
        type: Object,
        required: true
    }
});

const model = mongoose.model('teamAccess', TeamAccessSchema, 'teamAccess');

model.getByTeamId = function (teamId) {
    return new Promise(function(resolve, reject) {
        model.findOne({ team_id: teamId }, function (err, team) {
            if (err) {
                reject(err);
                return null;
            }
            resolve(team);
        });
    });
};

module.exports = model;
