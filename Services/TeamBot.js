
const Abstract = require('./Abstract');
TeamBot.prototype = new Abstract();

function TeamBot(team)
{
    const self = this;
    let chatBot = null;

    function onRequest(msg) {
        if (msg.previous_message) {
            return null;
        }

        self.Models.ChannelTickets.getTicket(msg.channel, msg.team).then(function(channelTicket) {
            if (channelTicket) {
                self.ZendeskService.updateTicket(channelTicket.ticketId, msg.text).then(function(){
                    //console.log('updateTicket', channelTicket.ticketId, msg.text)
                    channelTicket.latestComment = msg.text;
                    channelTicket.save();
                })
            } else {
                self.Models.TeamAccess.getByTeamId(msg.team).then(function(team){
                    self.ZendeskService.createTicket(msg.user, team.team_name, msg.text).then(function(ticketId){
                        self.Models.ChannelTickets.addTicket(msg.channel, msg.team, msg.user, ticketId, msg.text).then(function(){
                            self.Models.Settings.getByKey('thank-you-for-question-timeout').then(function(timeoutVal){
                                setTimeout(function(){
                                    self.Models.Settings.getByKey('thank-you-for-question-message').then(function(messageVal){
                                        chatBot.sendMessage(msg.channel, messageVal);
                                    }, function(err){
                                        console.error(err);
                                    })
                                }, parseInt(timeoutVal)*60)

                            }, function(err){
                                console.error(err);
                            })

                        }, function(err){
                            console.error(err);
                        })
                    })
                });
            }
        }, function(err){
            console.error(err);
        });
    }

    this.sendInstallThankYouMessage = function(msg) {
        self.Models.TeamAccess.getByTeamId(msg.team_id).then(function(team){
            if (msg.authed_users.indexOf(team.bot.bot_user_id) >=0) {
                self.Models.Settings.getByKey('install-thank-you-message').then(function(messageVal){
                    chatBot.sendMessage(msg.event.channel.id, messageVal);
                }).catch(function(err){
                    console.error(err)
                });
            }
        });
    };

    this.onResponse = function(channelTicket, ticketBody) {
        return new Promise(function(resolve, reject) {
            if (channelTicket.latestComment != ticketBody.comment) {
                chatBot.sendMessage(channelTicket.channel, ticketBody.comment);
                channelTicket.latestComment = ticketBody.comment;
            }

            switch (ticketBody.status.toLowerCase()) {
                case 'solved':
                case 'closed':
                    self.Models.Settings.getByKey('thank-you-for-question-message-final').then(function(messageVal){
                        chatBot.sendMessage(channelTicket.channel, messageVal);
                        channelTicket.delete();
                        resolve();
                    }, reject);
                    break;
                default:
                    channelTicket.save();
                    resolve();
                    break;
            }
        });
    };

    this.init = function(){
        return new Promise(function(resolve, reject) {
            chatBot = new self.Services.Bot(team);
            chatBot.onMessage = onRequest;
            //chatBot.onNewIm = sendInstallThankYouMessage;
            chatBot.init().then(resolve, reject);
        });
    }

}

module.exports = TeamBot;
