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

/**
 * @dev Extracts the QR hash from an uploaded file's name.
 * It removes the file extension and any common browser-added suffixes like '(1)', '(2)', etc.
 * @param {File} file The uploaded file object.
 * @returns {string} The cleaned QR hash.
 */
export function decodeQRFromFile(file: File): string {
  let filename = file.name;

  // 1. Remove file extension (e.g., .png, .jpg)
  filename = filename.replace(/\.[^/.]+$/, "");

  // 2. Remove common browser-added suffixes like '(1)', '(2)', etc.
  // This regex looks for a space, followed by an opening parenthesis,
  // one or more digits, a closing parenthesis, at the end of the string.
  filename = filename.replace(/ \(\d+\)$/, "");

  return filename;
}
