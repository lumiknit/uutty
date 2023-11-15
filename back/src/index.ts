import Koa from "koa";
import serve from "koa-static";
import mount from "koa-mount";
import websockify from "koa-websocket";

import "./tty";

const app = websockify(new Koa());

/* Static serving */

app.use(
	mount("/echo", async ctx => {
		ctx.body = "Hello World";
	}),
);

app.ws.use(
	mount("/ws", async ctx => {
		ctx.websocket.on("message", message => {
			console.log("Recieved:", message.toString());
		});
		ctx.websocket.send("Hello World");
	}),
);

app.use(serve("../front-dist"));

/* Listen */

app.listen(3000, () => {
	console.log("Server running on port 3000");
});
