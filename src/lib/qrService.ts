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
 * It removes the file extension and any common browser/OS-added suffixes
 * like '(1)', '(2)', '- Copy', etc., to ensure only the original hash remains.
 * @param {File} file The uploaded file object.
 * @returns {string} The cleaned QR hash.
 */
export function decodeQRFromFile(file: File): string {
  let filename = file.name;

  // 1. Remove the file extension (e.g., .png, .jpg, .jpeg)
  filename = filename.replace(/\.(png|jpg|jpeg|gif|bmp|webp)$/i, "");

  // 2. Remove common browser/OS-added suffixes:
  //    - ' (X)' where X is a number (e.g., ' (1)', ' (2)')
  //    - '- Copy' (e.g., 'filename - Copy')
  //    - '_Copy' (less common but possible)
  //    - Any trailing whitespace
  filename = filename.replace(/ \(\d+\)$/, ""); // e.g., "filename (1)" -> "filename"
  filename = filename.replace(/ - Copy$/, "");  // e.g., "filename - Copy" -> "filename"
  filename = filename.replace(/_Copy$/, "");   // e.g., "filename_Copy" -> "filename"
  filename = filename.trim(); // Remove any leading/trailing whitespace that might remain

  return filename;
}
