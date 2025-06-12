// alarm-clock.js

document.addEventListener('DOMContentLoaded', () => {
    const alarmTimeInput = document.getElementById('alarmTime');
    const setAlarmButton = document.getElementById('setAlarmButton');
    const statusMessage = document.getElementById('status-message');
    const currentTimeDisplay = document.getElementById('current-time');

    let alarmSet = false;
    let alarmHour;
    let alarmMinute;
    let intervalId; // Para armazenar o ID do setInterval

    // Função para atualizar a hora atual exibida e verificar o alarme
    function updateCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeDisplay.textContent = `Hora atual: ${hours}:${minutes}:${seconds}`;

        if (alarmSet && now.getHours() === alarmHour && now.getMinutes() === alarmMinute && now.getSeconds() === 0) {
            triggerAlarm();
            // Para o alarme após a primeira vez que toca
            clearInterval(intervalId);
            alarmSet = false;
            statusMessage.textContent = 'Alarme disparado!';
            setAlarmButton.textContent = 'Definir Alarme'; // Resetar o botão
        }
    }

    // Função para definir o alarme
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
        statusMessage.textContent = `Alarme definido para ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        setAlarmButton.textContent = 'Alarme Definido (Clique para Cancelar)';

        // Limpa qualquer intervalo anterior para evitar múltiplos alarmes
        if (intervalId) {
            clearInterval(intervalId);
        }
        // Verifica a cada segundo
        intervalId = setInterval(updateCurrentTime, 1000);

        // Exibe a hora atual imediatamente
        updateCurrentTime();
    }

    // Função para disparar o alarme (chamando a notificação)
    function triggerAlarm() {
        console.log('Alarme tocando!');
        // Chama a função do seu script de notificação externo
        if (typeof showDesktopNotification === 'function') {
            showDesktopNotification(
                "🔔 Despertador!",
                "A hora que você definiu chegou: " + String(alarmHour).padStart(2, '0') + ":" + String(alarmMinute).padStart(2, '0')
            );
        } else {
            console.error("Função showDesktopNotification não encontrada. Verifique se desktop-notifications.js está carregado.");
        }


        // Opcional: Adicionar um som de alarme
        const audio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3');
        audio.play().catch(e => console.error("Erro ao tocar áudio:", e));

        // Para o som após alguns segundos
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 5000); // Toca por 5 segundos
    }

    // Event Listener para o botão Definir Alarme
    setAlarmButton.addEventListener('click', () => {
        if (alarmSet) {
            // Se o alarme já estiver definido, este clique o cancela
            clearInterval(intervalId);
            alarmSet = false;
            statusMessage.textContent = 'Alarme cancelado.';
            setAlarmButton.textContent = 'Definir Alarme';
        } else {
            setAlarm();
        }
    });

    // Define a hora atual como padrão no input ao carregar a página
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    alarmTimeInput.value = `${hours}:${minutes}`;
    updateCurrentTime(); // Exibe a hora atual imediatamente
});
