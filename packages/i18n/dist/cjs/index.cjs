Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_message = require("./message.cjs");
const require_store = require("./store.cjs");
exports.createI18n = require_store.createI18n;
exports.parseMessage = require_message.parseMessage;
exports.render = require_message.render;
exports.slotsOf = require_message.slotsOf;
