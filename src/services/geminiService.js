import { GoogleGenerativeAI } from '@google/generative-ai';
import { maskSensitiveData } from '../utils/maskData';

const clients = {};

export const getGeminiClient = (apiKey) => {
  if (!apiKey) return null;
  if (!clients[apiKey]) {
    clients[apiKey] = new GoogleGenerativeAI(apiKey);
  }
  return clients[apiKey];
};


export const buildDataSummary = (parsedData, analyzedData, maskPersonalInfo) => {
  if (!parsedData || !analyzedData) return "Không có dữ liệu.";
  
  let summary = `Tổng quan dữ liệu:\n`;
  summary += `- Tổng số cột: ${analyzedData.totalColumns}\n`;
  summary += `- Tổng số bản ghi (dòng): ${analyzedData.totalRows}\n\n`;
  
  summary += `Cấu trúc các cột và mẫu dữ liệu (5 giá trị đầu tiên):\n`;
  
  const headers = parsedData.headers;
  let rowsToAnalyze = parsedData.rows.slice(0, 50); // Limit rows for AI summary
  
  if (maskPersonalInfo && parsedData.columnMeta) {
     rowsToAnalyze = maskSensitiveData(rowsToAnalyze, headers, parsedData.columnMeta);
  }

  parsedData.columnMeta.forEach(col => {
    summary += `- Cột "${col.name}" (Kiểu: ${col.type}, Số giá trị unique: ${col.uniqueCount})\n`;
    const samples = col.sampleValues.slice(0, 5).join(' | ');
    summary += `  Mẫu: [${samples}]\n`;
    
    // Add stats if numeric
    if (analyzedData.numericStats && analyzedData.numericStats[col.name]) {
      const stats = analyzedData.numericStats[col.name];
      summary += `  Thống kê: Tổng=${stats.sum}, TB=${stats.average.toFixed(2)}, Min=${stats.min}, Max=${stats.max}\n`;
    }
    
    // Add categorical info if applicable
    if (analyzedData.categoricalAnalysis && analyzedData.categoricalAnalysis[col.name]) {
       const top = analyzedData.categoricalAnalysis[col.name].top10;
       if (top && top.length > 0) {
         summary += `  Top giá trị: ${top.slice(0,3).map(t => `${t.value}(${t.count})`).join(', ')}\n`;
       }
    }
  });
  
  return summary;
};

export const generateAIReport = async (dataSummary, apiKey) => {
  try {
    const genAI = getGeminiClient(apiKey);
    if (!genAI) {
      return { error: true, message: "Vui lòng cấu hình API Key trong Cài đặt." };
    }
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      systemInstruction: "Bạn là chuyên gia Business Intelligence hàng đầu người Việt Nam. Nhiệm vụ của bạn là phân tích dữ liệu và tạo báo cáo quản trị chuyên sâu, khách quan, và dễ hiểu."
    });

    const prompt = `
Bạn là chuyên gia Business Intelligence.
Hãy phân tích bộ dữ liệu sau và tạo báo cáo quản trị chi tiết bằng tiếng Việt.

Báo cáo gồm các phần:
1. 📋 Executive Summary (Tóm tắt điều hành)
2. 📊 KPI nổi bật
3. 📈 Xu hướng dữ liệu
4. ⚠️ Điểm bất thường (Anomalies)
5. 💡 Insight quan trọng
6. 🔴 Rủi ro
7. 🟢 Cơ hội
8. 📝 Khuyến nghị
9. 🎯 Action Plan
10. 📌 Kết luận

Dữ liệu tổng hợp:
${dataSummary}

Hãy trả lời bằng Markdown với heading, bullet points, bold text, và emoji phù hợp. Trình bày đẹp, dễ đọc, mang tính thực tiễn cao dựa trên dữ liệu.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    let message = `Chi tiết lỗi: ${error.message}`;
    if (error.message?.includes('429')) message = "Đã vượt quá giới hạn gọi API (Rate Limit). Vui lòng thử lại sau.";
    if (error.message?.includes('API key not valid')) message = "API Key không hợp lệ. Vui lòng kiểm tra lại.";
    return { error: true, message };
  }
};

export const chatWithData = async (question, dataSummary, chatHistory, apiKey) => {
  try {
    const genAI = getGeminiClient(apiKey);
    if (!genAI) {
      return { error: true, message: "Vui lòng cấu hình API Key trong Cài đặt." };
    }
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      systemInstruction: "Bạn là trợ lý phân tích dữ liệu AI thông minh. Nhiệm vụ của bạn là trả lời các câu hỏi của người dùng dựa trên dữ liệu được cung cấp. Trả lời ngắn gọn, chính xác, có số liệu cụ thể chứng minh. Nếu câu hỏi không liên quan đến dữ liệu, hãy lịch sự từ chối và yêu cầu hỏi về dữ liệu. Format câu trả lời bằng Markdown đẹp mắt."
    });

    // Convert our chat history format to Gemini format
    const history = chatHistory.slice(-10).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start chat with history
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `Dưới đây là bối cảnh dữ liệu hiện tại tôi đang xem:\n\n${dataSummary}\n\nHãy nhớ các thông tin này để trả lời câu hỏi của tôi.` }]
        },
        {
          role: "model",
          parts: [{ text: `Tuyệt vời, tôi đã nắm được thông tin dữ liệu gồm ${dataSummary.split('\n')[2] || 'nhiều'} bản ghi và sẵn sàng trả lời các câu hỏi phân tích của bạn.` }]
        },
        ...history
      ]
    });

    const result = await chat.sendMessage(question);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    let message = `Đã xảy ra lỗi khi chat với AI: ${error.message}`;
    if (error.message?.includes('429')) message = "Đã vượt quá giới hạn gọi API (Rate Limit). Vui lòng thử lại sau.";
    return { error: true, message };
  }
};
