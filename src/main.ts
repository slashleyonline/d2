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
canvas.style.cursor = "none";
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

const stickerDiv = document.createElement("div");
stickerDiv.id = "stickerDiv";
stickerDiv.innerText = "Stickers: ";
mainDiv.appendChild(stickerDiv);

//INTERFACES AND CLASSES

interface stickerType {
  image: string;
  title: string;
}

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

const stickers: Array<stickerType> = [
  {
    image: "🤠",
    title: "cowboy",
  },
  {
    image: "😢",
    title: "crying",
  },
  {
    image: "😴",
    title: "sleepy",
  },
];

let selectedSticker: string | null = null;

let currentStroke: Drawable = createLineCommandDefault();

let cursorCommand: Drawable | null;

const mouseCursor = { active: false, x: 0, y: 0 };

const renderStack: Array<Drawable> = [];

const tempUndoArray: Array<Drawable> = [];

const drawingChanged = new Event("drawingChanged");

const cursorChanged = new Event("toolMoved");

//EVENT LISTENERS

canvas.addEventListener("mousedown", (e) => {
  mouseCursor.active = true;
  mouseCursor.x = e.offsetX;
  mouseCursor.y = e.offsetY;
  tempUndoArray.length = 0; // Clear redo stack on new stroke
  if (selectedSticker) {
    // Create a new sticker command at the click position
    currentStroke = CreateStickerCommand(e.offsetX, e.offsetY, selectedSticker);
  } else {
    // Default to drawing a line
    currentStroke = createLineCommandDefault();
  }
});

canvas.addEventListener("mouseout", () => {
  canvas.dispatchEvent(cursorChanged);
  cursorCommand = null;
});

canvas.addEventListener("mouseenter", (e) => {
  console.log("resetting cursor!");
  if (!cursorCommand) {
    cursorCommand = createCursorCommand(e.offsetX, e.offsetY, "*");
  }
  canvas.dispatchEvent(cursorChanged);
});

canvas.addEventListener("mousemove", (e) => {
  mouseCursor.x = e.offsetX;
  mouseCursor.y = e.offsetY;

  if (cursorCommand) {
    cursorCommand.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(cursorChanged);
  }

  if (mouseCursor.active && currentStroke) {
    currentStroke.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(drawingChanged);
  }
});

canvas.addEventListener("mouseup", () => {
  mouseCursor.active = false;
  renderStack.push(currentStroke);
  //currentStroke = createLineCommandDefault(); // Reset to line
  //selectedSticker = null; // reset sticker selection after use
  canvas.dispatchEvent(drawingChanged);
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
  cursorCommand = createCursorCommand(0, 0, "*");

  lineCommandDefault.width = 4;
});

thickButton.addEventListener("click", () => {
  cursorCommand = createCursorCommand(0, 0, "*");

  lineCommandDefault.width = 10;
});

//FUNCTIONS

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

function CreateStickerCommand(x: number, y: number, symbol: string): Drawable {
  let position = { x, y };
  console.log("sticker function called!");
  return {
    drag(x: number, y: number) {
      position = { x, y };
    },
    display(ctx: CanvasRenderingContext2D) {
      ctx.fillText(symbol, position.x, position.y);
    },
  };
}

function createCursorCommand(x: number, y: number, symbol: string): Drawable {
  const position = { x, y };
  return {
    display(ctx: CanvasRenderingContext2D) {
      ctx.font = "32px monospace";
      ctx.fillStyle = "black";
      ctx.fillText(symbol, position.x - 8, position.y + 16);
    },
    drag(nx: number, ny: number) {
      position.x = nx;
      position.y = ny;
    },
  };
}

function stickerSetup(): void {
  clearDiv(stickerDiv);
  for (const sticker of stickers) {
    buildStickerButton(sticker);
  }
}

function buildStickerButton(data: stickerType) {
  const newButton = document.createElement("button");
  newButton.id = "stickerButton";
  newButton.innerText = data.image;
  newButton.style.fontSize = "50px";

  newButton.addEventListener("click", () => {
    cursorCommand = createCursorCommand(0, 0, data.image);
    selectedSticker = data.image;
  });

  stickerDiv.appendChild(newButton);
}

function reRender(stack: Array<Drawable>) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const drawable of stack) {
    drawable.display(ctx);
  }

  currentStroke.display(ctx);

  if (cursorCommand) {
    cursorCommand.display(ctx);
  }
}

function clearDiv(input: HTMLDivElement) {
  const removeList = input.children;

  for (const i of removeList) {
    i.remove();
  }
}

//CALLS

canvas.addEventListener("toolMoved", () => reRender(renderStack));

stickerSetup();
//clearDiv(stickerDiv);
