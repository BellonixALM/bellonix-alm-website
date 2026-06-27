/**
 * GOOGLE APPS SCRIPT - BACKEND FOR BELLONIX ALM REVIEWS
 * ====================================================
 * Цей скрипт служить базою даних для сайту та бота. Він безкоштовно розміщується
 * у вашому Google Drive і зв'язується з Google Таблицею.
 * 
 * ЯК НАЛАШТУВАТИ:
 * 1. Створіть нову Google Таблицю на Google Диску.
 * 2. У першому рядку таблиці (стовпчики A-F) створіть наступні заголовки:
 *    A: ID | B: Name | C: Company | D: Rating | E: Text | F: Status | G: Timestamp
 * 3. Перейдіть у меню "Розширення" -> "Apps Script".
 * 4. Вставте туди цей код.
 * 5. Вкажіть ваш Telegram Bot Token та ADMIN_ID у конфігурації нижче.
 * 6. Натисніть кнопку "Розгорнути" (Deploy) -> "Нове розгортання" (New deployment).
 * 7. Оберіть тип: "Веб-додаток" (Web app).
 * 8. У полі "Хто має доступ" оберіть: "Усі" (Anyone) — це важливо для доступу сайту.
 * 9. Скопіюйте отриману адресу URL веб-додатку і пропишіть її у .env бота та в app.js сайту.
 */

const TELEGRAM_BOT_TOKEN = "8923736076:AAG9rKK-Qx37I6lws4fehlOWsprBW_tFIpA";
const ADMIN_CHAT_ID = "1931242904"; // ADMIN_ID для модерації

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const reviews = [];
  
  // Пропускаємо перший рядок із заголовками
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Повертаємо лише схвалені відгуки
    if (row[5] === 'approved') {
      reviews.push({
        id: row[0],
        name: row[1],
        company: row[2],
        rating: row[3],
        text: row[4]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(reviews))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*"); // Для крос-доменних запитів на сайті
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Якщо прийшов запит на модерацію чи видалення від бота
    if (params.action === 'approve' || params.action === 'reject' || params.action === 'delete') {
      const reviewId = params.id;
      let newStatus = 'rejected';
      if (params.action === 'approve') newStatus = 'approved';
      if (params.action === 'delete') newStatus = 'deleted';
      const data = sheet.getDataRange().getValues();
      let found = false;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === reviewId) {
          sheet.getRange(i + 1, 6).setValue(newStatus); // Оновлюємо статус
          found = true;
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: found, message: found ? "Status updated" : "ID not found" }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader("Access-Control-Allow-Origin", "*");
    }
    
    // Звичайне створення відгуку (з сайту)
    const reviewId = "rev_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
    const name = params.name || "Анонім";
    const company = params.company || "";
    const rating = params.rating || 5;
    const text = params.text || "";
    const status = "pending"; // Чекає модерації
    const timestamp = new Date();
    
    // Записуємо в таблицю
    sheet.appendRow([reviewId, name, company, rating, text, status, timestamp]);
    
    // Відправляємо сповіщення адміну в Telegram
    sendModerationAlert(reviewId, name, company, rating, text);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, id: reviewId }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

// Функція надсилання картки модерації адміністратору
function sendModerationAlert(id, name, company, rating, text) {
  const url = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage";
  const stars = "⭐️".repeat(rating);
  const message = "💬 *Новий відгук на модерацію з сайту!*\n\n" +
                  "👤 *Автор:* " + name + " (" + (company || "без компанії") + ")\n" +
                  "⭐ *Оцінка:* " + rating + "/5 " + stars + "\n" +
                  "📝 *Текст:* \"" + text + "\"";
                  
  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Опублікувати", callback_data: "mod_approve_" + id },
        { text: "❌ Відхилити", callback_data: "mod_reject_" + id }
      ]
    ]
  };
  
  const payload = {
    chat_id: ADMIN_CHAT_ID,
    text: message,
    parse_mode: "Markdown",
    reply_markup: JSON.stringify(keyboard)
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  UrlFetchApp.fetch(url, options);
}
