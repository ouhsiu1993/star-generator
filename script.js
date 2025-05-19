// 輔助函數：獲取環境變量
function getEnv(key, defaultValue = '') {
  return window.env && window.env[key] ? window.env[key] : defaultValue;
}

// 新增全局變量來追蹤狀態
let hasGeneratedResults = false;  // 是否已生成結果
let isGenerating = false;         // 是否正在生成結果

// 設置字數計數功能
function setupCounter(inputId, countId, maxLength = 300) {
  const textarea = document.getElementById(inputId);
  const counter = document.getElementById(countId);

  textarea.addEventListener("input", function () {
    const length = this.value.length;
    counter.textContent = length;

    if (length > maxLength * 0.8) {
      counter.parentElement.classList.add("warning");
    } else {
      counter.parentElement.classList.remove("warning");
    }

    // 當有輸入時移除錯誤提示
    if (length > 0) {
      this.classList.remove("input-error");
      const errorElement = this.parentElement.querySelector(".field-error");
      if (errorElement) errorElement.style.display = "none";
    }

    // 自動調整高度
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });
}

// 更新輸出框字數計數
function updateOutputCounter(outputId, counterId) {
  const outputElement = document.getElementById(outputId);
  const counter = document.getElementById(counterId);
  
  if (outputElement && counter) {
    if (!outputElement.classList.contains('empty')) {
      counter.textContent = outputElement.textContent.length;
    } else {
      counter.textContent = "0";
    }
  }
}

// 設置錯誤提示元素
function setupErrorMessages() {
  const inputGroups = document.querySelectorAll(".input-group");

  inputGroups.forEach((group) => {
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = "此欄位為必填項";
    group.appendChild(errorDiv);
  });
}

// 驗證所有欄位
function validateFields() {
  const situation = document.getElementById("situation");
  const task = document.getElementById("task");
  const action = document.getElementById("action");
  const result = document.getElementById("result");
  const storeCategory = document.getElementById("store-category");

  let isValid = true;

  // 檢查每個欄位
  [situation, task, action, result].forEach((field) => {
    if (!field.value.trim()) {
      field.classList.add("input-error");
      const errorElement = field.parentElement.querySelector(".field-error");
      errorElement.style.display = "block";
      isValid = false;
    } else {
      field.classList.remove("input-error");
      const errorElement = field.parentElement.querySelector(".field-error");
      errorElement.style.display = "none";
    }
  });
  
  // 檢查商店類別是否已選擇
  if (!storeCategory.value) {
    storeCategory.classList.add("input-error");
    document.getElementById("error").textContent = "請選擇商店類別";
    document.getElementById("error").style.display = "block";
    isValid = false;
  } else {
    storeCategory.classList.remove("input-error");
  }

  return isValid;
}

// 設置複製按鈕功能
function setupCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const text = document.getElementById(targetId).textContent;

      if (
        text &&
        !document.getElementById(targetId).classList.contains("empty")
      ) {
        navigator.clipboard.writeText(text).then(() => {
          // 臨時更改按鈕文字
          const originalHtml = this.innerHTML;
          this.innerHTML = '<i class="fas fa-check"></i> 已複製';

          setTimeout(() => {
            this.innerHTML = originalHtml;
          }, 2000);
        });
      }
    });
  });
}

