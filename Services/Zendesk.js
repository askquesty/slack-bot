
const ZendeskNodeApi = require('zendesk-node-api');
const Abstract = require('./Abstract');
Zendesk.prototype = new Abstract();


function Zendesk()
{
    const zendesk = new ZendeskNodeApi({
        url:   process.env.ZENDESK_URL,
        token: process.env.ZENDESK_API_TOKEN,
        //oauth: true,
        email: 'gooody29@gmail.com',
    });

    this.createTicket = function(name, workspace, text) {
        return new Promise(function(resolve, reject) {
            zendesk.tickets.create({
                //subject:'Form:'+name+', Workspace:'+workspace,
                subject:'Form: '+workspace,
                priority:'urgent',
                tags:[workspace],
                type:'question',
                //status:'open',
                status:'new',
                comment: {
                    body: text
                }
            }).then(function(result){
                resolve(result.ticket.id);
            });
        });
    };

    this.updateTicket = function(id, text) {
        return new Promise(function(resolve, reject) {
            zendesk.tickets.update(id, {
                comment: {
                    body: text
                }
            }).then(function(result){
                resolve(result.ticket.id);
            });
        });
    };





}

module.exports = Zendesk;
