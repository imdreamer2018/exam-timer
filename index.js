let currentModule = null;
let timers = {};
let totalSeconds = 0;
let interval = null;

document.addEventListener('DOMContentLoaded', () => {
    const examDate = new Date('2024-12-01');
    const today = new Date();
    const timeDiff = examDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const countdownElement = document.getElementById('countdown');
    countdownElement.textContent = `距离2025国考剩余 ${daysLeft} 天！祝你有个好成绩，早日上岸！`;
});

document.getElementById('start').addEventListener('click', () => {
    if (currentModule) {
        if (interval) {
            clearInterval(interval);
            interval = null;
            document.getElementById('start').textContent = '开始';
        } else {
            interval = setInterval(() => {
                timers[currentModule] = (timers[currentModule] || 0) + 1;
                totalSeconds++;
                updateDisplay();
                checkAlerts();
            }, 1000);
            document.getElementById('start').textContent = '暂停';
        }
    }
});

document.getElementById('stop').addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
    document.getElementById('start').textContent = '开始';
});

document.querySelectorAll('input[type=radio][name=module]').forEach(radio => {
    radio.addEventListener('change', (event) => {
        clearInterval(interval);
        interval = null;
        currentModule = event.target.id;
        document.getElementById('start').textContent = '开始';
    });
});

document.getElementById('style').addEventListener('change', (event) => {
    const selectedStyle = event.target.value;
    document.getElementById('theme-style').setAttribute('href', selectedStyle);
});

window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
});

function checkAlerts() {
    if (totalSeconds === 3600) { // 考试时间过半
        playAudio('examAlert1');
    } else if (totalSeconds === 6600) { // 考试时间仅剩10分钟
        playAudio('examWillEnd');
    } else if (totalSeconds === 7200) { // 考试时间结束
        playAudio('examEnd');
    }
}

function playAudio(audioId) {
    const audioElement = document.getElementById(audioId);
    if (audioElement) {
        audioElement.play();
    } else {
        console.warn(`音频元素 ${audioId} 未找到`);
    }
}

function updateDisplay() {
    for (let module in timers) {
        document.getElementById(`${module}-time`).textContent = formatTime(timers[module]);
    }
    document.getElementById('total-time-display').textContent = formatTime(totalSeconds);
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
