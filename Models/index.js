const mongoose = require('mongoose');

let models = {
    ChannelTickets:require('./ChannelTickets'),
    TeamAccess:require('./TeamAccess'),
    Settings:require('./Settings'),
    //Profile:require('./Profile'),
};

mongoose.Models = models;
module.exports = models;

