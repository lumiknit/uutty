import Koa from "koa";
import serve from "koa-static";
import mount from "koa-mount";
import websockify from "koa-websocket";

import "./ws-pty";
import { spawnPtyOnSocket } from "./ws-pty";

const app = websockify(new Koa());

/* Issue ID */

app.use(
	mount("/echo", async ctx => {
		ctx.body = "Hello World";
	}),
);

app.ws.use(
	mount("/ws", async ctx => {
		spawnPtyOnSocket(ctx.websocket);
	}),
);

/* Static serving */

app.use(serve("../front-dist"));

/* Listen */

app.listen(3000, () => {
	console.log("Server running on port 3000");
});
