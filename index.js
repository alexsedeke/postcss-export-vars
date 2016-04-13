'use strict';

var postcss = require('postcss');
var _       = require('lodash');
var fs      = require('fs');

/**
 * Extract all variables used in PostCSS files.
 * Detect custom properties and SASS like variables.
 *
 * options  {object}
 *   file:  {string}       File name with path
 *   type:  {string}       File type. JSON and JS are supported. JSON ist default.
 *   match: {string array} String array property name should contain
 *
 * @type {Plugin<T>}
 */
module.exports = postcss.plugin('postcss-export-vars', function (options) {
    var _variablesToExport = [];

    options = options || {};

    if (_.isEmpty(options.file))  options.file = 'postcss_vars';
    if (_.isEmpty(options.match) || _.isArray(options.match) === false) options.match = [];

    /**
     * Create file.
     */
    function createFile() {
        let fileContent = '';

        /*
         * Customize data by type
         */
        switch (options.type) {
        case 'js':
            _variablesToExport.forEach(function (variable) {
                fileContent += `const ${variable.property} = '${variable.value}';`;
                fileContent += '\n';
            });

            if (_.endsWith(options.file, 'js') === false) options.file += '.js';

            break;
        default:
            /* json */
            let toObject = {};

            _variablesToExport.forEach(function (variable) {
                toObject[variable.property] = variable.value;
            });

            fileContent = JSON.stringify(toObject);

            if (_.endsWith(options.file, 'json') === false) options.file += '.json';
        }

        /*
         * Write file
         */
        return fs.writeFileSync(options.file, fileContent, 'utf8');
    }

    /**
     * Detect if property fulfill one matching value.
     *
     * @param property
     * @returns {boolean}
     */
    function propertyMatch(property) {
        for (let count = 0; count < options.match.length; count++) {
            if (property.indexOf(options.match[count]) > -1) {
                return true;
            }
        }

        return false;
    }

    /**
     * Plugin return
     */
    return function (css) {

        css.walkDecls(decl => {
            if ((decl.prop.match(/^--/) || decl.prop.match(/^\$/)) &&
                (_.isEmpty(options.match) || propertyMatch(decl.prop)) ) {
                _variablesToExport.push({ property: _.camelCase(decl.prop), value: decl.value });
            }
        });

        createFile();
    };
});
