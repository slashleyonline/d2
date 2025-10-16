import "./style.css";

const mainDiv = document.createElement("div");
mainDiv.id = "mainDiv";
document.body.appendChild(mainDiv);

const canvasDiv = document.createElement("div");
canvasDiv.id = "canvasDiv";
mainDiv.appendChild(canvasDiv);

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvasDiv.appendChild(canvas);


const ctx = canvas.getContext("2d")!;

ctx.fillStyle = "blue";
ctx.fillRect(0, 0, 300, 150);
