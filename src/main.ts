import { $, loadImage } from './dom-util';
import {
  Image,
  toBrighter,
  toDarder,
  toGrayScale,
  flipNegaPosi,
  twoColorize,
  gausianFilter,
  getDifferential
} from './image-process';


const input = $<HTMLInputElement>('#file-input');
const imageOutlet = $('#image-outlet');
const canvas = $<HTMLCanvasElement>('#canvas');

const ctx = canvas.getContext('2d')!;

let srcImage: HTMLImageElement | null = null;
let processingImage: HTMLImageElement | null = null;

input.addEventListener('change', async () => {
  const file = input.files?.[0];
  if (file) {
    srcImage = processingImage = await loadImage(file);
    imageOutlet.innerHTML = '';
    imageOutlet.appendChild(srcImage);
    canvas.width = srcImage.width;
    canvas.height = srcImage.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(srcImage, 0, 0);
  }
});

$('#original').addEventListener('click', () => {
  if (!srcImage) {
    return;
  }
  processingImage = srcImage;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(processingImage, 0, 0);
});

async function updateProcessingImage(fn: (image: Image) => Promise<Image>) {
  if (!srcImage || !processingImage) {
    return;
  }
  processingImage = await fn(processingImage);
  ctx.drawImage(processingImage, 0, 0);
}

$('#brighter').addEventListener('click', () => updateProcessingImage(toBrighter));

$('#darker').addEventListener('click', () => updateProcessingImage(toDarder));

$('#gray-scale').addEventListener('click', () => updateProcessingImage(toGrayScale));

$('#nega-posi').addEventListener('click', () => updateProcessingImage(flipNegaPosi));

$('#two-colorize').addEventListener('click', () => updateProcessingImage(twoColorize));

$('#gausian').addEventListener('click', () => updateProcessingImage(gausianFilter));

$('#diff').addEventListener('click', () => updateProcessingImage(getDifferential));
