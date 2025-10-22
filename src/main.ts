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

interface Drawable {
  display(ctx: CanvasRenderingContext2D): void;
}

//VARIABLES

const stroke = (positions: Array<{ x: number; y: number }>): Drawable => ({
  display(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(positions[0]!.x, positions[0]!.y);

    positions.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  },
});

let currentStroke: any = null;

const mouseCursor = { active: false, x: 0, y: 0 };

const renderStack: Array<Drawable> = [];

const tempUndoArray: Array<Drawable> = [];

//EVENT LISTENERS

canvas.addEventListener("mousedown", (e) => {
  mouseCursor.active = true;
  mouseCursor.x = e.offsetX;
  mouseCursor.y = e.offsetY;
  tempUndoArray.length = 0; // Clear redo stack on new stroke
  currentStroke = stroke([]);
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

    if (currentStroke) {
      currentStroke.positions.push(newPosition);

      const drawingChanged = new Event("drawingChanged");
      canvas.dispatchEvent(drawingChanged);
    }
  }
});

canvas.addEventListener("mouseup", () => {
  //console.log("position array added: ", currentStroke);

  mouseCursor.active = false;
  renderStack.push(currentStroke);
  currentStroke = null;
});

canvas.addEventListener("drawingChanged", () => {
  console.log("Drawing changed event detected.");
  currentStroke.display(ctx);
});

undoButton.addEventListener("click", () => {
  
});

redoButton.addEventListener("click", () => {
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

//FUNCTIONS

/*
function redraw(posArr: Array<Drawable>) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const stroke of posArr) {
    drawLine(stroke);
  }
  //if (currentStroke) {
    //drawLine(currentStroke);
  //}
};

function drawLine(stroke: Drawable) {
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
*/
