export function $<T extends HTMLElement>(query: string): T {
  const elm = document.querySelector(query);
  if (elm) {
    return elm as T;
  }
  throw Error('element not found');
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.addEventListener('load', () => {
      const image = new Image();
      image.addEventListener('load', () => {
        res(image);
      });
      image.addEventListener('error', () => rej());
      image.src = fr.result as string;
    });
    fr.addEventListener('error', () => rej());
    fr.readAsDataURL(file);
  });
}