// 設置清除按鈕功能
function setupClearButton() {
  document.getElementById("clear").addEventListener("click", function(event) {
    // 如果已有生成結果，則顯示確認提示
    if (hasGeneratedResults && !confirm("結果將不會保存，是否確定清除所有內容？")) {
      return; // 用戶取消操作
    }
    
    // 以下是原有的清除代碼
    document.getElementById("situation").value = "";
    document.getElementById("task").value = "";
    document.getElementById("action").value = "";
    document.getElementById("result").value = "";
    
    // 重置計數器
    document.getElementById("situation-count").textContent = "0";
    document.getElementById("task-count").textContent = "0";
    document.getElementById("action-count").textContent = "0";
    document.getElementById("result-count").textContent = "0";
    
    // 重置輸出計數器
    document.getElementById("situation-output-count").textContent = "0";
    document.getElementById("task-output-count").textContent = "0";
    document.getElementById("action-output-count").textContent = "0";
    document.getElementById("result-output-count").textContent = "0";

    // 清除所有輸出
    const outputs = document.querySelectorAll(".output");
    outputs.forEach((output) => {
      output.classList.add("empty");
    });

    document.getElementById("situation-output").textContent =
      "AI將在這裡生成優化後的情境描述...";
    document.getElementById("task-output").textContent =
      "AI將在這裡生成優化後的任務描述...";
    document.getElementById("action-output").textContent =
      "AI將在這裡生成優化後的行動描述...";
    document.getElementById("result-output").textContent =
      "AI將在這裡生成優化後的結果描述...";

    // 隱藏狀態消息
    document.getElementById("error").style.display = "none";
    document.getElementById("success").style.display = "none";

    // 移除所有警告和錯誤標記
    document.querySelectorAll(".counter").forEach((counter) => {
      counter.classList.remove("warning");
    });

    document.querySelectorAll("textarea").forEach((textarea) => {
      textarea.classList.remove("input-error");
    });
    
    document.getElementById("store-category").classList.remove("input-error");

    document.querySelectorAll(".field-error").forEach((error) => {
      error.style.display = "none";
    });
    
    // 清除後重置狀態
    hasGeneratedResults = false;
    
    // 將生成按鈕文字重置為"生成STAR報告"
    document.getElementById("generate").innerHTML =
      '<i class="fas fa-magic"></i> 生成STAR報告';
  });
}

// Token 使用情況
let tokenUsage = {
  prompt: 0,
  completion: 0,
  used: 0,
  total: 1000000,
};

// 更新token使用情況顯示
function updateTokenUsageDisplay() {
  const tokenUsageElement = document.getElementById("tokenUsage");
  if (tokenUsageElement) {
    tokenUsageElement.innerHTML = `
      <div class="token-detail">輸入: ${tokenUsage.prompt.toLocaleString()}</div>
      <div class="token-detail">輸出: ${tokenUsage.completion.toLocaleString()}</div>
      <div class="token-total">總計Token數: ${tokenUsage.used.toLocaleString()}/${tokenUsage.total.toLocaleString()}</div>
    `;

    // 根據使用量設置顯示顏色
    if (tokenUsage.used > tokenUsage.total * 0.9) {
      tokenUsageElement.style.color = "var(--danger)"; // 接近限制時顯示紅色
    } else if (tokenUsage.used > tokenUsage.total * 0.7) {
      tokenUsageElement.style.color = "var(--warning)"; // 超過70%顯示橙色
    } else {
      tokenUsageElement.style.color = "var(--success)"; // 正常範圍顯示綠色
    }
  }
}

// Google Sheets 整合
const GOOGLE_SHEET_WEBHOOK_URL = getEnv('GOOGLE_SHEET_WEBHOOK_URL', '');

// 將資料記錄到Google Sheets
async function logToGoogleSheet(data) {
  if (!GOOGLE_SHEET_WEBHOOK_URL) {
    console.warn('未設置 Google Sheets Webhook URL');
    return false;
  }

  try {
    const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors", // 必要，因為Google Apps Script不支援CORS
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("數據已成功記錄到Google Sheets");
    return true;
  } catch (error) {
    console.error("記錄到Google Sheets時發生錯誤:", error);
    return false;
  }
}

