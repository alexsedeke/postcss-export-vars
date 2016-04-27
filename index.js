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
    var _variableCollection = {};

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
            fileContent += `'use strict';` + '\n';
            for (let collectionKey in _variableCollection) {
                fileContent += `const ${collectionKey} = '${_variableCollection[collectionKey]}';` + '\n';
            }

            if (_.endsWith(options.file, 'js') === false) options.file += '.js';

            break;
        default:
            /* json */
            fileContent = JSON.stringify(_variableCollection);

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
     * Extract custom properties and sass like variables from value.
     * Return each found variable as array with objects.
     *
     * @example 'test vars(--var1) + $width'
     *          result in array with objects:
     *          [{origin:'vars(--var1)', variable: '--var1'},{origin:'$width', variable: 'width'}]
     * @param value
     * @returns {Array}
     */
    function extractVariables(value) {
        let regex = [/var\((.*?)\)/g, /\$([a-zA-Z0-9_\-]*)/g ],
            result = [],
            matchResult;

        regex.forEach(expression => {
            while (matchResult = expression.exec(value)) {
                result.push({ origin: matchResult[0], variable: matchResult[1] });
            }
        });

        return result;
    }

    /**
     * Resolve references on variable values to other variables.
     */
    function resolveReferences() {

        for (let key in _variableCollection) {

            let referenceVariables = extractVariables(_variableCollection[key]);

            for (let current = 0; current < referenceVariables.length; current++) {
                if (_.isEmpty(_variableCollection[_.camelCase(referenceVariables[current].variable)]) === false) {
                    _variableCollection[key] = _variableCollection[key].replace(referenceVariables[current].origin, _variableCollection[_.camelCase(referenceVariables[current].variable)]);
                }
            }
        }
    }

    /**
     * Escape values depends on type.
     *
     * For JS escape single quote, for json double quotes.
     * For everything else return origin value.
     *
     * @param value {string}
     * @returns {string}
     */
    function escapeValue(value) {
        switch (options.type) {
        case 'js':
            return value.replace(/'/g, '\\\'');
        case 'json':
            return value.replace(/"/g, '\\"');
        default:
            return value;
        }
    }

    /**
     * Plugin return
     *
     * @returns {function}
     */
    return function (css) {

        css.walkDecls(decl => {
            if ((decl.prop.match(/^--/) || decl.prop.match(/^\$/)) &&
                (_.isEmpty(options.match) || propertyMatch(decl.prop)) ) {
                _variableCollection[_.camelCase(decl.prop)] = escapeValue(decl.value);
            }
        });

        /*
         * Resolve references on variable values
         */
        resolveReferences();

        createFile();
    };
});
