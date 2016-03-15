/**
 * Refactor all require calls to have a different module path prefix
 * E.g. from:
 * require('event_promotion/view/calendar_item');
 * to:
 * require('bundle/event_promotion/view/calendar_item');
 *
 * Initial prefix to look for needs to be passed to jscodeshift as an option
 * For the example above, the cli call would be like this:
 * `jscodeshift -t transforms/require-module.js fileA fileB --bundleName=event_promotion`
 */
module.exports = function(fileInfo, api, options) {
    'use strict';

    const source = fileInfo.source;
    const j = api.jscodeshift;
    const bundleName = options.bundle;

    const REQUIRE_CALL = {
        type: 'CallExpression',
        callee: {
            name: 'require'
        }
    };

    const createNewModulePath = (original) => {
        return {
            type: 'Literal',
            value: `bundle/${original}`,
            raw: `'bundle/${original}'`
        };
    };

    return j(source)
        // find all require calls
        .find(j.CallExpression, REQUIRE_CALL)
        // get the require calls that start with the string we're interested in
        .filter(node => node.value.arguments.length === 1 && node.value.arguments[0].value.startsWith(bundleName))
        // replace the module path with the new correct path for that module
        .forEach(node => {
            node.value.arguments[0] = createNewModulePath(node.value.arguments[0].value);
        })
        .toSource({ quote: 'single' });
};
