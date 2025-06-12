// notification-handler.js (seu arquivo JS externo)

/**
 * Solicita permissão ao usuário para exibir notificações desktop.
 * Retorna uma Promise que resolve com o status da permissão ('granted', 'denied', 'default').
 */
// desktop-notifications.js

/**
 * Solicita permissão ao usuário para exibir notificações desktop e as exibe.
 * @param {string} title - O título da notificação.
 * @param {string} body - O corpo (conteúdo) da notificação.
 */
function showDesktopNotification(title, body) {
    // Verifica se as notificações são suportadas
    if (!("Notification" in window)) {
        console.warn("Este navegador não suporta notificações desktop.");
        // Opcional: alert("Seu navegador não suporta notificações desktop.");
        return;
    }

    // Verifica a permissão atual
    if (Notification.permission === "granted") {
        console.log("Permissão para notificações já concedida. Exibindo notificação...");
        new Notification(title, { body: body });
    } else if (Notification.permission === "denied") {
        console.warn("Permissão para notificações negada. Não é possível exibir.");
        // Opcional: alert("Permissão para notificações foi negada. Por favor, altere as configurações do seu navegador para permiti-las.");
    } else {
        // Solicita permissão se ainda não foi concedida nem negada
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Permissão para notificações concedida! Exibindo notificação...");
                new Notification(title, { body: body });
            } else if (permission === "denied") {
                console.warn("Permissão para notificações negada. Não é possível exibir.");
                // Opcional: alert("Você negou a permissão para notificações.");
            } else {
                console.log("Permissão para notificações não foi concedida.");
                // Opcional: alert("A permissão para notificações não foi concedida.");
            }
        }).catch(error => {
            console.error("Erro ao solicitar permissão para notificações:", error);
        });
    }
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
