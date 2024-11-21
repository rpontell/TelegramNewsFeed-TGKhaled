document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({ action: "getMessages" }, function(response) {
    console.log("Messaggi ricevuti:", response.messages);
    const messagesDiv = document.getElementById('messages');

    if (Array.isArray(response.messages)) {
      response.messages.forEach(message => {
        const messageElement = document.createElement('div');

        if (message.type === 'photo') {
          const imageElement = document.createElement('img');
          imageElement.src = message.url;
          messageElement.style.maxWidth = "100%";
          messageElement.appendChild(imageElement);

        } else if (message.type === 'video' || message.type === 'animation') {
          const videoElement = document.createElement('video');
          videoElement.controls = true;
          videoElement.src = message.url;
          //videoElement.style.maxWidth = "100%";
          messageElement.appendChild(videoElement);

        } else if (message.type === 'sticker') {
          const stickerElement = document.createElement('img');
          stickerElement.src = message.url;
          messageElement.appendChild(stickerElement);

        } else if (message.type === 'poll') {
          const pollQuestion = document.createElement('p');
          pollQuestion.textContent = `Sondaggio: ${message.question}`;
          messageElement.appendChild(pollQuestion);

          const optionsList = document.createElement('ul');
          message.options.forEach(option => {
            const optionItem = document.createElement('li');
            optionItem.textContent = option;
            optionsList.appendChild(optionItem);
          });
          messageElement.appendChild(optionsList);

        } else if (message.type === 'voice' || message.type === 'audio') {
          const audioElement = document.createElement('audio');
          audioElement.controls = true;
          audioElement.src = message.url;
          messageElement.appendChild(audioElement);

        }else if (message.type === 'file') {
          const fileLink = document.createElement('a');
          fileLink.href = message.url;
          fileLink.download = true;
          fileLink.textContent = 'Scarica file';
          messageElement.appendChild(fileLink);
          
        } else {
          const textElement = document.createElement('p');
          textElement.textContent = message.text;
          messageElement.appendChild(textElement);
        }

        messagesDiv.appendChild(messageElement);
      });
    } else {
      console.error("La risposta non contiene un array di messaggi");
    }
  });
});
