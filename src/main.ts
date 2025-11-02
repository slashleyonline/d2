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
ctx.fillStyle = "#ffffff00";
ctx.fillRect(0, 0, 256, 256);

const clearButton = document.createElement("button");
clearButton.id = "clearButton";
canvasDiv.appendChild(clearButton);

const undoButton = document.createElement("button");
undoButton.id = "undoButton";
canvasDiv.appendChild(undoButton);

const redoButton = document.createElement("button");
redoButton.id = "redoButton";
canvasDiv.appendChild(redoButton);

const thinButton = document.createElement("button");
thinButton.id = "thinButton";
markerDiv.appendChild(thinButton);

const thickButton = document.createElement("button");
thickButton.id = "thickButton";
markerDiv.appendChild(thickButton);

const colorDiv = document.createElement("div");
colorDiv.id = "colorDiv";
mainDiv.appendChild(colorDiv);

const stickerDiv = document.createElement("div");
stickerDiv.id = "stickerDiv";
stickerDiv.innerText = "Stickers: ";
mainDiv.appendChild(stickerDiv);

const exportDiv = document.createElement("div");
exportDiv.id = "exportDiv";
mainDiv.appendChild(exportDiv);

const exportButton = document.createElement("button");
exportButton.id = "exportButton";
exportDiv.appendChild(exportButton);

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

const colors = [
  "black",
  "white",
  "red",
  "blue",
  "green",
  "yellow",
  "pink",
  "purple",
  "orange",
];

let selectedSticker: string | null = null;

let currentStroke: Drawable | null = createLineCommandDefault();

let cursorCommand: Drawable | null;

let currentCursorIcon: string | null;

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
  currentStroke = createLineCommandDefault();
  if (selectedSticker) {
    currentStroke = CreateStickerCommand(e.offsetX, e.offsetY, selectedSticker);
  }
});

canvas.addEventListener("mouseout", () => {
  canvas.dispatchEvent(cursorChanged);
  //canvas.dispatchEvent(mouseupEvent);
  currentStroke = null;
  cursorCommand = null;
  canvas.dispatchEvent(drawingChanged);
});

canvas.addEventListener("mouseenter", (e) => {
  if (!cursorCommand) {
    if (currentCursorIcon) {
      cursorCommand = createCursorCommand(
        e.offsetX,
        e.offsetY,
        currentCursorIcon,
      );
    } else {
      cursorCommand = createCursorCommand(e.offsetX, e.offsetY, "*");
      currentCursorIcon = "*";
    }
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
  if (currentStroke) {
    renderStack.push(currentStroke);
  }
  canvas.dispatchEvent(drawingChanged);
});

canvas.addEventListener("drawingChanged", () => {
  reRender(ctx, renderStack);
  console.log("rerender!");
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
  console.log("clear!");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderStack.length = 0;
  tempUndoArray.length = 0;
  currentStroke = createLineCommandDefault();
  canvas.dispatchEvent(drawingChanged);
});

thinButton.addEventListener("click", () => {
  revertCursorToDraw();
  lineCommandDefault.width = 4;
});

thickButton.addEventListener("click", () => {
  revertCursorToDraw();
  lineCommandDefault.width = 10;
});

exportButton.addEventListener("click", () => {
  exportImage();
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

function revertCursorToDraw() {
  cursorCommand = createCursorCommand(0, 0, "*");
  currentCursorIcon = "*";
  currentStroke = createLineCommandDefault();
  selectedSticker = null;
}

function stickerSetup(): void {
  for (const sticker of stickers) {
    buildStickerButton(sticker);
  }
  buildCustomStickerButton();
}

function buildStickerButton(data: stickerType) {
  const newButton = document.createElement("button");
  newButton.id = "stickerButton";
  newButton.innerText = data.image;
  newButton.style.fontSize = "50px";

  newButton.addEventListener("click", () => {
    cursorCommand = createCursorCommand(0, 0, data.image);
    selectedSticker = data.image;
    currentCursorIcon = data.image;
  });

  stickerDiv.appendChild(newButton);
}

function buildCustomStickerButton() {
  const newCustomButton = document.createElement("button");
  newCustomButton.id = "customStickerButton";
  newCustomButton.innerText = "+";
  newCustomButton.style.fontSize = "50px";

  newCustomButton.addEventListener("click", () => {
    const newStickerSymbol = prompt("Enter a new symbol for your sticker!");
    const newStickerName = prompt("What is the sticker's name?");
    if (newStickerSymbol && newStickerName) {
      const newSticker: stickerType = {
        image: newStickerSymbol,
        title: newStickerName,
      };
      stickers.push(newSticker);
      clearStickerDiv();
    }
  });
  stickerDiv.appendChild(newCustomButton);
}

function reRender(context: CanvasRenderingContext2D, stack: Array<Drawable>) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  console.log("new print stack: ", stack.length);
  for (const drawable of stack) {
    drawable.display(context);
  }
  if (currentStroke) {
    currentStroke.display(context);
  }

  if (cursorCommand) {
    cursorCommand.display(context);
  }
}

function clearStickerDiv() {
  stickerDiv.replaceChildren();
  stickerDiv.innerText = "Stickers: ";
  stickerSetup();
}

function exportImage() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;

  const exportCTX = exportCanvas.getContext("2d");
  exportCTX?.scale(4, 4);
  reRender(exportCTX!, renderStack);

  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
}

function initiateColorDiv() {
  for (const colorName of colors) {
    const newColorButtonElement = document.createElement("button");
    newColorButtonElement.id = "colorButton";
    newColorButtonElement.style.backgroundColor = colorName;
    newColorButtonElement.addEventListener("click", () => {
      lineCommandDefault.color = colorName;
      enableButtons(colorDiv);
      newColorButtonElement.disabled = true;
    });
    colorDiv.appendChild(newColorButtonElement);
  }
}

function enableButtons(divElement: HTMLDivElement) {
  for (const element of divElement.children) {
    if (element instanceof HTMLButtonElement) {
      element.disabled = false;
    }
  }
}

//CALLS

canvas.addEventListener("toolMoved", () => reRender(ctx, renderStack));

stickerSetup();
initiateColorDiv();
