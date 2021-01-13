var saml2 = require('saml2-js');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const crypto = require('crypto');
app.use(bodyParser.urlencoded({
  extended: true
}));

// Create service provider
var sp_options = {
  entity_id: "http://localhost:3100/metadata.xml",
  // entity_id: "https://b2c-app-docvault.b2cdev.com/sp",
  private_key: fs.readFileSync("key-file.pem").toString(),
  certificate: fs.readFileSync("cert-file.crt").toString(),
  assert_endpoint: "http://localhost:4000/assert",
  force_authn: true,
  auth_context: { comparison: "exact", class_refs: ["urn:oasis:names:tc:SAML:1.0:am:password"] },
  nameid_format: "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
  sign_get_request: false,
  allow_unencrypted_assertion: true
};
var sp = new saml2.ServiceProvider(sp_options);

// Create identity provider
var idp_options = {
  // sso_login_url: "https://idp-stage.b2cdev.com/saml/sso",
  sso_login_url: "http://localhost:3100/saml/sso",
  // sso_logout_url: "https://idp-stage.b2cdev.com/saml/slo",
  sso_logout_url: "http://localhost:3100/saml/slo",
  certificates: [fs.readFileSync("idp-public-cert.pem").toString()]
  //fs.readFileSync("idp-private-key.pem").toString(),
};
var idp = new saml2.IdentityProvider(idp_options);
//console.log(idp);
// ------ Define express endpoints ------

// Endpoint to retrieve metadata
app.get("/saml/metadata", function (req, res) {
  res.type('application/xml');
  res.send(sp.create_metadata());
});

app.post("/sp/saml2-logout", function (req, res) {
  let userdata = {
    "data":
    {
      "name_id": '',
      "session_index": '',
      "status": false
    }
  };

  let data = encrypt(JSON.stringify(userdata));
  let buff = new Buffer(data);
  let base64data = buff.toString('base64');
  console.log("token = " + base64data);
  res.redirect('http://localhost:4200/home?token=' + base64data);
});

// Starting point for login
app.get("/login", function (req, res) {
  // sp.create_login_request_url(idp, {relay_state: 'https://b2c-app-docvault.b2cdev.com?option=com_loan&Itemid=110&service=APP&ut='+usertoken}, function(err, login_url, request_id) {
  sp.create_login_request_url(idp, { relay_state: 'https://b2c-app-docvault.b2cdev.com?option=com_loan&Itemid=110' }, function (err, login_url, request_id) {
    if (err != null)
      return res.send(500);

    res.redirect(login_url);

  });
});

// Assert endpoint for when login completes
app.post("/assert", function (req, res) {
  var options = { request_body: req.body };
  sp.post_assert(idp, options, function (err, saml_response) {
    console.log(err);
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
        "status": true
      }
    };
    let data = encrypt(JSON.stringify(userdata));
    let buff = new Buffer(data);
    let base64data = buff.toString('base64');
    console.log("token = " + base64data);
    //client.set(name_id, base64data);
    //res.send("Hello "+saml_response.user.name_id+" --- logout > <a href='/logout'>logout</a>");
    res.redirect('http://localhost:4200/home?token=' + base64data);
    // res.send(saml_response);
  });
});

// Starting point for logout
app.get("/logout", function (req, res) {
  //client.get(name_id);
  let buff = new Buffer(req.query.token, 'base64');
  let token = JSON.parse(decrypt(buff.toString('ascii')));
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

var encrypt = function (plaindMessage) {
  let encryptionMethod = 'AES-256-CBC';
  let secret = "mcXUpsjDD39IYnrMf64P3CtlxkdHfSn5";
  let iv = secret.substr(0, 16)
  var encryptor = crypto.createCipheriv(encryptionMethod, secret, iv);
  return encryptor.update(plaindMessage, 'utf8', 'base64') + encryptor.final('base64');
}

var decrypt = function (encryptedMessage) {
  let encryptionMethod = 'AES-256-CBC';
  let secret = "mcXUpsjDD39IYnrMf64P3CtlxkdHfSn5";
  let iv = secret.substr(0, 16)
  let decryptor = crypto.createDecipheriv(encryptionMethod, secret, iv);
  return decryptor.update(encryptedMessage, 'base64', 'utf8') + decryptor.final('utf8');
}
app.listen(4000);