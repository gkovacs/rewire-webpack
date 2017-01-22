"use strict";

var path = require("path"),
    ModuleAliasPlugin = require("enhanced-resolve/lib/ModuleAliasPlugin.js"),
    RewiredNormalModuleFactory = require("./RewiredNormalModuleFactory.js"),
    RewiredDependency = require("./RewiredDependency.js");

function RewirePlugin() {}

RewirePlugin.prototype.apply = function (compiler) {
    // wire our RewiredDependency to our RewiredNormalModuleFactory
    // by decorating the original factory
    compiler.plugin("compilation", function(compilation, data) {
        var normalModuleFactory = data.normalModuleFactory

        var rewiredNormalModuleFactory = new RewiredNormalModuleFactory(normalModuleFactory);
        compilation.dependencyFactories.set(RewiredDependency, rewiredNormalModuleFactory);
        compilation.dependencyTemplates.set(RewiredDependency, new RewiredDependency.Template());
    });

    compiler.plugin("compilation", function(compilation, data) {
        data.normalModuleFactory.plugin("parser", function(parser, options) {
            // accept "var rewire", elsewise it would not be parsed (as overwritten)
            parser.plugin("var rewire", function() {
                console.log('var rewire body')
                return true;
            });

            // find rewire(request: String) calls and bind our RewiredDependency
            parser.plugin("call rewire", function (expr) {
                console.log('call rewire body')
                var param,
                    dep;

                if (expr.arguments.length !== 1) {
                    return false;
                }
                console.log('call rewire body 1')

                param = this.evaluateExpression(expr.arguments[0]);
                if (!param.isString()) {
                    return false;
                }

                console.log('call rewire body 2')

                dep = new RewiredDependency(param.string, param.range);
                dep.loc = expr.loc;
                console.log('call rewire body 3')
                this.state.current.addDependency(dep);
                console.log('call rewire body 4')

                return true;
            });
        });
    })

    // alias the require("rewire") to a webpack rewire
    //compiler.resolvers.normal.apply(new ModuleAliasPlugin({
    //    rewire: path.join(__dirname, "rewire.web.js")
    //}));
    if (!compiler.options) {
        compiler.options = {};
    }
    if (!compiler.options.resolve) {
        compiler.options.resolve = {};
    }
    if (!compiler.options.resolve.alias) {
        compiler.options.resolve.alias = {};
    }
    if (!compiler.options.resolve.alias.rewire) {
        compiler.options.resolve.alias.rewire = path.join(__dirname, "rewire.web.js");
    }
};

module.exports = RewirePlugin;