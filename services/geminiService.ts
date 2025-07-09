import { GoogleGenAI } from "@google/genai";
import { type ScanResult } from '../types';

const getEcoTip = async (scanResult: ScanResult): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set.");
    return "ขอบคุณที่ช่วยรีไซเคิล! ทุกชิ้นมีค่าในการช่วยลดขยะและดูแลโลกของเรา";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const { bottles, cups, glass } = scanResult;
  
  if (bottles === 0 && cups === 0 && glass === 0) {
      return "เริ่มต้นได้ดี! ครั้งหน้าลองสแกนขวดหรือแก้วเพื่อสะสมคะแนนนะ";
  }

  const itemsDescription = [
    bottles > 0 ? `${bottles} ขวดพลาสติก` : '',
    cups > 0 ? `${cups} ถ้วย/แก้ว` : '',
    glass > 0 ? `${glass} ขวดแก้ว` : ''
  ].filter(Boolean).join(', ');

  const prompt = `ผู้ใช้เพิ่งรีไซเคิล ${itemsDescription} ผ่านแอปพลิเคชัน EcoPoint AI ของเรา
จงสร้างข้อความให้กำลังใจสั้นๆ และเป็นมิตรเป็นภาษาไทย พร้อมกับเคล็ดลับรักษ์โลกง่ายๆ ที่นำไปใช้ได้จริง 1 ข้อ
- ข้อความต้องสร้างสรรค์ ไม่ซ้ำซากจำเจ
- ทำให้ผู้ใช้อยากกลับมารีไซเคิลอีก
- ลงท้ายด้วยอิโมจิที่เกี่ยวข้อง
- ความยาวไม่เกิน 280 ตัวอักษร`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "ยอดเยี่ยม! การรีไซเคิลของคุณช่วยโลกได้มากเลย ลองพกขวดน้ำส่วนตัวเพื่อลดการใช้พลาสติกดูสิ! 텀블러";
  }
};

export default getEcoTip;