import Koa from "koa";
import serve from "koa-static";
import mount from "koa-mount";
import websockify from "koa-websocket";

import { BasicAuthConfig, getClientConfig, parseArgs } from "./config";

import "./ws-pty";
import { getToken, spawnPtyOnSocket } from "./ws-pty";

// Read configuration
const config = parseArgs();

// App
const app = websockify(new Koa());

// Access log
app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	console.log(`[${ctx.method} ${ctx.url}] Responsed ${ms}ms`);
});

/* WebSocket */

app.ws.use(
	mount("/ws", async ctx => {
		spawnPtyOnSocket(ctx.websocket, config);
	}),
);

/* Public APIs */

app.use(
	mount("/healthz", async ctx => {
		ctx.body = "OK";
	}),
);

/* Authentication */
if (config.auth.type === "basic") {
	app.use(async (ctx, next) => {
		if (config.auth.type !== "basic") {
			throw new Error("Auth type changed");
		}
		const auth = ctx.get("Authorization");
		if (!auth) {
			ctx.status = 401;
			ctx.set("WWW-Authenticate", 'Basic realm="example"');
			ctx.body = "Unauthorized";
			return;
		}
		const [username, password] = Buffer.from(auth.split(" ")[1], "base64")
			.toString()
			.split(":");
		if (
			username !== config.auth.username ||
			password !== config.auth.password
		) {
			ctx.status = 401;
			ctx.set("WWW-Authenticate", 'Basic realm="example"');
			ctx.body = "Unauthorized";
			return;
		}
		await next();
	});
}

/* APIs */

app.use(
	mount("/config", async ctx => {
		// Return client config
		ctx.body = getClientConfig(config);
		ctx.type = "application/json";
	}),
);

app.use(
	mount("/token", async ctx => {
		const token = getToken();
		ctx.body = token;
		ctx.type = "text/plain";
		console.log(`[/token] ${token}`);
	}),
);

/* Static serving */

app.use(serve("../front-dist"));

/* Listen */

app.listen(config.port, config.host, () => {
	console.log(`[+] Listening on ${config.host}:${config.port}`);
});
