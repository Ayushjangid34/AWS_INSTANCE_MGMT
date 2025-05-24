// Terminal WebSocket bridge
const term = new Terminal();
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
const consoleDiv = document.getElementById('console');
if (consoleDiv) {
  term.open(consoleDiv);

  fitAddon.fit(); // Fit the terminal to the console div size

  const parts = window.location.pathname.split('/');
  const instanceId = parts[parts.length - 1]; // Retrieve the instance ID from the URL( https://localhost:3000/user/terminal/->instanceId<- )
  const socket = new WebSocket(`ws://localhost:3000/user/sshinstance/${instanceId}`); // websoeket connection to the server

  socket.onmessage = e => term.write(e.data); // write data from the server to the terminal
  term.onData(data => socket.send(data)); // send every keystroke to the server
}

window.addEventListener('resize', () => {
  fitAddon.fit();
});