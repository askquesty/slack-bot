

const Abstract = require('../Abstract');
Verification.prototype = new Abstract();

function Verification(body)
{
    this._build = function()
    {
        return new Promise(function(resolve, reject) {
            console.log('Verification');
            resolve(body.challenge);
        });
    };
}

module.exports = Verification;



