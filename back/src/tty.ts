import * as pty from 'node-pty';

const ptyProcess = pty.spawn('bash', [], {
	name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

ptyProcess.write("ls\r");

ptyProcess.onData((data: string) => {
	console.log(data);
});