const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema Profile
const ProfileSchema = new Schema({
    team: {
        type: String,
        required: true,
        index: true
    },
    user: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
    },
    displayName: {
        type: String,
    },
    emailReal: {
        type: String,
    },
});

const model = mongoose.model('Profiles', ProfileSchema, 'Profiles');

model.getProfile = function (teamId, userId) {
    return new Promise(function(resolve, reject) {
        model.findOne({ team: teamId, user: userId }, function (err, team) {
            if (err) {
                reject(err);
                return null;
            }
            resolve(team);
        });
    });
};
model.saveProfileFromTicket  = function(ticket) {
    return new Promise(function(resolve, reject) {
        model.updateOne({
            team:           ticket.team,
            user:           ticket.user,
        },{
            team:           ticket.team,
            user:           ticket.user,
            email:          ticket.profile.email,
            displayName:    ticket.profile.displayName,
            emailReal:      ticket.profile.emailReal,
        },{
            upsert: true
        }, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};

module.exports = model;
