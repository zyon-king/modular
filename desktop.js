// notification-handler.js (seu arquivo JS externo)

/**
 * Solicita permissão ao usuário para exibir notificações desktop.
 * Retorna uma Promise que resolve com o status da permissão ('granted', 'denied', 'default').
 */
function requestNotificationPermission() {
  return new Promise((resolve, reject) => {
    // Verifica se o navegador suporta a API de Notificações
    if (!("Notification" in window)) {
      console.warn("Este navegador não suporta notificações desktop.");
      reject(new Error("Notificações não suportadas neste navegador."));
      return;
    }

    // Verifica o status atual da permissão
    if (Notification.permission === "granted") {
      console.log("Permissão para notificações já concedida.");
      resolve("granted");
    } else if (Notification.permission === "denied") {
      console.warn("Permissão para notificações já negada.");
      resolve("denied");
    } else {
      // Solicita a permissão
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("Permissão para notificações concedida!");
        } else if (permission === "denied") {
          console.warn("Permissão para notificações negada.");
        } else {
          console.log("Permissão para notificações não foi nem concedida nem negada (default).");
        }
        resolve(permission);
      }).catch(error => {
        console.error("Erro ao solicitar permissão para notificações:", error);
        reject(error);
      });
    }
  });
}

// Exemplo de como você chamaria a função em seu HTML ou outro script:
// (Você não precisaria incluir esta parte dentro do seu arquivo notification-handler.js
// se for chamá-la de outro lugar, mas é um exemplo de como usar a Promise)

/*
// Exemplo de uso em um botão:
document.addEventListener('DOMContentLoaded', () => {
  const notifyButton = document.getElementById('request-notify-permission');
  if (notifyButton) {
    notifyButton.addEventListener('click', () => {
      requestNotificationPermission()
        .then(permissionStatus => {
          if (permissionStatus === "granted") {
            console.log("Agora você pode exibir notificações!");
            // Exemplo: new Notification("Olá!", { body: "Esta é sua primeira notificação!" });
          } else if (permissionStatus === "denied") {
            console.warn("O usuário negou as notificações.");
          } else {
            console.log("O usuário não decidiu sobre as notificações.");
          }
        })
        .catch(error => {
          console.error("Erro ao solicitar permissão:", error);
        });
    });
  }
});
*/
