
const axios = require('axios');
const request = require('request');
const qs = require('querystring');

function Abstract() { }
Abstract.prototype.statusCode = 200;
Abstract.prototype._build = function(){ return new Promise(function(resolve, reject) { resolve(); }); };
Abstract.prototype.build = function() {
    let self = this;
    return self._build();
};

Abstract.prototype.setData = function(data){
    this.data = data;
    return this;
};

Abstract.prototype.setTeam = function(_team){
    this.team = _team;
    return this;
};

Abstract.prototype.setWitResponse = function(witResponse) {
    this.witResponse = witResponse;
    return this;
};

Abstract.prototype.setSession = function(session) {
    this.session = session;
    return this;
};

Abstract.prototype.getSession = function() {
    return this.session;
};

Abstract.prototype.sendApi = function(url, message) {
    let self = this;
    return new Promise(function(resolve, reject) {
        let postUrl = 'http' == url.substr(0, 4) ? url : `https://slack.com/api/${url}`;
        if (!message.token) {
            message.token = 'chat.postMessage' == url ? process.env.SLACK_BOT_ACCESS_TOKEN : process.env.SLACK_ACCESS_TOKEN;
        }
        axios.post(postUrl, qs.stringify(message)).then(resolve).catch(reject);
    });
};

Abstract.prototype.sendApiJson = function(url, jsonMessage) {
    return new Promise(function(resolve, reject) {
        let postUrl = 'http' == url.substr(0, 4) ? url : `https://slack.com/api/${url}`;
        var postOptions = {
            uri: postUrl,
            method: 'POST',
            headers: { 'Content-type': 'application/json; charset=utf-8' },
            json: jsonMessage
        };

        request(postOptions, (error, response, body) => {
            if (error){
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
};


Abstract.prototype.send = function(msg, attachments){
    let self = this;
    return new Promise(function(resolve, reject) {
        let message = msg;
        if ('string' == typeof msg ) {
            message = { "text": msg };
        }

        if (attachments) {
            message.attachments = JSON.stringify(attachments)
        }

        if (self.data && self.data.response_url) {
            message.replace_original = true;
            self.sendApiJson(self.data.response_url, message).then((result) => {
                resolve('');
            }).catch(reject);
        } else {

            let sendMessage = function(_ch){
                message.channel = _ch;
                self.sendApi('chat.postMessage', message).then((result) => {
                    if (result.data.ok) {
                        resolve('');
                        return;
                    }
                    console.log( 'message', message );
                    console.error(result.data);
                }).catch(reject);
            };

            sendMessage(message.channel || self.data.channel);
        }
    });
};

Abstract.prototype.sendWarning = function(msg){
    let message = msg;
    if ('string' == typeof msg ) {
        message = { "text": msg };
    }
    message.color = "#ff9d0a";
    return this.send('Error!', [message]);
};

Abstract.prototype.sendError = function(msg){
    let message = msg;
    if ('string' == typeof msg ) {
        message = { "text": msg };
    }
    message.color = "#f45c42";
    return this.send('Error!', [message]);
};

Abstract.prototype.inviteUser = function(userId, channel) {
    let self = this;
    return new Promise(function(resolve, reject) {
        self.sendApi('channels.invite', {
            channel: channel,
            user: userId
        }).then(resolve, reject);
    });
};

Abstract.prototype.slackChannelCode = function(channel){
    return "<#"+channel+">";
};

Abstract.prototype.slackUserCode = function(user){
    return user ? ('@' == user.substr(0, 1) ? "<"+user+">" : "<@"+user+">") : '';
};

module.exports = Abstract;

