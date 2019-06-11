
const Abstract = require('../Abstract');
BotWss.prototype = new Abstract();

function BotWss()
{
    let self = this;
    this._build = function()
    {
        return new Promise(function(resolve, reject) {
            self.sendApi('rtm.connect', {
                token:self.team.bot.bot_access_token,
            }).then((result) => {
                //console.log('result.data', Object.keys(result.data), result.data.self.id);
                resolve(result.data);
            }).catch(reject);
        });
    };
}

module.exports = BotWss;
