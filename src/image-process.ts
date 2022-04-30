export type Image = HTMLImageElement;

const workCanvas = document.createElement('canvas');
const ctx = workCanvas.getContext('2d')!;

function getImageData(image: Image): [ImageData, Uint8ClampedArray] {
  workCanvas.width = image.width;
  workCanvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  return [imageData, imageData.data]
}

function imageDataToImage(data: ImageData): Promise<Image> {
  return new Promise((res) => {
    workCanvas.width = data.width;
    workCanvas.height = data.height;
    ctx.putImageData(data, 0, 0);
    const image = new Image();
    image.addEventListener('load', () => {
      res(image);
    });
    image.src = workCanvas.toDataURL('png');
  });
}

function getIdxFromPosition(data: ImageData, x: number, y: number): number {
  return y * data.width * 4 + x * 4;
}

export async function toBrighter(image: Image): Promise<Image> {
  const [ imageData, data ] = getImageData(image);
  for (let i = 0; i < data.length; i += 4) {
    data[i] *= 1.1;
    data[i + 1] *= 1.1;
    data[i + 2] *= 1.1;
  }
  return await imageDataToImage(imageData);
}

export async function toDarder(image: Image): Promise<Image> {
  const [ imageData, data ] = getImageData(image);
  for (let i = 0; i < data.length; i += 4) {
    data[i] /= 1.1;
    data[i + 1] /= 1.1;
    data[i + 2] /= 1.1;
  }
  return await imageDataToImage(imageData);
}

export async function toGrayScale(image: Image): Promise<Image> {
  const [ imageData, data ] = getImageData(image);
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i + 1] = data[i + 2] = avg;
  }
  return await imageDataToImage(imageData);
}

export async function flipNegaPosi(image: Image): Promise<Image> {
  const [ imageData, data ] = getImageData(image);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return await imageDataToImage(imageData);
}

export async function twoColorize(image: Image): Promise<Image> {
  const [ imageData, data ] = getImageData(image);
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i + 1] = data[i + 2] = avg > 127 ? 255 : 0;
  }
  return await imageDataToImage(imageData);
}

const gausianFilterWeights = [
  [1 / 16, 2 / 16, 1 / 16],
  [2 / 16, 4 / 16, 2 / 16],
  [1 / 16, 2 / 16, 1 / 16]
];

export async function gausianFilter(image: Image): Promise<Image> {
  const [ imageData, data ] = getImageData(image);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const sum = [0, 0, 0];
      for (let i = -1; i < 2; i++) {
        if (y + i < 0 || y + i >= image.height) {
          continue;
        }
        for (let j = -1; j < 2; j++) {
          if (x + j < 0 || x + j >= image.width) {
            continue;
          }
          const idx = getIdxFromPosition(imageData, x + j, y + i);
          sum[0] += data[idx] * gausianFilterWeights[i + 1][j + 1];
          sum[1] += data[idx + 1] * gausianFilterWeights[i + 1][j + 1];
          sum[2] += data[idx + 2] * gausianFilterWeights[i + 1][j + 1];
        }
      }
      const idx = getIdxFromPosition(imageData, x, y);
      data[idx] = sum[0];
      data[idx + 1] = sum[1];
      data[idx + 2] = sum[2];
    }
  }
  return imageDataToImage(imageData);
}

export async function getDifferential(image: Image): Promise<Image> {
  const [ imageData, data ] = getImageData(image);
  const diff = new Uint8ClampedArray(data.length);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const idx = getIdxFromPosition(imageData, x, y);
      if (y == 0 || x == 0) {
        diff[idx] = diff[idx + 1] = diff[idx + 2] = 0;
        diff[idx + 3] = 255;
      }
      const idx_ = getIdxFromPosition(imageData, x - 1, y - 1);
      diff[idx] = Math.abs(data[idx] - data[idx_]);
      diff[idx + 1] = Math.abs(data[idx + 1] - data[idx_ + 1]);
      diff[idx + 2] = Math.abs(data[idx + 2] - data[idx_ + 2]);
      diff[idx + 3] = 255;
    }
  }
  diff.forEach((v, idx) => data[idx] = v);
  return imageDataToImage(imageData);
}
