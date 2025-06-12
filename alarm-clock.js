// alarm-clock.js
// Este arquivo será fetchado e avaliado pelo seu HTML

/**
 * Solicita permissão ao usuário para exibir notificações desktop e as exibe.
 * @param {string} title - O título da notificação.
 * @param {string} body - O corpo (conteúdo) da notificação.
 */
function showDesktopNotification(title, body) {
    if (!("Notification" in window)) {
        console.warn("Este navegador não suporta notificações desktop.");
        return;
    }

    if (Notification.permission === "granted") {
        console.log("Permissão para notificações já concedida. Exibindo notificação...");
        new Notification(title, { body: body });
    } else if (Notification.permission === "denied") {
        console.warn("Permissão para notificações negada. Não é possível exibir.");
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Permissão para notificações concedida! Exibindo notificação...");
                new Notification(title, { body: body });
            } else if (permission === "denied") {
                console.warn("Permissão para notificações negada. Não é possível exibir.");
            } else {
                console.log("Permissão para notificações não foi concedida.");
            }
        }).catch(error => {
            console.error("Erro ao solicitar permissão para notificações:", error);
        });
    }
}


// Lógica do Despertador
document.addEventListener('DOMContentLoaded', () => {
    const alarmTimeInput = document.getElementById('alarmTime');
    const setAlarmButton = document.getElementById('setAlarmButton');
    const statusMessage = document.getElementById('status-message');
    const currentTimeDisplay = document.getElementById('current-time');

    let alarmSet = false;
    let alarmHour;
    let alarmMinute;
    let intervalId;

    function updateCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeDisplay.textContent = `Hora atual: ${hours}:${minutes}:${seconds}`;

        if (alarmSet && now.getHours() === alarmHour && now.getMinutes() === alarmMinute && now.getSeconds() === 0) {
            triggerAlarm();
            clearInterval(intervalId);
            alarmSet = false;
            statusMessage.textContent = 'Alarme disparado!';
            setAlarmButton.textContent = 'Definir Alarme';
        }
    }

    function setAlarm() {
        const timeValue = alarmTimeInput.value;
        if (!timeValue) {
            statusMessage.textContent = 'Por favor, defina uma hora para o alarme.';
            return;
        }

        const [hour, minute] = timeValue.split(':').map(Number);

        alarmHour = hour;
        alarmMinute = minute;
        alarmSet = true;
        
        const formattedAlarmTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        statusMessage.textContent = `Alarme definido para ${formattedAlarmTime}`;
        setAlarmButton.textContent = 'Alarme Definido (Clique para Cancelar)';

        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(updateCurrentTime, 1000);

        updateCurrentTime();

        // Dispara a notificação de confirmação usando a função compartilhada
        if (typeof showDesktopNotification === 'function') {
            showDesktopNotification("⏰ Alarme Definido!", `Seu alarme foi configurado para: ${formattedAlarmTime}`);
        } else {
            console.error("Função showDesktopNotification não encontrada.");
        }
    }

    function triggerAlarm() {
        console.log('Alarme tocando!');
        if (typeof showDesktopNotification === 'function') {
            showDesktopNotification(
                "🔔 Despertador!",
                "A hora que você definiu chegou: " + String(alarmHour).padStart(2, '0') + ":" + String(alarmMinute).padStart(2, '0')
            );
        } else {
            console.error("Função showDesktopNotification não encontrada.");
        }

        const audio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3');
        audio.play().catch(e => console.error("Erro ao tocar áudio:", e));

        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 5000);
    }

    setAlarmButton.addEventListener('click', () => {
        if (alarmSet) {
            clearInterval(intervalId);
            alarmSet = false;
            statusMessage.textContent = 'Alarme cancelado.';
            setAlarmButton.textContent = 'Definir Alarme';
        } else {
            setAlarm();
        }
    });

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    alarmTimeInput.value = `${hours}:${minutes}`;
    updateCurrentTime();
});
