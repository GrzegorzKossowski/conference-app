import QRCode from "qrcode";

export async function generateQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, { width: 320, margin: 2 });
}

export async function generateQrPngBuffer(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, { width: 320, margin: 2 });
}
