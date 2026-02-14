
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getHealthAdvice = async (prompt: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `当前用户状态: ${context}\n\n用户消息: ${prompt}`,
      config: {
        systemInstruction: "你是一个充满活力、幽默且专业的健康教练。你说话风格活泼，经常使用颜文字（如 (๑•̀ㅂ•́)و✧）。你的任务是帮助用户养成好习惯并戒烟。建议要科学但有趣。如果用户提到烟瘾，给他们一些有趣的‘脑洞’转移法，比如‘去数数邻居家的瓷砖’或者‘做一个1分钟的表情包模仿’。始终用中文回复。",
      },
    });
    return response.text || "哎呀，我的元气接收器出故障了，但你一定要坚持住哦！加油！";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "网络开小差了，但你的健康不准开小差！记得多喝水哟~";
  }
};

export const getDailyInspiration = async (stats: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `当前进度: ${stats}。请给我一句非常简短（15字以内）、幽默且有动力的中文每日寄语。`,
      config: {
        systemInstruction: "你是一个金句频出的幽默教练。语气要像好朋友一样。",
      },
    });
    return response.text;
  } catch (error) {
    return "每一口白开水，都是在给身体洗澡！";
  }
};
