import Fastify, { FastifyInstance } from "fastify";
import S from "fluent-json-schema";
import { Subject } from "rxjs";

interface Order {
  user_id: number;
  timestamp_ns: number;
  price: number;
  symbol: string;
  quantity: number;
  order_type: string;
  trader_type: string;
}

const fastify: FastifyInstance = Fastify();
const orderManagerHostname: string = "order-manager";
const orderManagerPort: number = 3000;
const orderManagerPath: string = "";
const orderManagerUrl: string = `http://${orderManagerHostname}:${orderManagerPort}/${orderManagerPath}`;

const schema = S.object()
  .prop("user_id", S.integer().minimum(0).required())
  .prop("timestamp_ns", S.integer().minimum(0).required())
  .prop("price", S.number().minimum(0).required())
  .prop("symbol", S.string().minLength(1).required())
  .prop("quantity", S.integer().minimum(1).required())
  .prop("order_type", S.string().enum(["bid", "ask"]).required())
  .prop("trader_type", S.string().minLength(1).required());

const observable = new Subject();
observable.subscribe((rawData) => {
  const data = rawData as Order;
  fetch(orderManagerUrl, {
    body: JSON.stringify(data),
    method: "POST",
  });
});

fastify.post(
  "/",
  {
    schema: {
      body: schema,
    },
  },
  async function handler(request, replyTo) {
    observable.next(request.body);
    replyTo.status(201).send();
  },
);

fastify.get("/", async (request, replyTo) => {
  replyTo.send("Client gateway operational");
});

try {
  const port = 3000;
  fastify.listen({ port: port, host: "0.0.0.0" }, function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    } else console.log(`Client gateway listening on port ${address}`);
  });
} catch (e: any) {
  console.error(e);
}
