import Fastify, { FastifyInstance } from "fastify";
import S from "fluent-json-schema";

const fastify: FastifyInstance = Fastify();
const orderManagerHostname: string = "order-manager";
const orderManagerPort: number = 3000;
const orderManagerPath: string = "order";
const orderManagerUrl: string = `http://${orderManagerHostname}:${orderManagerPort}/${orderManagerPath}`;

enum Symbol {
  AMAZON = "AMZN",
  APPLE = "AAPL",
  GOOGLE = "GOOGL",
  MICROSOFT = "MSFT",
}

const schema = S.object()
  .prop("user_id", S.integer().minimum(0).required())
  .prop("timestamp_ns", S.integer().minimum(0).required())
  .prop("price", S.number().minimum(0).required())
  .prop(
    "symbol",
    S.string().minLength(1).enum(Object.values(Symbol)).required(),
  )
  .prop("quantity", S.integer().minimum(1).required())
  .prop("order_type", S.string().enum(["bid", "ask"]).required())
  .prop("trader_type", S.string().minLength(1).required());

fastify.post(
  "/",
  {
    schema: {
      body: schema,
    },
  },
  async function handler(request, replyTo) {
    try {
      const response = await fetch(orderManagerUrl, {
        body: JSON.stringify(request.body),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) replyTo.code(201).send();
      else replyTo.code(response.status).send();
    } catch (e: any) {
      console.error(e);
      replyTo.code(500).send();
    }
  },
);

fastify.get("/", async (_, replyTo) => {
  replyTo.code(200).send("Client gateway operational");
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
