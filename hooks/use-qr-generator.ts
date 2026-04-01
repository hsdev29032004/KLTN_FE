import { QRGeneratorResponse, Bank } from "@/types/bank.type";

export function useQRGenerator() {
  const generateQR = (bank: Bank, message?: string): QRGeneratorResponse => {
    const bankNumber = bank.bankNumber;
    const bankCode = "970436"; // Use a fixed bank code for VietQR
    const accountName = encodeURIComponent(bank.recipient);
    const addInfo = message
      ? encodeURIComponent(message)
      : encodeURIComponent("ONLEARN");

    let qrUrl = "";
    let displayUrl = "";

    // Check if it's MoMo (based on bank name)
    if (bank.bankName.toLowerCase().includes("momo")) {
      // MoMo deeplink with message
      const momoLink = `momo://?action=transfer&receiver=${bankNumber}&comment=${addInfo}`;
      qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(momoLink)}`;
      displayUrl = momoLink;
    } else {
      // VietQR for banks with message
      const compactUrl = `https://img.vietqr.io/image/${bankCode}-${bankNumber}-compact2.jpg?accountName=${accountName}&addInfo=${addInfo}`;
      console.log(compactUrl);

      qrUrl = compactUrl;
      displayUrl = compactUrl;
    }

    return {
      qrUrl,
      displayUrl,
    };
  };

  return { generateQR };
}