// 呼叫Worker API
async function callWorker(userInput) {
  // 重置token使用量
  tokenUsage.prompt = 0;
  tokenUsage.completion = 0;
  tokenUsage.used = 0;
  updateTokenUsageDisplay();

  const storeCategory = document.getElementById("store-category").value;
  
  try {
    console.log("開始呼叫 API...");
    
    // 直接使用相對路徑，不再依賴環境變數
    const res = await fetch('/api/openai', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: getEnv('OPENAI_MODEL', 'gpt-4.1'),
        messages: [
          {
            role: "system",
            content:
              `你是一位擅長撰寫 STAR 工作報告的顧問，協助機場免稅店${storeCategory}部門員工用自然、真實、有條理的方式撰寫工作回顧，語言使用中文，風格清楚、具體，不要過於誇大，適合上交給主管評核。每個部分回覆的字數必須在100-150字之間，回覆內容不需要說明"我是${storeCategory}員工等自我介紹"。請根據使用者提供的內容生成完整報告。請在回覆中為每個部分添加標記，使用[S]標記情境部分開始，[T]標記任務部分開始，[A]標記行動部分開始，[R]標記結果部分開始。例如：'[S]近期部門業績下滑...'`,
          },
          {
            role: "user",
            content: userInput,
          },
        ],
      }),
    });

    console.log("API 響應狀態:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API 錯誤響應:", errorText);
      throw new Error(`API請求失敗: ${res.status}`);
    }

    const data = await res.json();
    console.log("API 響應成功");

    // 捕獲並更新token使用情況
    if (data.usage) {
      tokenUsage.prompt = data.usage.prompt_tokens || 0;
      tokenUsage.completion = data.usage.completion_tokens || 0;
      tokenUsage.used = data.usage.total_tokens || 0;
      updateTokenUsageDisplay();
    }

    return data.choices?.[0]?.message?.content || "無法生成回應";
  } catch (error) {
    console.error("API 呼叫錯誤:", error);
    throw error;
  }
}

// 重新整理頁面前的確認功能
window.addEventListener('beforeunload', function(e) {
  if (hasGeneratedResults || isGenerating) {
    // 顯示確認提示 (舊版瀏覽器可能會顯示自定義消息，新版瀏覽器通常會顯示標準消息)
    const confirmationMessage = "結果將不會保存，是否確定離開？";
    e.returnValue = confirmationMessage;  // Chrome, Firefox, IE
    return confirmationMessage;           // Safari, Firefox
  }
});

// 初始化設置
function initializeApp() {
  // 設置錯誤提示元素
  setupErrorMessages();

  // 設置所有計數器
  setupCounter("situation", "situation-count");
  setupCounter("task", "task-count");
  setupCounter("action", "action-count");
  setupCounter("result", "result-count");
  
  // 設置輸出框字數計數器
  updateOutputCounter("situation-output", "situation-output-count");
  updateOutputCounter("task-output", "task-output-count");
  updateOutputCounter("action-output", "action-output-count");
  updateOutputCounter("result-output", "result-output-count");

  // 設置複製按鈕
  setupCopyButtons();

  // 設置清除按鈕
  setupClearButton();

  // 生成按鈕事件設置
  document.getElementById("generate").addEventListener("click", generateReport);
}

// 檢查環境變量並初始化應用
document.addEventListener("DOMContentLoaded", function() {
  if (window.env) {
    // 環境變量已加載
    initializeApp();
  } else {
    // 等待環境變量加載
    document.addEventListener('envLoaded', initializeApp);
    
    // 如果5秒後環境變量還沒加載，使用默認值初始化
    setTimeout(function() {
      if (!window.env) {
        console.warn('未檢測到環境變量，使用默認值初始化應用');
        window.env = {};
        initializeApp();
      }
    }, 5000);
  }
});

