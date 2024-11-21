const TELEGRAM_API_TOKEN = '7781770552:AAGCFsa380r1Qbp4HyaMK6_pZA8HB9Ek2g4';
const CHANNEL_ID = '-1002379109528';

// Funzione per ottenere l'URL del file
async function getFileUrl(fileId) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/getFile?file_id=${fileId}`);
    const data = await response.json();

    if (data.ok) {
      const filePath = data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_API_TOKEN}/${filePath}`;
      console.log(`URL del file ottenuto per file_id ${fileId}:`, fileUrl);
      return fileUrl;
    } else {
      console.error("Errore nel recupero del percorso del file:", data.description);
      return null;
    }
  } catch (error) {
    console.error("Errore nella richiesta getFile:", error);
    return null;
  }
}

async function fetchTelegramMessages() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/getUpdates`);
    const data = await response.json();

    if (!data.result || data.result.length === 0) {
      console.log("Nessun aggiornamento nuovo ricevuto.");
      return [];
    }

    const messages = await Promise.all(data.result.map(async (update) => {
      const message = update.message;

      if (message.photo) {
        const fileId = message.photo.pop().file_id;
        const fileUrl = await getFileUrl(fileId);
        return { type: 'photo', url: fileUrl };

      } else if (message.sticker) {
        const fileId = message.sticker.file_id;
        const fileUrl = await getFileUrl(fileId);
        return { type: 'sticker', url: fileUrl };

      } else if (message.animation) {  // GIFs sono considerate animazioni
        const fileId = message.animation.file_id;
        const fileUrl = await getFileUrl(fileId);
        return { type: 'gif', url: fileUrl };

      } else if (message.video) {
        const fileId = message.video.file_id;
        const fileUrl = await getFileUrl(fileId);
        return { type: 'video', url: fileUrl };

      } else if (message.voice) {  // Messaggi vocali come audio
        const fileId = message.voice.file_id;
        const fileUrl = await getFileUrl(fileId);
        return { type: 'audio', url: fileUrl };

      }else if (message.audio) {  // Messaggi audio
        const fileId = message.audio.file_id;
        const fileUrl = await getFileUrl(fileId);
        return { type: 'audio', url: fileUrl };

      } else if (message.poll) {
        const options = message.poll.options.map(option => option.text);
        return { type: 'poll', question: message.poll.question, options: options };

      }else if (message.file) {  
        const fileId = message.file.file_id;
        const fileUrl = await getFileUrl(fileId);
        return { type: 'file', url: fileUrl };

      } else {
        return { type: 'text', text: message.text || '' };
      } 
    }));

    console.log("Messaggi elaborati:", messages);
    return messages;
  } catch (error) {
    console.error("Errore nel recupero dei messaggi:", error);
    return [];
  }
}

// Invia i messaggi al popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getMessages") {
    fetchTelegramMessages().then(messages => {
      sendResponse({ messages });
    }).catch(error => {
      console.error("Errore durante l'invio dei messaggi:", error);
      sendResponse({ messages: [] });
    });
    return true; // Keeps the message channel open for async response
  }
});
