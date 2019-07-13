
const async = require('async');
const ZendeskNodeApi = require('zendesk-node-api');
const Abstract = require('./Abstract');
Zendesk.prototype = new Abstract();


function Zendesk()
{
    const self = this;
    const zendesk = new ZendeskNodeApi({
        url:   process.env.ZENDESK_URL,
        token: process.env.ZENDESK_API_TOKEN,
        //oauth: true,
        email: process.env.ZENDESK_API_EMAIL,
    });

    this.createTicket = function(channelTicket, workspace) {
        return new Promise(function(resolve, reject) {
            zendesk.tickets.create({
                subject:'Form: '+workspace,
                priority:'urgent',
                tags:[workspace],
                type:'question',
                //status:'open',
                status:'new',
                requester: {
                    name: channelTicket.profile.displayName,
                    email: channelTicket.profile.email
                },
                comment: {
                    body: channelTicket.initComments[0]
                }
            }).then(function(result){
                channelTicket.ticketId = result.ticket.id;
                channelTicket.profile.requesterId = result.ticket.requester_id;
                channelTicket.save();
                async.eachOfLimit(channelTicket.initComments, 1, function(text, iteration, cb) {
                    if (!iteration) {
                        cb();
                        return null;
                    }

                    self.updateTicket(channelTicket.ticketId, text, channelTicket.profile).then(cb, function(err){
                        console.error('CreateTicket Err', err);
                        cb();
                    });
                }, function() {
                    resolve(channelTicket.ticketId);
                    //console.log('createTicket', result.ticket.id);
                });

            });
        });
    };

    this.updateTicket = function(id, text, profile) {
        return new Promise(function(resolve, reject) {
            zendesk.tickets.update(id, {
                comment: {
                    body: text,
                    author_id: profile.requesterId
                },
            }).then(function(result){
                resolve(result.ticket.id);
                //console.log('updateTicket', result.ticket.id);
            });
        });
    };
}

module.exports = Zendesk;
