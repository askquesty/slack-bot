
const Abstract = require('../Abstract');
SaveAccessToken.prototype = new Abstract();

function SaveAccessToken(body)
{
    let self = this;
    let teamId = null;

    this.getTeamId = function() {
        return teamId;
    };

    this._build = function()
    {
        return new Promise(function(resolve, reject) {
            if (!body || !body.code) {
                self.statusCode = 403;
                reject();
                return;
            }
            var data = {form: {
                client_id: process.env.SLACK_CLIENT_ID,
                client_secret: process.env.SLACK_CLIENT_SECRET,
                code: body.code
            }};

            self.sendApi('oauth.access', data.form).then(function(body) {
                // get team info
                let team = body.data;

                if(!team.team_id) {
                    reject('team_id does not exists');
                }

                console.log('Save AccessToken for', team.team_name);
                self.Models.TeamAccess.updateOne({
                    team_id: team.team_id
                }, {
                    team_id: team.team_id,
                    access_token:team.access_token,
                    user_id:team.user_id,
                    team_name:team.team_name,
                    bot:team.bot,
                }, {upsert: true}, function (err) {
                    if (err) {
                        reject(err);
                    }
                    teamId = team.team_id;
                    resolve(teamId);
                });
            }).catch(reject);
        });
    };
}

module.exports = SaveAccessToken;
