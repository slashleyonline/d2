import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";


const mainDiv = document.createElement("div");
mainDiv.id = "mainDiv";

document.body.appendChild(mainDiv);

mainDiv.innerHTML = `
  <p>Example image asset: <img src="${exampleIconUrl}" class="icon" /></p>
`;

const canvas = document.createElement("canvas");

mainDiv.appendChild(canvas);

const ctx = canvas.getContext("2d")!;

ctx.fillStyle = "green";
ctx.fillRect(0, 0, 256, 256);