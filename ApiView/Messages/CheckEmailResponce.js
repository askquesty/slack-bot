

const Abstract = require('../Abstract');
CheckEmailResponce.prototype = new Abstract();

function CheckEmailResponce(msgOriginal)
{
    const self = this;
    const isApproved = parseInt(msgOriginal.actions[0].value);
    self.setData(msgOriginal);

    this._build = function()
    {
        return new Promise(function(resolve, reject) {
            self.Models.TeamAccess.getByTeamId(msgOriginal.team.id).then(function(teamDb){
                self.Models.Settings.getByKey('approve-email-text').then(function(messageVal){

                    let text = messageVal.replace(/@name/gi, self.slackUserCode(msgOriginal.user.id) );

                    var message = {
                        "replace_original": true,
                        attachments: [{
                            "title": text,
                            "text": isApproved ? 'Approved' : 'Canceled',
                        }],
                    };
                    self.sendApiJson(self.data.response_url, message).then(function(){
                        new self.Views.Assistants.UserInfo(msgOriginal.user.id, teamDb.access_token).build().then(function(userData) {
                            self.Models.ChannelTickets.getTicket(msgOriginal.channel.id, msgOriginal.team.id).then(function(channelTicket) {
                                channelTicket.profile = {};
                                channelTicket.profile.email = isApproved ? userData.user.profile.email : (msgOriginal.channel.id +'-'+ msgOriginal.team.id+'@askquesty.com')
                                channelTicket.profile.displayName = userData.user.profile.display_name || userData.user.profile.real_name || userData.user.profile.first_name || '';
                                channelTicket.profile.emailReal = userData.user.profile.email;
                                channelTicket.save(function (err) {
                                    if (err) return reject(err);
                                    resolve(channelTicket);
                                });
                            }, reject);
                        }).catch(reject);

                    }, reject);
                }, reject);
            }, reject);
        });
    };
}

module.exports = CheckEmailResponce;




