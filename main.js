"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fluent_json_schema_1 = __importDefault(require("fluent-json-schema"));
const fastify = (0, fastify_1.default)();
const orderManagerHostname = "order-manager";
const orderManagerPort = 3000;
const orderManagerPath = "order";
const orderManagerUrl = `http://${orderManagerHostname}:${orderManagerPort}/${orderManagerPath}`;
var Symbol;
(function (Symbol) {
    Symbol["AMAZON"] = "AMZN";
    Symbol["APPLE"] = "AAPL";
    Symbol["GOOGLE"] = "GOOGL";
    Symbol["MICROSOFT"] = "MSFT";
})(Symbol || (Symbol = {}));
const schema = fluent_json_schema_1.default.object()
    .prop("user_id", fluent_json_schema_1.default.integer().minimum(0).required())
    .prop("timestamp_ns", fluent_json_schema_1.default.integer().minimum(0).required())
    .prop("price", fluent_json_schema_1.default.number().minimum(0).required())
    .prop("symbol", fluent_json_schema_1.default.string().minLength(1).enum(Object.values(Symbol)).required())
    .prop("quantity", fluent_json_schema_1.default.integer().minimum(1).required())
    .prop("order_type", fluent_json_schema_1.default.string().enum(["bid", "ask"]).required())
    .prop("trader_type", fluent_json_schema_1.default.string().minLength(1).required());
fastify.post("/", {
    schema: {
        body: schema,
    },
}, function handler(request, replyTo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(orderManagerUrl, {
                body: JSON.stringify(request.body),
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok)
                replyTo.code(201).send();
            else
                replyTo.code(response.status).send();
        }
        catch (e) {
            console.error(e);
            replyTo.code(500).send();
        }
    });
});
fastify.get("/", (_, replyTo) => __awaiter(void 0, void 0, void 0, function* () {
    replyTo.code(200).send("Client gateway operational");
}));
try {
    const port = 3000;
    fastify.listen({ port: port, host: "0.0.0.0" }, function (err, address) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        else
            console.log(`Client gateway listening on port ${address}`);
    });
}
catch (e) {
    console.error(e);
}
