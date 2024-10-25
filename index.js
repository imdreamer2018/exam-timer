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
    countdownElement.textContent = `距离2025国考剩余 ${daysLeft} 天！祝你金榜题名，早日上岸！`;

    const styleSelector = document.getElementById('style');
    const themeStyleLink = document.getElementById('theme-style');

    styleSelector.addEventListener('change', (event) => {
        const selectedStyle = event.target.value;
        themeStyleLink.setAttribute('href', selectedStyle);
    });
});

document.getElementById('start').addEventListener('click', () => {
    if (currentModule) {
        if (interval) {
            clearInterval(interval);
            interval = null;
            document.getElementById('start').textContent = '开始';
            document.getElementById('start').innerHTML = '<i class="fas fa-play"></i> 开始';
        } else {
            interval = setInterval(() => {
                timers[currentModule] = (timers[currentModule] || 0) + 1;
                totalSeconds++;
                updateDisplay();
                checkAlerts();
            }, 1000);
            document.getElementById('start').textContent = '暂停';
            document.getElementById('start').innerHTML = '<i class="fas fa-pause"></i> 暂停';
        }
    }
});

document.getElementById('stop').addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
    document.getElementById('start').textContent = '开始';
    document.getElementById('start').innerHTML = '<i class="fas fa-play"></i> 开始';
});

document.querySelectorAll('input[type=radio][name=module]').forEach(radio => {
    radio.addEventListener('change', (event) => {
        clearInterval(interval);
        interval = null;
        currentModule = event.target.id;
        document.getElementById('start').innerHTML = '<i class="fas fa-play"></i> 开始';
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

document.getElementById('save').addEventListener('click', () => {
    const testName = prompt('请输入当前考试的试题名称:');
    if (testName) {
        const now = new Date();
        const dateTime = now.toLocaleString();
        
        // 保存每个模块的时间
        const moduleTimes = {
            "常识判断": formatTime(timers["常识判断"] || 0),
            "言语理解与表达": formatTime(timers["言语理解与表达"] || 0),
            "数量关系": formatTime(timers["数量关系"] || 0),
            "图形推理": formatTime(timers["图形推理"] || 0),
            "定义推理": formatTime(timers["定义推理"] || 0),
            "类比推理": formatTime(timers["类比推理"] || 0),
            "逻辑推理": formatTime(timers["逻辑推理"] || 0),
            "资料分析": formatTime(timers["资料分析"] || 0)
        };
        
        const totalTime = formatTime(totalSeconds);

        const historyData = {
            dateTime,
            testName,
            moduleTimes,
            totalTime
        };

        saveToLocalStorage(historyData);
        alert('计时已保存！');
    }
});

function saveToLocalStorage(data) {
    const history = JSON.parse(localStorage.getItem('exam_timer_history') || '[]');
    history.push(data);
    localStorage.setItem('exam_timer_history', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('exam_timer_history') || '[]');
    const tbody = document.getElementById('history-table').querySelector('tbody');
    tbody.innerHTML = ''; // 清空现有内容

    history.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.dateTime}</td>
            <td>${entry.testName}</td>
            <td>${entry.totalTime}</td>
            <td>
                <i class="fas fa-info-circle" onclick="toggleDetails(this, ${index})" style="cursor: pointer;"></i>
                <i class="fas fa-edit" onclick="editHistory(${index})" style="cursor: pointer; margin-left: 10px;"></i>
                <i class="fas fa-trash-alt" onclick="deleteHistory(${index})" style="cursor: pointer; margin-left: 10px;"></i>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function toggleDetails(icon, index) {
    const history = JSON.parse(localStorage.getItem('exam_timer_history') || '[]');
    const entry = history[index];
    const row = icon.parentElement.parentElement;

    const detailsRow = row.nextSibling;
    if (detailsRow && detailsRow.classList.contains('details-row')) {
        detailsRow.remove();
        icon.classList.remove('fa-minus-circle');
        icon.classList.add('fa-info-circle');
    } else {
        const newDetailsRow = document.createElement('tr');
        newDetailsRow.className = 'details-row';
        newDetailsRow.innerHTML = `
            <td colspan="5">
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>题型</th>
                            <th>时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(entry.moduleTimes).map(([module, time]) => `
                            <tr>
                                <td>${module}</td>
                                <td>${time}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </td>
        `;
        row.parentNode.insertBefore(newDetailsRow, row.nextSibling);
        icon.classList.remove('fa-info-circle');
        icon.classList.add('fa-minus-circle');
    }
}

function editHistory(index) {
    const history = JSON.parse(localStorage.getItem('exam_timer_history') || '[]');
    const entry = history[index];
    const newTestName = prompt('修改试题名称:', entry.testName);
    if (newTestName) {
        entry.testName = newTestName;
        localStorage.setItem('exam_timer_history', JSON.stringify(history));
        loadHistory();
    }
}

function deleteHistory(index) {
    const history = JSON.parse(localStorage.getItem('exam_timer_history') || '[]');
    history.splice(index, 1);
    localStorage.setItem('exam_timer_history', JSON.stringify(history));
    loadHistory();
}

document.getElementById('toggle-history').addEventListener('click', () => {
    const historyDiv = document.getElementById('history');
    if (historyDiv.style.display === 'none' || historyDiv.style.display === '') {
        historyDiv.style.display = 'block';
        loadHistory(); // 加载历史数据
    } else {
        historyDiv.style.display = 'none';
    }
});
