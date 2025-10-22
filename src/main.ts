import "./style.css";

//CSS AND HTML SETUP

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

const clearButton = document.createElement("button");
clearButton.id = "clearButton";
clearButton.textContent = "Clear";
mainDiv.appendChild(clearButton);

const undoButton = document.createElement("button");
undoButton.id = "undoButton";
undoButton.textContent = "Undo";
mainDiv.appendChild(undoButton);

const redoButton = document.createElement("button");
redoButton.id = "redoButton";
redoButton.textContent = "Redo";
mainDiv.appendChild(redoButton);

//INTERFACES AND CLASSES

interface Stroke {
  positions: Array<{ x: number; y: number }>;
}

//VARIABLES

let currentStroke: Stroke | null = null;

const mouseCursor = { active: false, x: 0, y: 0 };

const positionsArray: Array<Stroke> = [];

const ctxArray: Array<CanvasRenderingContext2D> = [];

const ctxRedoArray: Array<CanvasRenderingContext2D> = [];

const tempUndoArray: Array<Stroke> = [];

//EVENT LISTENERS

canvas.addEventListener("mousedown", (e) => {
  mouseCursor.active = true;
  mouseCursor.x = e.offsetX;
  mouseCursor.y = e.offsetY;
  tempUndoArray.length = 0; // Clear redo stack on new stroke
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
  ctxArray.push(ctx);
  display(ctx);
  positionsArray.push(currentStroke!);
  currentStroke = null;
});

canvas.addEventListener("drawingChanged", () => {
  console.log("Drawing changed event detected.");
  redraw(positionsArray);
  display(ctx);
});

undoButton.addEventListener("click", () => {
  if (positionsArray.length > 0) {
    tempUndoArray.push(positionsArray[positionsArray.length - 1]!);
    ctxRedoArray.push(ctx);

    positionsArray.pop();
    ctxArray.pop();

    redraw(positionsArray);
    if (ctxArray.length > 0) {
      display(ctxArray[ctxArray.length - 1]!);
    }
  }
});

redoButton.addEventListener("click", () => {
  if (tempUndoArray.length > 0) {
    positionsArray.push(tempUndoArray[tempUndoArray.length - 1]!);
    tempUndoArray.pop();
    redraw(positionsArray);
  }
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  positionsArray.length = 0;
  tempUndoArray.length = 0;
});

//FUNCTIONS

function display(context: CanvasRenderingContext2D) {
  ctx.drawImage(context.canvas, 0, 0);
}

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