// 生成報告的主要函數
async function generateReport() {
  const situation = document.getElementById("situation").value;
  const task = document.getElementById("task").value;
  const action = document.getElementById("action").value;
  const result = document.getElementById("result").value;
  const storeCategory = document.getElementById("store-category").value;

  // 如果已有生成結果，並且用戶點擊"再次生成"，顯示確認提示
  if (hasGeneratedResults && !confirm("結果將不會保存，是否確定重新生成？")) {
    return; // 用戶取消操作
  }

  // 1. 鎖住「分析／重新分析」按鈕、清除按鈕
  document.getElementById("generate").disabled = true;
  document.getElementById("clear").disabled = true;
  // 如果還有「複製」按鈕也一併鎖住
  document.querySelectorAll(".copy-btn")
          .forEach(btn => btn.disabled = true);

  // 2. 鎖住所有輸入框（textarea）
  document.querySelectorAll("textarea")
          .forEach(inp => inp.disabled = true);

  // 3. 鎖住商店類別下拉選單
  document.getElementById("store-category").disabled = true;

  // 驗證所有欄位是否已填寫
  if (!validateFields()) {
    setTimeout(() => {
      document.getElementById("error").style.display = "none";
    }, 3000);
    
    // 如果驗證失敗，解鎖所有控件
    document.getElementById("generate").disabled = false;
    document.getElementById("clear").disabled = false;
    document.querySelectorAll(".copy-btn").forEach(btn => btn.disabled = false);
    document.querySelectorAll("textarea").forEach(inp => inp.disabled = false);
    document.getElementById("store-category").disabled = false;
    
    return;
  }

  // 設置生成狀態
  isGenerating = true;

  // 顯示載入中
  document.getElementById("loading").style.display = "flex";
  document.getElementById("error").style.display = "none";
  document.getElementById("success").style.display = "none";

  // 準備所有輸出區域
  const situationOutput = document.getElementById("situation-output");
  const taskOutput = document.getElementById("task-output");
  const actionOutput = document.getElementById("action-output");
  const resultOutput = document.getElementById("result-output");

  // 將所有輸出設置為"AI思考中..."
  situationOutput.classList.remove("empty");
  situationOutput.textContent = "AI思考中...";

  taskOutput.classList.remove("empty");
  taskOutput.textContent = "AI思考中...";

  actionOutput.classList.remove("empty");
  actionOutput.textContent = "AI思考中...";

  resultOutput.classList.remove("empty");
  resultOutput.textContent = "AI思考中...";

  // 添加生成中特效
  document.body.classList.add("generating");

  try {
    // 構建請求內容（一次性包含所有部分）
    let promptContent = `請幫我優化以下${storeCategory}部門員工的STAR報告內容，每個部分回覆字數限制在100-150字之間：\n\n`;

    promptContent += `情境(Situation)：${situation}\n\n`;
    promptContent += `任務(Task)：${task}\n\n`;
    promptContent += `行動(Action)：${action}\n\n`;
    promptContent += `結果(Result)：${result}\n\n`;

    promptContent +=
      "請分別優化每個部分，每部分字數控制在100-150字之間，並在回覆中使用標記'[S]'、'[T]'、'[A]'、'[R]'來區分各部分開始。";

    // 開始時間
    const startTime = new Date();

    // 只呼叫一次API，獲取所有結果
    const fullResponse = await callWorker(promptContent);

    // 結束時間
    const endTime = new Date();
    const processingTime = (endTime - startTime) / 1000; // 轉換為秒

    // 解析API回覆，分離每個部分
    const parts = parseStarResponse(fullResponse);

    // 更新UI
    if (parts.situation) {
      situationOutput.textContent = parts.situation;
    } else {
      situationOutput.textContent = "無法生成情境部分";
    }

    if (parts.task) {
      taskOutput.textContent = parts.task;
    } else {
      taskOutput.textContent = "無法生成任務部分";
    }

    if (parts.action) {
      actionOutput.textContent = parts.action;
    } else {
      actionOutput.textContent = "無法生成行動部分";
    }

    if (parts.result) {
      resultOutput.textContent = parts.result;
    } else {
      resultOutput.textContent = "無法生成結果部分";
    }
    
    // 更新輸出框字數計數
    updateOutputCounter("situation-output", "situation-output-count");
    updateOutputCounter("task-output", "task-output-count");
    updateOutputCounter("action-output", "action-output-count");
    updateOutputCounter("result-output", "result-output-count");

    // 記錄到Google Sheets
    const logData = {
      timestamp: new Date().toISOString(),
      processingTime: processingTime,
      storeCategory: storeCategory,
      inputData: {
        situation: situation,
        task: task,
        action: action,
        result: result,
      },
      outputData: {
        situation: parts.situation,
        task: parts.task,
        action: parts.action,
        result: parts.result,
      },
    };

    // 異步記錄到Google Sheets（不等待）
    logToGoogleSheet(logData);

    // 更改生成按鈕文字為"再次生成"
    document.getElementById("generate").innerHTML =
      '<i class="fas fa-magic"></i> 再次生成';

    // 設置已生成結果狀態
    hasGeneratedResults = true;

    // 顯示成功訊息
    document.getElementById("success").style.display = "block";
    setTimeout(() => {
      document.getElementById("success").style.display = "none";
    }, 5000);
  } catch (error) {
    console.error("錯誤:", error);
    document.getElementById("error").textContent = `發生錯誤: ${error.message}`;
    document.getElementById("error").style.display = "block";
  } finally {
    document.getElementById("loading").style.display = "none";
    document.body.classList.remove("generating");

    // 啟用按鈕
    document.getElementById("generate").disabled = false;
    document.getElementById("clear").disabled = false;
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.disabled = false;
    });

    // 解鎖所有輸入框
    document.querySelectorAll("textarea")
            .forEach(inp => inp.disabled = false);

    // 解鎖下拉選單
    document.getElementById("store-category").disabled = false;
    
    // 重置生成中狀態
    isGenerating = false;
  }
}

