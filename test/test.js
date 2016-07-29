var ProjectJSONValidator = require("../index.js").ProjectJSONValidator;
var fs = require("fs");
var projectJSON = JSON.parse(fs.readFileSync("./project.json", "utf8"));
var pjv = new ProjectJSONValidator(projectJSON, ProjectJSONValidator.LOCAL_PUBLISH_TARGET);
var result = pjv.checkRequirements();
debugger;