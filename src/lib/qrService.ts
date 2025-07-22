import QRCode from 'qrcode';

export async function generateQRCode(text: string): Promise<string> {
  console.log("🚨 QR Generator Input:", text); // Logs what is being encoded
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    throw error;
  }
}

export function downloadQRCode(qrHash: string, dataURL: string) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `${qrHash}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
