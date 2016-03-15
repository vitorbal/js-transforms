/*
 * Change define module expression to es6 export default
 * E.g. from:
 * define(function(require) { return {}; });
 * to:
 * export default {};
 */
module.exports = function(fileInfo, api) {
    const source = fileInfo.source;
    const j = api.jscodeshift;
    const root = j(source);
    const body = root.get().value.program.body;

    const DEFINE_CALL = {
        type: 'CallExpression',
        callee: {
            name: 'define'
        }
    };

    let comments;

    root.find(j.CallExpression, DEFINE_CALL)
        .forEach(node => {
            comments = body[0].comments;

            node.value.arguments[0].body.body.forEach(thing => {
                if (thing.type !== 'ReturnStatement') {
                  body.push(thing);
                }
            });

            const returnStatement = node.value.arguments[0].body.body
                .find(thing => {
                    return (thing.type === 'ReturnStatement');
                });

            returnStatement.type = 'ExportDefaultDeclaration';
            returnStatement.declaration = returnStatement.argument;

            body.push(returnStatement);
        })
        .remove();

    body[0].comments = comments;

    return root.toSource({ quote: 'single' });
};