// 解析API回覆，分離S/T/A/R四個部分
function parseStarResponse(response) {
  const result = {
    situation: "",
    task: "",
    action: "",
    result: "",
  };

  // 首先嘗試使用標記來分割內容
  const situationMatch = response.match(/\[S\]([\s\S]*?)(?=\[T\]|$)/);
  const taskMatch = response.match(/\[T\]([\s\S]*?)(?=\[A\]|$)/);
  const actionMatch = response.match(/\[A\]([\s\S]*?)(?=\[R\]|$)/);
  const resultMatch = response.match(/\[R\]([\s\S]*?)(?=$)/);

  if (situationMatch) result.situation = situationMatch[1].trim();
  if (taskMatch) result.task = taskMatch[1].trim();
  if (actionMatch) result.action = actionMatch[1].trim();
  if (resultMatch) result.result = resultMatch[1].trim();

  // 如果沒有找到標記，嘗試使用關鍵詞分割
  if (!situationMatch && !taskMatch && !actionMatch && !resultMatch) {
    const lines = response.split("\n");
    let currentSection = null;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes("情境") || lowerLine.includes("situation")) {
        currentSection = "situation";
        continue;
      } else if (lowerLine.includes("任務") || lowerLine.includes("task")) {
        currentSection = "task";
        continue;
      } else if (lowerLine.includes("行動") || lowerLine.includes("action")) {
        currentSection = "action";
        continue;
      } else if (lowerLine.includes("結果") || lowerLine.includes("result")) {
        currentSection = "result";
        continue;
      }

      if (currentSection && line.trim()) {
        result[currentSection] += line + "\n";
      }
    }

    // 修整每個部分
    result.situation = result.situation.trim();
    result.task = result.task.trim();
    result.action = result.action.trim();
    result.result = result.result.trim();
  }

  // 如果解析失敗，直接返回完整回覆
  if (!result.situation && !result.task && !result.action && !result.result) {
    // 嘗試分割整段落
    const paragraphs = response.split("\n\n").filter((p) => p.trim());
    if (paragraphs.length >= 4) {
      result.situation = paragraphs[0].trim();
      result.task = paragraphs[1].trim();
      result.action = paragraphs[2].trim();
      result.result = paragraphs[3].trim();
    } else {
      // 如果無法識別各個部分，均分回覆內容
      result.situation = response;
      result.task = response;
      result.action = response;
      result.result = response;
    }
  }

  return result;
}