
const ZendeskNodeApi = require('zendesk-node-api');
const Abstract = require('./Abstract');
Zendesk.prototype = new Abstract();


function Zendesk()
{
    const zendesk = new ZendeskNodeApi({
        url:   process.env.ZENDESK_URL,
        token: process.env.ZENDESK_API_TOKEN,
        //oauth: true,
        email: process.env.ZENDESK_API_EMAIL,
    });

    this.createTicket = function(name, workspace, text, profile) {
        return new Promise(function(resolve, reject) {
            zendesk.tickets.create({
                subject:'Form: '+workspace,
                priority:'urgent',
                tags:[workspace],
                type:'question',
                //status:'open',
                status:'new',
                requester: { name: profile.display_name, email: profile.email },
                comment: {
                    body: text
                }
            }).then(function(result){
                resolve(result.ticket.id);
                //console.log('createTicket', result.ticket.id);
            });
        });
    };

    this.updateTicket = function(id, text, profile) {
        return new Promise(function(resolve, reject) {
            zendesk.tickets.update(id, {
                comment: {
                    body: text
                }
            }).then(function(result){
                resolve(result.ticket.id);
                //console.log('updateTicket', result.ticket.id);
            });
        });
    };
}

module.exports = Zendesk;
