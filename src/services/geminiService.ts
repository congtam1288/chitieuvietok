import { GoogleGenAI } from '@google/genai';
import { Category, Transaction } from '../types';

export interface AIAnalysisResult {
  summary: string;
  insights: string[];
  savingTips: string[];
  categoryAlerts: string[];
}

export async function analyzeSpendingWithGemini(
  apiKey: string,
  transactions: Transaction[],
  categories: Category[],
  monthStr: string
): Promise<AIAnalysisResult | null> {
  if (!apiKey || transactions.length === 0) {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Bạn là chuyên gia tài chính cá nhân cao cấp của ứng dụng CHI TIÊU VIỆT.
Hãy phân tích danh sách giao dịch sau trong tháng ${monthStr} và đưa ra phản hồi định dạng JSON:

Dữ liệu giao dịch:
${JSON.stringify(
  transactions.map((t) => ({
    title: t.title,
    type: t.type,
    amount: t.amount,
    category: categories.find((c) => c.id === t.categoryId)?.name || t.categoryId,
    date: t.date
  }))
)}

Hãy trả về JSON theo cấu trúc sau (không kèm markdown):
{
  "summary": "Tóm tắt ngắn gọn 1-2 câu về tình hình tài chính tháng",
  "insights": ["Điểm nổi bật 1", "Điểm nổi bật 2"],
  "savingTips": ["Lời khuyên tiết kiệm cụ thể 1", "Lời khuyên 2"],
  "categoryAlerts": ["Cảnh báo nếu danh mục nào chi vượt mức hợp lý"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const responseText = response.text || '';
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini AI Analysis Error:', error);
    return null;
  }
}

export async function parseTransactionWithGemini(
  apiKey: string,
  userInput: string,
  categories: Category[]
): Promise<{ title: string; amount: number; type: 'expense' | 'income'; categoryId: string } | null> {
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Phân tích câu nhập giao dịch tiếng Việt sau đây thành đối tượng JSON:
"${userInput}"

Danh sách danh mục có sẵn:
${categories.map((c) => `${c.id}: ${c.name} (${c.type})`).join(', ')}

Trả về duy nhất JSON:
{
  "title": "Tên giao dịch ngắn gọn",
  "amount": 10000 (số nguyên tiền VNĐ),
  "type": "expense" hoặc "income",
  "categoryId": "mã danh mục phù hợp nhất từ danh sách trên"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Gemini Voice/Text parsing error:', err);
    return null;
  }
}
