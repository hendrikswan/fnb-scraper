var request     = require('request');
var cheerio     = require('cheerio');
var stdio       = require('stdio');
var https       = require('https');
var querystring = require('querystring');
var zlib        = require('zlib');
var _           = require('underscore');
var Q           = require('q');

var tunnel = require('tunnel');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var tunnelingAgent = tunnel.httpsOverHttp({
  proxy: {
    host: 'localhost',
    port: 8888
  }
});


var cred_options = stdio.getopt({
    'username': {
        key: 'u',
        mandatory: true,
        args: 1
    },
    'password': {
        key: 'p',
        mandatory: true,
        args: 1
    },
});

var cookie = '';
var cookie_obj = {
    'JSESSIONID': []
};


function getCookieFromResponse(res){
    var set_cookie = res.headers['set-cookie'];
    if(!set_cookie){
        return cookie;
    }
    set_cookie.forEach(function(set_val){
        var cookie_assignment =  set_val.split(';')[0];
        var cookie_key =  cookie_assignment.split('=')[0];
        var cookie_val =  cookie_assignment.split('=')[1];


        if(cookie_key === 'JSESSIONID'){
            if(cookie_obj['JSESSIONID'].indexOf(cookie_val) > -1) {
                return;;
            }

            cookie_obj['JSESSIONID'].push(cookie_val);
            return;
        }

        //this cookie already up to date in cookie_obj
        if(cookie_obj[cookie_key] && cookie_obj[cookie_key] == cookie_val){
            return;
        }

        cookie_obj[cookie_key] = cookie_val;

    });

    cookie = '';
    for(var cookie_key in cookie_obj){
        var cookie_val = cookie_obj[cookie_key];
        if(cookie_key=='JSESSIONID'){
            for(var i=0;i<cookie_val.length;i++){
                cookie+=cookie_key + '=' + cookie_val[i] + ';';
            }
        }else{
            cookie+=cookie_key + '=' + cookie_val + ';';
        }
    }

    return cookie;
}

function parseAndSaveCookie(res){
    cookie = getCookieFromResponse(res);
}


function logonToFNB(cb){
    var post_data = querystring.stringify({
        multipleSubmit: 1,
        url: 0,
        country: 15,
        countryCode: 'ZA',
        language: 'en',
        BrowserType: undefined,
        BrowserVersion: undefined,
        OperatingSystem: undefined,
        action: 'login',
        formname: 'LOGIN_FORM',
        form: 'LOGIN_FORM',
        LoginButton: 'Login',
        homePageLogin: 'true',
        division: '',
        products: '',
        bankingUrl: 'https://www.online.fnb.co.za',
        nav: 'navigator.UserLogon',
        Username: cred_options.username,
        Password: cred_options.password
    });


//'JSESSIONID=-IE5vcJIVs4hHZ9LQVE9KfVw; persistentBANKit=1750297499469457763; X-Mapping-bdbobhah=F82CC4CAAB1E575DB4F9786B517E4DF8; X-Mapping-ddbhoaei=D1CA6C4735B2EA49A147568B91A8F300; X-Mapping-pagknoff=02E8E6889FCF834D85FB521186945AC1; JSESSIONID=-EEBZmb0fuQ4rbT7Gmh4Usqa; zobCookie=true; _em_hl=1; _em_vt=3b0592df3e9ad083b00afeab83f0534cf900867bb5-7902401153745403; __utmd=1; __utma=169205494.1603123425.1399635550.1400131325.1400132611.6; __utmb=169205494.1.9.1400135560136; __utmc=169205494; __utmz=169205494.1399635550.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)'

    // 'www.online.fnb.co.za/login/Controller

    // An object of options to indicate where to post to
    var post_options = {
        host: 'www.online.fnb.co.za',
        port: '443',
        agent: tunnelingAgent,
        path: '/login/Controller',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length,
            'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36',
            'accept-encoding': 'gzip',
            'cookie': cookie
        }
    };

    var post_req = https.request(post_options, function(res) {
        res.pipe(zlib.createGunzip()).on('data', function(chunk) {
            $ = cheerio.load('' + chunk);
            var redirect_form = $("#result_login input");

            var form_object = {};
            for (var key in redirect_form) {
              if (redirect_form.hasOwnProperty(key)) {
                var attribs = redirect_form[key].attribs;
                if(attribs){
                    form_object[attribs.name] = attribs.value;
                }
              }
            }

            _.extend(form_object, {
                genericApplet   :0,
                form            :'LOGIN_FORM',
                multipleSubmit  :1,
                simple          :true,
                countryCode     :'ZA',
                homePageLogin   :true,
                url             :0,
                skin            :0,
                country         :15,
                division        :'',
                fromLogin       :true,
                LoginButton     :'Login',
                action          :'login',
                nav             :'navigator.UserLogon',
                bankingUrl      :'https://www.online.fnb.co.za',
                language        :'en',
                formname        :'LOGIN_FORM',
                products        :'',
                datasource      :101,
                OperatingSystem :'MacIntel',
                BrowserType     :'Chrome',
                BrowserVersion  :'34.0.1847.137 Safari/537.36',
                BrowserHeight   :0,
                BrowserWidth    :0,
                isMobile        :false
            });

            parseAndSaveCookie(res);
            var qs = querystring.stringify(form_object);
            var result = {
                querystring: qs
            }
            // console.log(qs);
            cb(null, result);
        });

        // res.on('end', function(){

        // });

        res.on('error', function(err) {
            console.log(err);
            return cb(err);
        })
    });

    post_req.write(post_data);
    post_req.end();
}



        agent: tunnelingAgent,
        agent: tunnelingAgent,

