//let yinstrumenter = require('yinstrumenter');

let fs = require("fs");
let tsconf = eval("(()=>(" + fs.readFileSync("tsconfig.json", "utf-8") + "))()");
//const yyaImportsPlugin = require('./yyaImportsPlugin.cjs');

let aliases = {};
for (let k in tsconf.compilerOptions.paths) {
    let v = tsconf.compilerOptions.paths[k];
    aliases[k] = `./${v[0]}`; // /index.mjs`;
}

let DEV_SETTINGS = {};
try {
    DEV_SETTINGS = require("./DEV_SETTINGS.cjs");
} catch (e) {
//    console.trace(`DEV_SETTINGS not loaded`, e.stack);
}
const { DEV_BYPASS_AUTH } = DEV_SETTINGS;

// console.log('tsconf = ',tsconf);
// console.log('aliases = ',aliases);
// process.exit(1);

module.exports = {
    presets: [
        //"@babel/preset-typescript",
        //"@babel/preset-react"
    ],
    plugins: [
        [
            "inline-replace-variables",
            {
                DEV_BYPASS_AUTH: DEV_BYPASS_AUTH,
            },
        ],
        // Plugins for yinstr normalization
        // '@babel/transform-duplicate-keys',
        // '@babel/transform-function-name',
        // '@babel/transform-arrow-functions',
        // '@babel/transform-destructuring',
        // '@babel/transform-shorthand-properties',
        // '@babel/transform-member-expression-literals',
        // '@babel/transform-block-scoped-functions',
        // '@babel/transform-property-mutators',
        // Plugins for yinstr normalization END
        // ["@babel/syntax-typescript",{
        //     allowNamespaces:true,
        //     isTSX:true,
        //     allExtensions: true,
        // }],
        ["@babel/transform-typescript", {
//        onlyRemoveTypeImports: true
    }],
        "@babel/plugin-syntax-jsx",
        [
            "@babel/plugin-transform-react-jsx",
            {
                pragma: "React.createElement",
                pragmaFrag: "React.Fragment",
                throwIfNamespace: true,
                useBuiltIns: true,
            },
        ],
        "@babel/plugin-transform-react-display-name",
        "@babel/plugin-transform-react-jsx-self",
        "@babel/plugin-transform-react-jsx-source",

        ["@babel/plugin-proposal-decorators", { legacy: true }],

        "@babel/proposal-optional-chaining",
        //        yinstrumenter,
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread",
        [
            "module-resolver",
            {
                root: ["./"],
                alias: aliases,
            },
        ],
        //[yyaImportsPlugin, { extension: "mjs", replace: false }],
        //["babel-plugin-add-import-extension", { extension: "mjs", replace: false }],
        [
            "@babel/transform-modules-commonjs",
            {
                // loose: true,
                //  noInterop: true,
            },
        ],
    ],
};
return;
module.exports = {
    presets: ["@babel/preset-typescript", "@babel/preset-react"],
    plugins: [
        [
            "inline-replace-variables",
            {
                DEV_BYPASS_AUTH: DEV_BYPASS_AUTH,
            },
        ],
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        "@babel/proposal-optional-chaining",
        ["@babel/proposal-class-properties", { legacy: true }],
        "@babel/proposal-object-rest-spread",
        //    "react-hot-loader/babel",
        [
            "module-resolver",
            {
                root: ["./"],
                alias: aliases,
            },
        ],
        "@babel/transform-modules-commonjs",
    ],
};
