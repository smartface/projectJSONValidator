(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        factory(module, module.exports);
    }
    else {
        var module = {
            exports: {}
        };
        factory(module, module.exports);
        return global.ProjectJSONValidator = module.exports;
    }
})(typeof window !== "undefined" ? window : this, function(module, exports) {

    /**
     * Creates a new ProjectJSONValidator
     * @class
     * @param {Object} projectJSON - (required) project.json file as JavaScript object 
     * @param {string} publishTarget - (required) is local or rau 
     * @param {string} os - (optional) ios, android or all. Default value is all
     */
    function ProjectJSONValidator(projectJSON, publishTarget, os) {
        this.target = publishTarget || exports.LOCAL_PUBLISH_TARGET;
        this.projectJSON = projectJSON;
        os = os || "";
        this.os = os.toLowerCase() || "all";
    }

    ProjectJSONValidator.prototype.fillOptionals = function fillOptionals() {
        var projectJSON = this.projectJSON;
        if (projectJSON && projectJSON.config) {
            projectJSON.config.rau = projectJSON.config.rau || {};
            var rau = projectJSON.config.rau;
            if (typeof rau.formatVersion === "undefined") rau.formatVersion = "1.0.0";
            if (typeof rau.hashType === "undefined") rau.hashType = "md5";
            if (typeof rau.meta === "undefined") rau.meta = null;
            if (typeof rau.minimumSupportedVersion === "undefined") rau.minimumSupportedVersion = "1.0.0";
            if (typeof rau.currentReleaseChannel === "undefined") rau.currentReleaseChannel = "";
        }
    };

    ProjectJSONValidator.prototype.checkRequirements = function checkRequirements() {
        var reId = /^[a-z]+(\.[a-z]+)+$/;
        var reVersion = /^(\d+(?:\.\d+)+)$/;
        var projectJSON = this.projectJSON;
        var result = {
            errors: [],
            warnings: []
        };
        if (typeof projectJSON !== "object") {
            error("project.json is not an object");
            return result;
        }



        if (typeof projectJSON.build !== "object") {
            error("build object is missing");
        }
        else {
            if (typeof projectJSON.build.output !== "object") {
                error("build.output is not an object");
            }
            else {
                var build = projectJSON.build.output;
                if (typeof build.ios !== "object") {
                    var iOSBuildMessage = "build.output.ios is not an object";
                    this.isiOS() ? error(iOSBuildMessage) : warning(iOSBuildMessage);
                }
                else {
                    if (!isStringAndNotEmpty(build.ios.bundleIdentifier)) {
                        var bunldeIdentifierMessage = "build.output.ios.bundleIdentifier is missing";
                        this.isiOS() ? error(bunldeIdentifierMessage) : warning(bunldeIdentifierMessage);
                    }
                    else {
                        reId.lastIndex = 0;
                        if (!reId.test(build.ios.bundleIdentifier)) {
                            var invalidBundeIdentifierMessage = "build.output.ios.bundeIdentifier is not a valid ios bunde identifier";
                            this.isiOS() ? error(invalidBundeIdentifierMessage) : warning(invalidBundeIdentifierMessage);
                        }
                    }
                }

                if (typeof build.android !== "object") {
                    var androidBuildMessage = "build.output.android is not an object";
                    this.isiOS() ? error(androidBuildMessage) : warning(androidBuildMessage);
                }
                else {
                    if (!isStringAndNotEmpty(build.android.packageName)) {
                        var packageNameMessage = "build.output.android.packageName is missing";
                        this.isiOS() ? error(packageNameMessage) : warning(packageNameMessage);
                    }
                    else {
                        reId.lastIndex = 0;
                        if (!reId.test(build.android.packageName)) {
                            var invalidPackageNameMessage = "build.output.android.packageName is not a valid android package name";
                            this.isiOS() ? error(invalidPackageNameMessage) : warning(invalidPackageNameMessage);
                        }
                    }
                }
            }
        }

        if (typeof projectJSON.info !== "object") {
            error("info object is missing");
        }
        else {
            var info = projectJSON.info;
            if (!isStringAndNotEmpty(info.version)) {
                error("name value in info is missing");
            }
            else {
                reVersion.lastIndex = 0;
                if (!reVersion.test(info.version)) {
                    error("info.version is not a valid version");
                }
            }
            if (!isStringAndNotEmpty(info.name)) error("name value in info is missing");
        }

        if (typeof projectJSON.config !== "object") {
            error("config is not an object");
        }
        else {
            var config = projectJSON.config;
            if (this.target === ProjectJSONValidator.RAU_PUBLISH_TARGET) {
                if (typeof config.rau !== "object") {
                    error("config.rau is not an object");
                }
                else {
                    var rau = config.rau;
                    if (!isStringAndNotEmpty(rau.formatVersion)) {
                        error("config.rau.formatVersion is missing");
                    }
                    else {
                        reVersion.lastIndex = 0;
                        if (!reVersion.test(rau.formatVersion)) {
                            error("config.rau.formatVersion is not a valid version");
                        }
                    }

                    if (rau.hashType !== "md5") {
                        error("config.rau.hashType must be md5");
                    }

                    if (!(rau.channels instanceof Array)) {
                        error("config.rau.channels is not an array");
                    }
                    else {
                        for (var i in rau.channels) {
                            var c = rau.channels[i];
                            if (!isStringAndNotEmpty(c)) {
                                error('config.rau.channels ["' + c + '"] is not a valid string');
                            }
                        }
                    }

                    if (typeof rau.meta === "undefined") {
                        error("config.rau.meta value should be present (it can be null)");
                    }

                    if (!isStringAndNotEmpty(rau.minimumSupportedVersion)) {
                        error("config.rau.minimumSupportedVersion is missing");
                    }
                    else {
                        reVersion.lastIndex = 0;
                        if (!reVersion.test(rau.minimumSupportedVersion)) {
                            error("config.rau.minimumSupportedVersion is not a valid version");
                        }
                    }

                    if (!isStringAndNotEmpty(rau.profileKey)) {
                        error("config.rau.profileKey is missing");
                    } else {
                        var reProfileKey = /[a-zA-Z0-9]{32}/;
                        if(!reProfileKey.test(rau.profileKey)) {
                            error("config.rau.profileKey is in wrong format");
                        }
                    }
                }
            }
        }


        return result;


        function error(text) {
            result.errors.push(text);
        }

        function warning(text) {
            result.warnings.push(text);
        }
    };

    ProjectJSONValidator.LOCAL_PUBLISH_TARGET = "local";
    ProjectJSONValidator.RAU_PUBLISH_TARGET = "rau";

    ProjectJSONValidator.prototype.isiOS = function isiOS() {
        return this.os === "all" || this.os === "ios";
    };

    ProjectJSONValidator.prototype.isAndroid = function isAndroid() {
        return this.os === "all" || this.os === "android";
    };

    module.exports = ProjectJSONValidator;

    function isStringAndNotEmpty(value) {
        return typeof value === "string" && value.length !== 0;
    }
});