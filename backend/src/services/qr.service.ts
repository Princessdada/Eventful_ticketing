import QRCode from "qrcode";

class QRService {
    /**
     * Generate a QR code as a Data URL
     * @param data The string to encode in the QR code
     * @returns Promise<string> A data URL representing the QR code
     */
    async generateQRCode(data: string): Promise<string> {
        try {
            const qrDataUrl = await QRCode.toDataURL(data);
            return qrDataUrl;
        } catch (error) {
            console.error("QR Code Generation Error:", error);
            throw new Error("Failed to generate QR code");
        }
    }
}

export default new QRService();
