const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema TeamAccess
const ChannelTickets = new Schema({
    channel: {
        type: String,
        required: true,
        index: true
    },
    team: {
        type: String,
        required: true,
        index: true
    },
    user: {
        type: String,
    },
    ticketId: {
        type: String,
        required: false,
        index: true
    },
    latestComment: {
        type: String,
    }
});

const model = mongoose.model('channelTickets', ChannelTickets, 'channelTickets');

model.getTicketById = function (id) {
    return new Promise(function(resolve, reject) {
        model.findOne({ ticketId: id }, function (err, ct) {
            if (err) {
                reject(err);
                return null;
            }
            resolve(ct);
        });
    });
};

model.getTicket = function (channel, team) {
    return new Promise(function(resolve, reject) {
        model.findOne({ channel: channel, team:team }, function (err, ct) {
            if (err) {
                reject(err);
                return null;
            }
            resolve(ct);
        });
    });
};

model.addTicket = function (channel, team, user, ticketId, comment) {
    return new Promise(function(resolve, reject) {
        model.updateOne({
            channel: channel,
            team:team,
        },{
            channel: channel,
            team:team,
            user:user,
            ticketId:ticketId,
            latestComment:comment,
        },{
            upsert: true
        }, function (err, ct) {
            if (err) {
                reject(err);
                return null;
            }
            resolve(ct);
        });
    });
};

module.exports = model;
