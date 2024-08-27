//document.addEventListener("DOMContentLoaded", function() {
//});


function clearOutput() {
    const exportArea = document.getElementById("export-area");
    exportArea.value = '';
}


function loadData () {
    clearOutput();
    const exportArea = document.getElementById("export-area");

    const historyString = localStorage.getItem('history') || '[]';
    exportArea.value = historyString;
}


function saveData () {
    const exportArea = document.getElementById("export-area");
    const jsonContentString = exportArea.value;

    let jsonContent = null;
    try {
        jsonContent = JSON.parse(jsonContentString)
    } catch (e) {}

    if (!jsonContent || !jsonContentString.startsWith('[') || !jsonContentString.endsWith(']')) {
        alert('Не удалось распознать JSON');
        return;
    }

    const userConfirmed = confirm("Вы уверены, что хотите перезаписать текущие данные?");
    if (userConfirmed) {
        // Сохраняем данные в localStorage
        localStorage.setItem('history', JSON.stringify(jsonContent));
        clearOutput();
        alert('Данные перезаписаны!');
    }
}
