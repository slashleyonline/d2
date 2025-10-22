import "./style.css";

//CSS AND HTML SETUP

const mainDiv = document.createElement("div");
mainDiv.id = "mainDiv";
document.body.appendChild(mainDiv);

const canvasDiv = document.createElement("div");
canvasDiv.id = "canvasDiv";
mainDiv.appendChild(canvasDiv);

const markerDiv = document.createElement("div");
markerDiv.id = "markerDiv";
markerDiv.innerText = "Marker Tools:";
mainDiv.appendChild(markerDiv);

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
canvasDiv.appendChild(clearButton);

const undoButton = document.createElement("button");
undoButton.id = "undoButton";
undoButton.textContent = "Undo";
canvasDiv.appendChild(undoButton);

const redoButton = document.createElement("button");
redoButton.id = "redoButton";
redoButton.textContent = "Redo";
canvasDiv.appendChild(redoButton);

const thinButton = document.createElement("button");
thinButton.id = "thinButton";
thinButton.textContent = "thin";
markerDiv.appendChild(thinButton);

const thickButton = document.createElement("button");
thickButton.id = "thickButton";
thickButton.textContent = "thick";
markerDiv.appendChild(thickButton);

//INTERFACES AND CLASSES

interface Drawable {
  display(ctx: CanvasRenderingContext2D): void;
  width: number;
  color: string;
}

interface MarkerLine {
  coords: { x: number; y: number };
  drag(x: number, y: number, ctx: CanvasRenderingContext2D): void;
}

//VARIABLES

let markerWidth = 2;

const currentColor = "black";

const drawingLine = (
  position: { x: number; y: number },
): MarkerLine => ({
  coords: position,

  drag(x: number, y: number, ctx: CanvasRenderingContext2D) {
    console.log("calling drag!");
    ctx.beginPath();
    ctx.moveTo(this.coords.x, this.coords.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    this.coords = { x, y };
  },
});

const stroke = (
  positions: Array<{ x: number; y: number }>,
  widthInput: number,
  colorInput: string,
): Drawable => (
  {
    width: widthInput,
    color: colorInput,

    display(ctx: CanvasRenderingContext2D) {
      ctx.lineWidth = this.width;
      ctx.strokeStyle = this.color;
      if (positions.length > 1) {
        const newLine = drawingLine(
          { x: positions[0]!.x, y: positions[0]!.y },
        );

        positions.forEach((point) => {
          newLine.drag(point.x, point.y, ctx);
        });
      }
    },
  }
);

let currentStroke: {
  positions: Array<{ x: number; y: number }>;
  width: number;
  color: string;
};

const mouseCursor = { active: false, x: 0, y: 0 };

const renderStack: Array<Drawable> = [];

const tempUndoArray: Array<Drawable> = [];

const drawingChanged = new Event("drawingChanged");

//EVENT LISTENERS

canvas.addEventListener("mousedown", (e) => {
  mouseCursor.active = true;
  mouseCursor.x = e.offsetX;
  mouseCursor.y = e.offsetY;
  tempUndoArray.length = 0; // Clear redo stack on new stroke
  currentStroke = { positions: [], width: markerWidth, color: currentColor };
});

canvas.addEventListener("mousemove", (e) => {
  if (mouseCursor.active) {
    mouseCursor.x = e.offsetX;
    mouseCursor.y = e.offsetY;

    const newPosition = { x: e.offsetX, y: e.offsetY };

    if (currentStroke) {
      currentStroke.positions.push(newPosition);
      canvas.dispatchEvent(drawingChanged);
    }
  }
});

canvas.addEventListener("mouseup", () => {
  const finalStroke = stroke(
    currentStroke.positions,
    currentStroke.width,
    currentStroke.color,
  );
  mouseCursor.active = false;
  renderStack.push(finalStroke);
  currentStroke = { positions: [], width: markerWidth, color: currentColor };
});

canvas.addEventListener("drawingChanged", () => {
  console.log("Drawing changed event detected.");
  reRender(renderStack);
});

undoButton.addEventListener("click", () => {
  if (renderStack[renderStack.length - 1]) {
    tempUndoArray.push(renderStack[renderStack.length - 1]!);
    renderStack.pop();
    canvas.dispatchEvent(drawingChanged);
  }
});

redoButton.addEventListener("click", () => {
  if (tempUndoArray[tempUndoArray.length - 1]) {
    renderStack.push(tempUndoArray[tempUndoArray.length - 1]!);
    tempUndoArray.pop();
    canvas.dispatchEvent(drawingChanged);
  }
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderStack.length = 0;
  canvas.dispatchEvent(drawingChanged);
  tempUndoArray.length = 0;
});

thinButton.addEventListener("click", () => {
  markerWidth = 2;
});

thickButton.addEventListener("click", () => {
  markerWidth = 10;
});

//FUNCTIONS

function reRender(stack: Array<Drawable>) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const drawable of stack) {
    drawable.display(ctx);
  }
  if (currentStroke.positions.length > 1) {
    const activeStroke = stroke(
      currentStroke.positions,
      currentStroke.width,
      currentStroke.color,
    );
    activeStroke.display(ctx);
  }
}
