require("dotenv").config();
var saml2 = require('saml2-js');
var fs = require('fs');
var express = require('express');
var router = express.Router()
var SecurityService = require('../services/security');

// Create service provider
var sp_options = {
    entity_id: process.env.ENTITY_ID,
    private_key: fs.readFileSync("key-file.pem").toString(),
    certificate: fs.readFileSync("cert-file.crt").toString(),
    assert_endpoint: process.env.ASSERT_ENDPOINT,
    force_authn: process.env.FORCE_AUTHN,
    auth_context: { comparison: "exact", class_refs: [process.env.AUTHENTITATION_CONTEXT_CLASS] },
    nameid_format: process.env.NAMEID_FORMAT,
    sign_get_request: process.env.SIGN_GET_REQUEST,
    allow_unencrypted_assertion: process.env.ALLOW_UNENCRYPTED_ASSERTION
};
var sp = new saml2.ServiceProvider(sp_options);

// Create identity provider
var idp_options = {
    sso_login_url: process.env.SSO_LOGIN_URL,
    sso_logout_url: process.env.SSO_LOGOUT_URL,
    certificates: [fs.readFileSync("idp-public-cert.pem").toString()]
};

var idp = new saml2.IdentityProvider(idp_options);

// ------ Define express endpoints ------

// Endpoint to retrieve metadata
router.get("/saml/metadata", function (req, res) {
    res.type('application/xml');
    res.send(sp.create_metadata());
});

// Login endpoint for SP
router.get("/login", function (req, res) {
    sp.create_login_request_url(idp, { relay_state: process.env.FRONTEND_BASE_URL + '/?service=APP' }, function (err, login_url, request_id) {
        if (err != null)
            return res.send(500);
        res.redirect(login_url);
    });
});

// Assert endpoint when login complete
router.post("/acs-url", function (req, res) {
    var options = { request_body: req.body };
    sp.post_assert(idp, options, function (err, saml_response) {
        if (err != null)
            return res.send(500);
        // Save name_id and session_index for logout
        // Note:  In practice these should be saved in the user session, not globally.
        name_id = saml_response.user.name_id;
        session_index = saml_response.user.session_index;
        let userdata = {
            "data":
            {
                "name_id": name_id,
                "session_index": session_index,
                "login_status": true
            }
        };
        let data = SecurityService.encrypt(JSON.stringify(userdata));
        let buff = Buffer.from(data);
        let base64data = buff.toString('base64');
        //res.send("Hello "+saml_response.user.name_id+" --- logout > <a href='/logout'>logout</a>");
        res.redirect(process.env.FRONTEND_BASE_URL + '/home?token=' + base64data);
    });
});


// Starting point for logout
router.get("/logout", function (req, res) {
    let buff = Buffer.from(req.query.token, 'base64');
    let token = JSON.parse(SecurityService.decrypt(buff.toString('ascii')));
    var options = {
        name_id: token.data.name_id,
        session_index: token.data.session_index
    };

    sp.create_logout_request_url(idp, options, function (err, logout_url) {
        if (err != null)
            return res.send(500);
        res.redirect(logout_url);
    });
});

//It will call when IDP logout 
router.post("/sp/saml2-logout", function (req, res) {
    let userdata = {
        "data":
        {
            "name_id": '',
            "session_index": '',
            "login_status": false
        }
    };

    let data = SecurityService.encrypt(JSON.stringify(userdata));
    let buff = Buffer.from(data);
    let base64data = buff.toString('base64');
    res.redirect(process.env.FRONTEND_BASE_URL + '/home?token=' + base64data);
});


module.exports = router