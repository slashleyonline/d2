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
  drag(x: number, y: number): void;
}

interface LineCommandSettings {
  width: number;
  color: string;
}

const lineCommandDefault: LineCommandSettings = {
  width: 4,
  color: "black",
};

//VARIABLES

function createLineCommandDefault(): Drawable {
  return createLineCommand(lineCommandDefault.width, lineCommandDefault.color);
}

function createLineCommand(widthInput: number, colorInput: string): Drawable {
  const positions: Array<{ x: number; y: number }> = [];

  return {
    drag(x: number, y: number) {
      positions.push({ x, y });
    },
    display(ctx: CanvasRenderingContext2D) {
      ctx.lineWidth = widthInput;
      ctx.strokeStyle = colorInput;

      if (positions.length > 1) {
        ctx.beginPath();
        ctx.moveTo(positions[0]!.x, positions[0]!.y);
        positions.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });

        ctx.stroke();
      }
    },
  };
}

let currentStroke: Drawable = createLineCommandDefault();

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
  currentStroke = createLineCommandDefault();
});

canvas.addEventListener("mousemove", (e) => {
  const toolMoved = new Event("toolMoved");
  canvas.dispatchEvent(toolMoved);
  if (mouseCursor.active) {
    mouseCursor.x = e.offsetX;
    mouseCursor.y = e.offsetY;

    const newPosition = { x: e.offsetX, y: e.offsetY };

    if (currentStroke) {
      currentStroke.drag(newPosition.x, newPosition.y);
      canvas.dispatchEvent(drawingChanged);
    }
  }
});

canvas.addEventListener("toolMoved", () => {
  console.log("tool has been moved on the canvas.");
});

canvas.addEventListener("mouseup", () => {
  mouseCursor.active = false;
  renderStack.push(currentStroke);
  currentStroke = createLineCommandDefault();
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
  lineCommandDefault.width = 2;
});

thickButton.addEventListener("click", () => {
  lineCommandDefault.width = 10;
});

//FUNCTIONS
function reRender(stack: Array<Drawable>) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const drawable of stack) {
    drawable.display(ctx);
  }
  currentStroke.display(ctx);
}
