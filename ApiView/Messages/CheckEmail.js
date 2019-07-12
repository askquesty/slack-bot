

const Abstract = require('../Abstract');
CheckEmail.prototype = new Abstract();

function CheckEmail(msgOriginal, team)
{
    let self = this;
    this._build = function()
    {
        return new Promise(function(resolve, reject) {
            self.Models.Settings.getByKey('approve-email-text').then(function(messageVal){
                let text = messageVal.replace(/@name/gi, self.slackUserCode(msgOriginal.user) );

                self.send({
                        token: team.access_token,
                        channel: msgOriginal.channel,
                    }, [{
                        "title": text,
                        "callback_id": "email-approve",
                        "color": "#3AA3E3",
                        "attachment_type": "default",
                        "actions": [
                            {
                                "name": "approve",
                                "text": "Approve",
                                "type": "button",
                                "value": "1"
                            }, {
                                "name": "cancel",
                                "text": "Cancel",
                                "style": "danger",
                                "type": "button",
                                "value": "0",
                                "confirm": {
                                    "title": "Are you sure?",
                                    "ok_text": "Yes",
                                    "dismiss_text": "No"
                                }
                            }
                        ]
                    }]
                ).then(resolve, reject);

            }, function(err){
                console.error(err);
            });
        });
    };
}

module.exports = CheckEmail;