function hitPage(args, cb){

    var host = args.host || 'www.online.fnb.co.za';
    var path = args.path || '/';
    var log  = args.log  || false;
    var method = args.method || 'POST';

    var options = {
        host: host,
        port: '443',
        agent: tunnelingAgent,
        path: path,
        method: method,
 	agent: tunnelingAgent,
        headers: {
            'cookie': cookie,
            'Host' :   host,
            'Connection' : 'keep-alive',
            'Content-Length' : 0,
            'Accept' :  'text/html, */*; q=0.01',
            'Origin' : host,
            'X-Requested-With' :   'XMLHttpRequest',
            'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36',
            'Referer' : 'https://www.online.fnb.co.za/banking/main.jsp',
            'Accept-Encoding' : 'gzip,deflate,sdch',
            'Accept-Language' : 'en-US,en;q=0.8'
        }
    };

    if(args.content_type){
        options.headers['Content-Type'] = args.content_type;
    }

    var gunzip = zlib.createGunzip();



    // Set up the request
    var req = https.request(options)
    .on('response', function(res){
        parseAndSaveCookie(res);
        var buffer = '';

        gunzip.on('data', function(chunk) {
            buffer+= chunk;
        });

        gunzip.on('end', function(){
            if(log){
                console.log('===========================================');
                console.log('path: ', path);
                console.log('response: ', buffer);
                console.log('cookie: ', cookie);
                console.log('===========================================');
            }

            cb(null, buffer);
        });

        gunzip.on('error', function(err) {
            console.log(err);
            return cb(err);
        });

        res.pipe(gunzip);
    })
    .end();
}

function hitHomePage(cb)
{
    hitPage({host: 'www.fnb.co.za', path:'/', method: 'GET', log:false}, cb);
}

function redirectAfterLogon(logon_result, cb){
    hitPage({path: '/banking/Controller?' + logon_result.querystring, method: 'GET'}, cb);
}

function getBankAccountLinks(cb){
    hitPage({
        path: '/banking/Controller?nav=accounts.summaryofaccountbalances.navigator.SummaryOfAccountBalances&FARFN=4&actionchild=1&isTopMenu=true&targetDiv=workspace'
    }, function(err, res){
        var account_links = res.match(/\'[^\']+nav=transactionhistory.navigator.TransactionHistoryRedirect[^\']+\'/g)[0].replace("'", '').replace("'", '');
        cb(null, account_links);
    });
}


function setAccountContext(path, cb){
    path += '&targetDiv=workspace';
    hitPage({path: path, log:false}, cb);
}


function hitMainPage(cb){
    hitPage({path: '/banking/main.jsp', log:false}, cb);
}

function hitMainLoaded(cb){
    hitPage({path: '/banking/Controller?nav=navigator.MainLoaded', log:false}, cb);
}

function hitTohome(cb){
    hitPage({path: '/banking/Controller?nav=navigator.ToHome&action=dologin&countryCode=ZA&country=15&skin=0&targetDiv=workspace', log:false}, cb);
}

function doHEAD(cb){
    hitPage({path: '/04banners/banking/banner03/banner.html', log:false}, cb);
}


function promptCSV(cb){
    hitPage({
        path: '/banking/Controller?nav=accounts.transactionhistory.navigator.TransactionHistoryDDADownload&downloadFormat=csv',
        log: true,
        method: 'GET',
        content_type: 'application/x-zip'
    }, cb);
}


hitHomePage(function(err){
    //console.log('got the cookie 1: %s, attempting logon', cookie);
    logonToFNB(function(err, logon_result){
        //console.log('got the cookie 2: %s, attempting logon', cookie);
        //console.log('got the logon result, redirecting to get content with logon result: ', logon_result);
        redirectAfterLogon(logon_result, function(err, redirect_result){
            hitMainPage(function(err, main_response){
                // console.log('response after hitting main: %s', main_response);
                hitMainLoaded(function(err, main_loaded_response){
                    //console.log("finished hitting main loaded %s, proceeding", main_loaded_response);
                    hitTohome(function(err, hit_home_response){
                        //console.log('finished hitting it home: ', hit_home_response);
                        doHEAD(function(err, head_response){
                            // console.log('finished getting head response, ', head_response);
                            getBankAccountLinks(function(err, link){
                                //console.log('got the url with querystring to set account transaction context: ', link);
                                //console.log('got the cookie 4: %s, attempting logon', cookie);
                                setAccountContext(link, function(err){
                                    promptCSV(function(){
                                        console.log('done');
                                    })
                                });
                            });
                        });
                    });
                });
            });
        });
    });
})


// Q.nfcall(hitHomePage)
//     .then(Q.nfcall(logonToFNB))
//     .then(function (logon_result){
//         return Q.nfcall(redirectAfterLogon, logon_result)
//     })
//     .then(Q.nfcall(hitMainPage))
//     .then(Q.nfcall(hitMainLoaded))
//     .then(Q.nfcall(hitTohome))
//     .then(Q.nfcall(doHEAD))
//     .then(Q.nfcall(getBankAccountLinks))
//     .then(Q.nfcall(function(link){
//         Q.nfcall(setAccountContext, link);
//     }))














