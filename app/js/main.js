'use strict';

if (!Object.assign) {
    Object.assign = require('object-assign');
}

require('./services');
require('console-polyfill');

var React = require('react');
var jQuery = require('jquery');
var Router = require('react-router');
require('bootstrap');
require('classification');
require('ism-u.config');
var _ = require('./utils/_');
var SelfStore = require('ozp-react-commons/stores/SelfStore');
var ProfileActions = require('ozp-react-commons/actions/ProfileActions');
var LoadError = require('ozp-react-commons/components/LoadError.jsx');
var {
  METRICS_URL,
  APP_TITLE,
  IE_REDIRECT_URL
} = require('ozp-react-commons/OzoneConfig');


window.jQuery = jQuery;
window.$ = jQuery;
window.React = React;

require('script!underscore');
require('script!ism');
require('script!bootstrap-classify');

window.moment = require('moment');
window.Tether = require('tether');

// Enable withCredentials for all requests
$.ajaxPrefilter(function (options) {
    options.xhrFields = {
        withCredentials: true
    };
});

var Routes = require('./components/Routes.jsx'),
    routes = Routes();


/*
 * Render everything when we get our profile
 */
SelfStore.listen(_.once(function(profileData) {
    Router.run(routes, function (Handler) {
        var main = document.getElementById('main'),
            component;

        if (profileData.currentUser) {
            component = <Handler />;
        }
        else if (profileData.currentUserError) {
            component = <LoadError error={profileData.currentUserError} />;
        }

        React.render(component, main);
    });
}));

ProfileActions.fetchSelf();

(function initPiwik() {
    var _paq = window._paq || [];
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);

    (function() {
        var d = document,
            g = d.createElement('script'),
            s = d.getElementsByTagName('script')[0],
            u = METRICS_URL;

        _paq.push(['setTrackerUrl', u+'piwik.php']);
        _paq.push(['setSiteId', 1]);

        g.type='text/javascript';
        g.async=true;
        g.defer=true;
        g.src=u+'piwik.js';
        s.parentNode.insertBefore(g,s);
    })();

    window._paq = _paq;
})();

// Classification
$(function() {
    $(document).classification({
        level: 'U'
    });
});


require('tour');
require('./tour/tour.js');

//Configurable title
document.title = APP_TITLE;

//Disable bootstrap animations on Firefox
if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
  $.support.transition = false;
}

function detectIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }
    // other browser
    return false;
}

if (detectIE() && detectIE() < 10) {
alert(`
This site is tested against the following browsers:
IE 11 +
FireFox 24+
Chrome 36+
We have detected that you are using an unsupported browser and some features may not function correctly
`);
window.open(IE_REDIRECT_URL);
}
