
const services = {
    Bot:require('./Bot'),
    TeamBot:require('./TeamBot'),
    Zendesk:require('./Zendesk'),
};

const Abstract = require('./Abstract');

module.exports = function(models, views){
    Abstract.prototype.Models = models;
    Abstract.prototype.Views = views;
    Abstract.prototype.Services = services;
    Abstract.prototype.ZendeskService = new services.Zendesk();
    return services;
};


