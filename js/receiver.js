const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

context.start();

document.body.style = "background-color: #00ff00;";
console.log("Receiver started");
document.body.innerHTML = "Receiver started";