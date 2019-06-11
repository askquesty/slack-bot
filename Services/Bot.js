
const Ws = require('ws');
const Abstract = require('./Abstract');
Bot.prototype = new Abstract();

function Bot(team)
{
    const self = this;
    let wssCred = null;
    let botRtm = null;
    let lastPong = 0;
    let pingTimeoutId = null;
    let botChannels = {};

    function newMessageProcessing(messageData) {

        //console.log('001', messageData);
        //console.log('002', 'im_created' == messageData.type);

        switch (true) {
            case 'message' == messageData.type:
                self.onMessage(messageData);
                break;
            //case 'im_created' == messageData.type:
            //    self.onNewIm(messageData);
            //    break;
        }
    }

    function startRTM() {
        botRtm = new Ws(wssCred.url, null, {});
        initEvents()
    }

    function reconnect(err) {
        console.log('Connection Error', err);
        console.log('Reconnecting...');
        setTimeout(function(){
            self.init().then(function(){
                console.log('Bot Connected...');
            },function(err){
                console.error('Bot Initiation Error', err);
            });
        }, 30000);
    }

    function closeRTM(err) {
        if (botRtm) {
            botRtm.removeAllListeners();
            botRtm.close();
        }

        if (pingTimeoutId) {
            clearTimeout(pingTimeoutId);
        }

        if (err) {
            reconnect(err);
        }
    }

    function initEvents() {
        botRtm.on('pong', function() {
            lastPong = Date.now();
        });

        botRtm.on('open', function() {
            var pinger = function() {
                var pongTimeout = 12000;
                if (lastPong && lastPong + pongTimeout < Date.now()) {
                    var err = new Error('Stale RTM connection, closing RTM');
                    closeRTM(err);
                    clearTimeout(pingTimeoutId);
                    return;
                }
                botRtm.ping();
                pingTimeoutId = setTimeout(pinger, 10000);
            };
            pingTimeoutId = setTimeout(pinger, 10000);

            botRtm.on('message', function(data) {
                // Distinguish between empty data and malformed JSON
                if (!data || data.trim() === '') {
                    console.warn('** RECEIVED EMPTY DATA FROM SLACK:', data);
                    return;
                }
                var message = null;
                try {
                    message = JSON.parse(data);
                } catch (err) {
                    console.error('** RECEIVED BAD JSON FROM SLACK:', data);
                }

                if (message != null) {
                    //console.log('!!!!', message);
                    newMessageProcessing(message);
                }
            });
        });

        botRtm.on('error', function(err) {
            console.error('Bot Error', err);
        });

        botRtm.on('close', function(code, message) {
            console.log('RTM close event: ' + code + ' : ' + message);
            if (pingTimeoutId) {
                clearTimeout(pingTimeoutId);
            }

            /**
             * CLOSE_ABNORMAL error
             * wasn't closed explicitly, should attempt to reconnect
             */
            if (code === 1006) {
                console.log('Abnormal websocket close event, attempting to reconnect');
                reconnect();
            }
        });
    }

    this.sendMessage = function(channel, text) {
        return new Promise(function(resolve, reject) {
            let msg = {
                "type": "message",
                "channel": channel,
                "text": text,
            };

            botRtm.send( JSON.stringify(msg), function(err){
                if(err) {
                    reject(err);
                    return null;
                }
                resolve();
            } );
        });
    };

    this.init = function() {
        wssCred = null;
        botRtm = null;
        lastPong = 0;
        pingTimeoutId = null;
        botChannels = {};

        return new Promise(function(resolve, reject) {
            let BotWssView = new self.Views.Assistants.BotWss().setTeam(team);
            BotWssView.build().then(function(_wssCred) {
                try {
                    wssCred = _wssCred;
                    startRTM();
                    resolve();
                } catch(e) {
                    reject(e)
                }
            }).catch(reject);
        });
    }
}

module.exports = Bot;
