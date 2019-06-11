
require('dotenv').config();
const express = require('express');
const session = require('express-session')
const async = require('async');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;

// Load models
const Models = require('./Models');

// Connect to mongoose
mongoose.connect(process.env.MONGO_URI, { useCreateIndex: true, useNewUrlParser: true }).then(function () {
        console.log("Mongodb Connected...");
    })
    .catch(function(err) {
        console.error(err)
    });

// Load ApiView
const ApiViewClass = require('./ApiView');
const ApiView = ApiViewClass(Models);
mongoose.ApiView = ApiView;

// Load Services
const ServicesClass = require('./Services');
const Services = new ServicesClass(Models, ApiView);

//init Express
const app = express();
app.use(bodyParser.json());

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
}));

//init Chat Bot
ApiView.setServices(Services);

// route for main page
app.get('/', function(req, res){
    res.status(200).end('');
});

var path = require('path');
app.get('/webui', function(req, res) {
    res.sendFile(path.join(__dirname, 'webui/dist/index.html'));
});
app.use('/js', express.static('webui/dist/js'));
app.use('/css', express.static('webui/dist/css'));


const cookieParser = require('cookie-parser');
app.use(cookieParser());

// route for web api
app.post('/api', function(req, res){
    function sendResults(result){
        result.loggedIn = req.session.isLoggedIn;
        req.session.save(function(err) {
            //res.status(200).end(JSON.stringify( result ));
            res.status(200).send(JSON.stringify( result ));
        })
    }

    if (!req.session.isLoggedIn) {
        if ('login' == req.body.type) {
            Models.Settings.getByKeyArr(['admin-login', 'admin-pass']).then(function(data){
                if(data['admin-login'] == req.body.data.login && data['admin-pass'] == req.body.data.pass) {
                    req.session.isLoggedIn = true;
                    sendResults({ok:true});
                } else {
                    sendResults({ok:false});
                }
            }, function(err){
                sendResults({});
                console.error('err', err)
            });

        } else {
            sendResults({})
        }
        return null;
    }

    switch (req.body.type) {
        case 'load-data':
            Models.Settings.getByKeyArr([
                'install-thank-you-message',
                'thank-you-for-question-message-final',
                'thank-you-for-question-message',
                'thank-you-for-question-timeout',
                'admin-login',
                'admin-pass']).then(function(data){
                sendResults({settings:data});
            }, function(err){
                sendResults({});
                console.error('err', err)
            });
            break;
        case 'save-data':
            let obj = req.body.data.newData;
            if(!req.body.data.isEditCredentials) {
                obj['admin-login'] = false;
                obj['admin-pass'] = false;
            }

            Models.Settings.updateByObj(obj).then(function () {
                sendResults({});
            }, function(){
                sendResults({});
            });

            break;
    }
});

// API route for save AccessToken
app.get('/auth', function(req, res) {
    let view = new ApiView.Auth.SaveAccessToken(req.query);
    view.build().then(function(teamId) {
        res.status(200).end('ok');
    }).catch(function(err){
        console.error(err);
        res.status(500).end();
        //res.render('pages/success');
    });
});

// API route for event verification
app.post('/events', (req, res) =>{
    let view = false;
    if ('url_verification' == req.body.type) {
        view = new ApiView.Auth.Verification(req.body);
        view.build().then(function(data){
            res.status(view.statusCode).end(data);
        }).catch(function(err){
            console.error(err);
            res.status(500).end();
        });
    } else {
        if ('im_created' == req.body.event.type && TeamBots[req.body.team_id]) {
            TeamBots[req.body.team_id].sendInstallThankYouMessage(req.body)
            res.status(200).end('ok');
        } else {
            res.status(500).end();
        }
    }
});

// initiation bots ws
const TeamBots = {};
Models.TeamAccess.find({}, function (err, teams) {
    async.eachOfLimit(teams, 20, function(team, iteration, cb) {
        TeamBots[team.team_id] = new Services.TeamBot(team);
        TeamBots[team.team_id].init().then(function(){
            cb();

        }, function(err){
            console.error('Bot Initiation Error', err);
            cb();
        });

    }, function() {
        console.error('Bots Initiated');
    });
});

// route for zendesk events
app.post('/zendesk', function(req, res){
    Models.ChannelTickets.getTicketById(req.body.ticket_id).then(function(channelTicket) {
        if (!channelTicket || ! TeamBots[channelTicket.team]) {
            return null;
        }
        TeamBots[channelTicket.team].onResponse(channelTicket, req.body).then(function(){}, function(err){
            console.error(err);
        });
    });
    res.status(200).end('{"status":"ok"}');
});

//apply http listener
app.listen(process.env.HTTP_LISTEN_PORT, function(){
    console.log('http listener running on', process.env.HTTP_LISTEN_PORT);
});


