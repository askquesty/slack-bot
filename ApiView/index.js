
const views = {
    Auth:{
        SaveAccessToken:require('./Auth/SaveAccessToken'),
        Verification:require('./Auth/Verification'),
    },
    Messages:{
        CheckEmail:require('./Messages/CheckEmail'),
        CheckEmailResponce:require('./Messages/CheckEmailResponce'),
    },
    Assistants:{
        BotWss:require('./Assistants/BotWss'),
        UserInfo:require('./Assistants/UserInfo'),
    },
    setServices: function(services){
        Abstract.prototype.Services = services;
    },
};

const Abstract = require('./Abstract');

module.exports = function(models){
    Abstract.prototype.Models = models;
    Abstract.prototype.Views = views;
    for(let iName in views.Intents) {
        views.Intents[iName].prototype.intentName = iName;
    }
    return views;
};

