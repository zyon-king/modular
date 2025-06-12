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
    // --- Referências aos elementos existentes do alarme principal ---
    // const alarmTimeInput = document.getElementById('alarmTime'); // Este input de texto será substituído por carrosséis
    const setAlarmButton = document.getElementById('setAlarmButton');
    const statusMessage = document.getElementById('status-message');
    const currentTimeDisplay = document.getElementById('current-time');

    let alarmSet = false;
    let alarmHour;
    let alarmMinute;
    let intervalId;

    // --- NOVAS Referências para a Lógica da Pausa ---
    const opcaoDuracaoRadio = document.getElementById('opcao-duracao');
    const opcaoFimRadio = document.getElementById('opcao-fim');
    const camposDuracao = document.getElementById('campos-duracao');
    const camposFim = document.getElementById('campos-fim');

    // Função para alternar a visibilidade dos campos de pausa
    function togglePauseFields() {
        if (opcaoDuracaoRadio.checked) {
            camposDuracao.style.display = 'flex'; // Use 'flex' porque o .input-group já é flex
            camposFim.style.display = 'none';
        } else {
            camposDuracao.style.display = 'none';
            camposFim.style.display = 'flex'; // Use 'flex'
        }
    }

    // Adiciona listeners para os radio buttons
    opcaoDuracaoRadio.addEventListener('change', togglePauseFields);
    opcaoFimRadio.addEventListener('change', togglePauseFields);

    // Chama a função uma vez ao carregar a página para definir o estado inicial
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
        // NOTA: A lógica para obter hora e minuto do alarme principal
        // virá dos carrosséis, não de alarmTimeInput.value, na próxima etapa.
        // Por enquanto, esta função pode não funcionar corretamente se alarmTimeInput não existir ou não tiver valor.
        // Mantenho a estrutura para referência futura.

        // const timeValue = alarmTimeInput.value;
        // if (!timeValue) {
        //     statusMessage.textContent = 'Por favor, defina uma hora para o alarme.';
        //     return;
        // }
        // const [hour, minute] = timeValue.split(':').map(Number);
        
        // Temporariamente, use valores padrão ou remova esta chamada para testar a UI da pausa
        // Ou você pode pegar valores de teste diretamente
        alarmHour = 12; // Substitua pela hora do carrossel principal
        alarmMinute = 30; // Substitua pelo minuto do carrossel principal


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
    // const hours = String(now.getHours()).padStart(2, '0'); // Esta linha será removida ou ajustada
    // const minutes = String(now.getMinutes()).padStart(2, '0'); // Esta linha será removida ou ajustada
    // alarmTimeInput.value = `${hours}:${minutes}`; // Esta linha será removida ou ajustada, pois o input de texto não será mais usado
    
    updateCurrentTime();
});
