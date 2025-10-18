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

const positionsArray: Array<Stroke> = [];

interface Stroke {
  positions: Array<{ x: number; y: number }>;
}

let currentStroke: Stroke | null = null;

canvas.addEventListener("mousedown", (e) => {
  mouseCursor.active = true;
  mouseCursor.x = e.offsetX;
  mouseCursor.y = e.offsetY;
  currentStroke = { positions: [] };
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
    //if (currentStroke !== null) {
    if (currentStroke) {
      currentStroke.positions.push(newPosition);
    }
    //console.log("position added: ", newPosition);

    const drawingChanged = new Event("drawingChanged");
    canvas.dispatchEvent(drawingChanged);
  }
});

canvas.addEventListener("mouseup", () => {
  console.log("position array added: ", currentStroke);

  mouseCursor.active = false;
  positionsArray.push(currentStroke!);
  currentStroke = null;
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
  redraw(positionsArray);
});

function redraw(posArr: Array<Stroke>) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const stroke of posArr) {
    drawLine(stroke);
  }
  if (currentStroke) {
    drawLine(currentStroke);
  }
}

function drawLine(stroke: Stroke) {
  if (stroke.positions.length > 1) {
    const posArray = stroke.positions;

    ctx.beginPath();
    ctx.moveTo(posArray[0]!.x, posArray[0]!.y);

    posArray.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });

    ctx.stroke();
  }
}
