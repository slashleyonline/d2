import "./style.css";

const mainDiv = document.createElement("div");
mainDiv.id = "mainDiv";
document.body.appendChild(mainDiv);

const canvasDiv = document.createElement("div");
canvasDiv.id = "canvasDiv";
mainDiv.appendChild(canvasDiv);

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
canvasDiv.appendChild(canvas);

const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 256, 256);

const mouseCursor = { active: false, x: 0, y: 0 };

const positionsArray: Array<Array<{ x: number; y: number }>> = [];
const currentStroke: Array<{ x: number; y: number }> = [];


canvas.addEventListener("mousedown", (e) => {
  mouseCursor.active = true;
  mouseCursor.x = e.offsetX;
  mouseCursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (mouseCursor.active) {
    ctx.beginPath();
    ctx.moveTo(mouseCursor.x, mouseCursor.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    mouseCursor.x = e.offsetX;
    mouseCursor.y = e.offsetY;

    const newPosition = { x: e.offsetX, y: e.offsetY };
    currentStroke.push(newPosition);
    //console.log("position added: ", newPosition);

    const drawingChanged = new Event("drawingChanged");
    canvas.dispatchEvent(drawingChanged);
  }
});

canvas.addEventListener("mouseup", () => {
  positionsArray.push(currentStroke);
  //console.log("position array added: ", currentStroke);
  currentStroke.length = 0; // Clear current stroke
  mouseCursor.active = false;
});

const clearButton = document.createElement("button");
clearButton.id = "clearButton";
clearButton.textContent = "Clear";
mainDiv.appendChild(clearButton);

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener("drawingChanged", () => {
  console.log("Drawing changed event detected.");
});
