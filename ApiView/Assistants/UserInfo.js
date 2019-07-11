
const Abstract = require('../Abstract');
UserInfo.prototype = new Abstract();

function UserInfo(userId, token)
{
    let self = this;
    this._build = function()
    {
        return new Promise(function(resolve, reject) {
            self.sendApi('users.info', {
                token: token,
                user: userId,
            }).then((result) => {
                //console.log('users.info', userId, result);
                resolve(result.data);
            }).catch(reject);
        });
    };
}

module.exports = UserInfo;
