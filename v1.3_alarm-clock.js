// alarm-clock.js
// Este arquivo contém a lógica principal do seu despertador.
// Ele depende do 'v0.1_time-multi-carousel-input.js' para os carrosséis de seleção de tempo.

/**
 * Solicita permissão ao usuário para exibir notificações desktop e as exibe.
 * @param {string} title - O título da notificação.
 * @param {string} body - O corpo (conteúdo) da notificação.
 */
function showDesktopNotification(title, body) {
    // Verifica se o navegador suporta notificações.
    if (!("Notification" in window)) {
        console.warn("Este navegador não suporta notificações desktop.");
        return;
    }

    // Verifica o status atual da permissão de notificação.
    if (Notification.permission === "granted") {
        console.log("Permissão para notificações já concedida. Exibindo notificação...");
        new Notification(title, { body: body });
    } else if (Notification.permission === "denied") {
        console.warn("Permissão para notificações negada. Não é possível exibir.");
    } else {
        // Solicita permissão ao usuário.
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


// Lógica Principal do Despertador
document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos elementos da UI ---
    const setAlarmButton = document.getElementById('setAlarmButton');
    const statusMessage = document.getElementById('status-message');
    const currentTimeDisplay = document.getElementById('current-time');

    // Referências aos elementos dos rádio buttons de pausa e seus campos
    const opcaoDuracaoRadio = document.getElementById('opcao-duracao');
    const opcaoFimRadio = document.getElementById('opcao-fim');
    const camposDuracao = document.getElementById('campos-duracao');
    const camposFim = document.getElementById('campos-fim');

    let alarmSet = false; // Estado para controlar se um alarme está definido
    let alarmHour;        // Hora do alarme definido
    let alarmMinute;      // Minuto do alarme definido
    let intervalId;       // ID do setInterval para atualizar a hora atual

    // --- Funções de UI para Lógica da Pausa ---

    /**
     * Alterna a visibilidade dos campos de entrada para "Duração da pausa" ou "Fim da pausa"
     * com base no rádio button selecionado.
     */
    function togglePauseFields() {
        if (opcaoDuracaoRadio.checked) {
            camposDuracao.style.display = 'flex';
            camposFim.style.display = 'none';
        } else {
            camposDuracao.style.display = 'none';
            camposFim.style.display = 'flex';
        }
    }

    // Adiciona listeners para os rádio buttons para alternar os campos
    if (opcaoDuracaoRadio) { // Garante que os elementos existem antes de adicionar listeners
        opcaoDuracaoRadio.addEventListener('change', togglePauseFields);
    }
    if (opcaoFimRadio) {
        opcaoFimRadio.addEventListener('change', togglePauseFields);
    }

    // Define o estado inicial dos campos de pausa ao carregar a página
    togglePauseFields();

    // --- Funções Principais do Alarme ---

    /**
     * Atualiza a exibição da hora atual e verifica se o alarme deve disparar.
     */
    function updateCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeDisplay.textContent = `Hora atual: ${hours}:${minutes}:${seconds}`;

        // Verifica se o alarme está ativo e se a hora atual corresponde à hora do alarme.
        // A verificação de segundos é para disparar uma única vez ao minuto exato.
        if (alarmSet && now.getHours() === alarmHour && now.getMinutes() === alarmMinute && now.getSeconds() === 0) {
            triggerAlarm();
            clearInterval(intervalId); // Para o intervalo para evitar múltiplos disparos
            alarmSet = false;           // Reseta o estado do alarme
            statusMessage.textContent = 'Alarme disparado!';
            setAlarmButton.textContent = 'Definir Alarme'; // Restaura o texto do botão
        }
    }

    /**
     * Define o alarme usando os valores dos carrosséis de hora e minuto.
     */
    function setAlarm() {
        // Obtém a hora e o minuto do alarme principal usando as funções globais
        // expostas pelo script de carrossel (v0.1_time-multi-carousel-input.js).
        if (typeof getSelectedHour === 'function' && typeof getSelectedMinute === 'function') {
            alarmHour = getSelectedHour();
            alarmMinute = getSelectedMinute();
        } else {
            // Caso as funções do carrossel não estejam disponíveis, exibe um erro e retorna.
            console.error("Funções getSelectedHour/Minute não encontradas. Verifique se o script do carrossel foi carregado corretamente ANTES deste.");
            statusMessage.textContent = 'Erro: Carrosséis não carregados.';
            return;
        }

        // Validação básica: garante que os valores foram obtidos.
        if (alarmHour === null || alarmMinute === null) {
            statusMessage.textContent = 'Por favor, defina uma hora válida para o alarme.';
            return;
        }
        
        alarmSet = true; // Define o alarme como ativo
        
        const formattedAlarmTime = `${String(alarmHour).padStart(2, '0')}:${String(alarmMinute).padStart(2, '0')}`;
        statusMessage.textContent = `Alarme definido para ${formattedAlarmTime}`;
        setAlarmButton.textContent = 'Alarme Definido (Clique para Cancelar)';

        // Limpa qualquer intervalo de atualização de hora anterior e inicia um novo.
        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(updateCurrentTime, 1000); // Atualiza a cada segundo

        updateCurrentTime(); // Atualiza a hora imediatamente após definir o alarme

        // Dispara uma notificação desktop de confirmação
        if (typeof showDesktopNotification === 'function') {
            showDesktopNotification("⏰ Alarme Definido!", `Seu alarme foi configurado para: ${formattedAlarmTime}`);
        }
    }

    /**
     * Dispara o alarme: toca um som e exibe uma notificação.
     */
    function triggerAlarm() {
        console.log('Alarme tocando!');

        // Exibe uma notificação desktop para o alarme.
        if (typeof showDesktopNotification === 'function') {
            showDesktopNotification(
                "🔔 Despertador!",
                "A hora que você definiu chegou: " + String(alarmHour).padStart(2, '0') + ":" + String(alarmMinute).padStart(2, '0')
            );
        }

        // Toca um som de alarme.
        const audio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3');
        audio.play().catch(e => console.error("Erro ao tocar áudio:", e));

        // Para o áudio após 5 segundos.
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0; // Reinicia o áudio para o início
        }, 5000);
    }

    // --- Listeners de Eventos ---

    // Listener para o botão "Definir Alarme" / "Cancelar Alarme"
    setAlarmButton.addEventListener('click', () => {
        if (alarmSet) {
            // Se o alarme estiver definido, cancela-o.
            clearInterval(intervalId);
            alarmSet = false;
            statusMessage.textContent = 'Alarme cancelado.';
            setAlarmButton.textContent = 'Definir Alarme';
        } else {
            // Se o alarme não estiver definido, chama a função para defini-lo.
            setAlarm();
        }
    });

    // --- Inicialização ao Carregar a Página ---

    // Define a hora inicial do carrossel principal para a hora atual do sistema.
    // Isso usa a função 'setInitialTime' exposta pelo 'v0.1_time-multi-carousel-input.js'.
    const now = new Date();
    if (typeof setInitialTime === 'function') {
        setInitialTime(now.getHours(), now.getMinutes());
    } else {
        console.warn("Função setInitialTime não encontrada. O carrossel principal pode não inicializar com a hora atual. Certifique-se de que 'v0.1_time-multi-carousel-input.js' está carregado corretamente.");
    }
    
    // Atualiza a exibição da hora atual imediatamente ao carregar a página.
    updateCurrentTime();
});
