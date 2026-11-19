/**
 * PNG export — serialize the live canvas SVG, rasterize at 2× and
 * download. The canvas markup is fully inline-styled, so the exported
 * file matches the preview exactly.
 */

export async function exportSvgAsPng(
  svg: SVGSVGElement,
  filename: string,
  scale = 2,
): Promise<void> {
  const vb = svg.viewBox.baseVal;
  if (!vb || vb.width === 0 || vb.height === 0) {
    throw new Error('Canvas has nothing to export yet.');
  }

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(vb.width));
  clone.setAttribute('height', String(vb.height));

  const svgText = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));

  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not rasterize the comparison image.'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vb.width * scale);
    canvas.height = Math.round(vb.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!png) throw new Error('PNG export failed.');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(png);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  } finally {
    URL.revokeObjectURL(url);
  }
}
