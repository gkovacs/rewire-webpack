"use strict";

function rewire(module) {
    var rewiredModule = {
        i: module,
        l: false,
        exports: {}
    };

    //console.log('in rewire.web.js')
    //console.log(__webpack_modules__[module])
    //console.log(__webpack_modules__)
    //console.log(__webpack_require__.m)
    //console.log(__webpack_require__.m[module])
    //console.log('module is')
    //console.log(module)
    //console.log(__webpack_require__.m)
    __webpack_modules__[module].call(rewiredModule.exports, rewiredModule, rewiredModule.exports, __webpack_require__);
    rewiredModule.l = true;
    console.log(rewiredModule)
    console.log(rewiredModule.__get__)

    return rewiredModule.exports;
}

module.exports = rewire;