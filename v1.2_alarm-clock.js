// v1.1_alarm-clock.js
// Este arquivo gerencia a lógica principal do despertador, incluindo integração com carrosséis de tempo.

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
    // --- Referências aos elementos da UI ---
    const setAlarmButton = document.getElementById('setAlarmButton');
    const statusMessage = document.getElementById('status-message');
    const currentTimeDisplay = document.getElementById('current-time');

    // Referências para a lógica da pausa
    const opcaoDuracaoRadio = document.getElementById('opcao-duracao');
    const opcaoFimRadio = document.getElementById('opcao-fim');
    const camposDuracao = document.getElementById('campos-duracao');
    const camposFim = document.getElementById('campos-fim');

    let alarmSet = false;
    let alarmHour;
    let alarmMinute;
    let intervalId;

    // --- INSTANCIAR E CONFIGURAR OS CARROSSEIS DE TEMPO ---
    // A função `setupTimeCarousels` agora é global, exposta por v3_time-carousel-input.js

    // Carrossel do Alarme Principal
    const mainAlarmCarousels = setupTimeCarousels(
        'hours-carousel', 'hours-items',
        'minutes-carousel', 'minutes-items',
        'hours-selection-overlay', 'hours-selection-carousel', 'hours-selection-items',
        'minutes-selection-overlay', 'minutes-selection-carousel', 'minutes-selection-items',
        24, 60
    );

    // Carrosséis de Duração da Pausa
    const pauseDurationCarousels = setupTimeCarousels(
        'pause-duration-hours-carousel', 'pause-duration-hours-items',
        'pause-duration-minutes-carousel', 'pause-duration-minutes-items',
        null, null, null, // Estes carrosséis não terão overlays de seleção (por enquanto)
        null, null, null,
        24, 60
    );

    // Carrosséis de Fim da Pausa
    const pauseEndCarousels = setupTimeCarousels(
        'pause-end-hours-carousel', 'pause-end-hours-items',
        'pause-end-minutes-carousel', 'pause-end-minutes-items',
        null, null, null, // Estes carrosséis não terão overlays de seleção (por enquanto)
        null, null, null,
        24, 60
    );

    // --- Lógica dos Radio Buttons para alternar campos de pausa ---
    function togglePauseFields() {
        // Inicialmente, oculta ambos para garantir que apenas o selecionado apareça
        camposDuracao.style.display = 'none';
        camposFim.style.display = 'none';

        if (opcaoDuracaoRadio.checked) {
            camposDuracao.style.display = 'flex';
        } else if (opcaoFimRadio.checked) {
            camposFim.style.display = 'flex';
        }
    }

    // Adiciona listeners para os radio buttons
    opcaoDuracaoRadio.addEventListener('change', togglePauseFields);
    opcaoFimRadio.addEventListener('change', togglePauseFields);

    // Chama a função uma vez ao carregar a página para definir o estado inicial
    // e garantir que o rádio marcado esteja ativo.
    togglePauseFields();


    // --- Funções existentes do alarme ---
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
        // *** AGORA pegamos a hora e minuto dos carrosséis do alarme principal ***
        alarmHour = mainAlarmCarousels.getHour();
        alarmMinute = mainAlarmCarousels.getMinute();

        // VALIDAÇÃO BÁSICA: (Opcional, mas recomendado)
        if (alarmHour === undefined || alarmMinute === undefined) {
             statusMessage.textContent = 'Erro: Hora do alarme não selecionada corretamente.';
             return;
        }

        alarmSet = true;
        
        const formattedAlarmTime = `${String(alarmHour).padStart(2, '0')}:${String(alarmMinute).padStart(2, '0')}`;
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

        // TODO: Nesta seção, futuramente, adicionaremos a lógica de leitura
        // dos valores dos carrosséis de pausa (duração ou fim)
        // e a lógica de agendamento da pausa.
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

    // Define a hora inicial para o carrossel principal (hora atual)
    const now = new Date();
    mainAlarmCarousels.setTime(now.getHours(), now.getMinutes());
    
    // Define a hora inicial para os carrosséis de duração/fim da pausa como 00:00 ou similar
    // Isso é importante para que eles também mostrem valores iniciais.
    pauseDurationCarousels.setTime(0, 0); // Duração inicial 00:00
    pauseEndCarousels.setTime(now.getHours(), now.getMinutes()); // Fim da pausa pode começar na hora atual
    
    updateCurrentTime();
});
