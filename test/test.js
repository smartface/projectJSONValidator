var ProjectJSONValidator = require("../index.js").ProjectJSONValidator;
var fs = require("fs");
var projectJSON = JSON.parse(fs.readFileSync("./project.json", "utf8"));
var pjv = new ProjectJSONValidator(projectJSON, ProjectJSONValidator.LOCAL_PUBLISH_TARGET);
var result = pjv.checkRequirements();
debugger;


projectJSON.config.rau = {
    "formatVersion": "1.0.0",
    "hashType": "md5",
    "profileKey": "myAppKey-Secret",
    "revision": 1,
    "channels": ["production", "pre-prod", "uat"],
    "meta": {
        "whatIsWritten in data": "as data object in here",
        "also": "it can be null or missing",
        "this": "is not parsed by release server"
    },
    "minimumSupportedVersion": "1.0.0",
    "currentReleaseChannel": "test"
};

pjv = new ProjectJSONValidator(projectJSON, ProjectJSONValidator.RAU_PUBLISH_TARGET);
result = pjv.checkRequirements();
debugger;