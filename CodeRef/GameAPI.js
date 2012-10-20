var Common = require('./GameAPI/Common').Common;

exports.GameAPI = {

    Common:    Common,
    User:      require('./GameAPI/User').User,
    Mission:   require('./GameAPI/Mission').Mission,
    Battle:    require('./GameAPI/Battle').Battle,
    Shop:      require('./GameAPI/Shop').Shop,
    Combine:   require('./GameAPI/Combine').Combine,
    Friend:    require('./GameAPI/Friend').Friend,
    /* add here */

    /* GameAPI::Common alias */
    init:   Common.init,
    send:   Common.send,
    showWelcome: Common.showWelcome
};

