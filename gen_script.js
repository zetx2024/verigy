document.getElementById('fileInput').addEventListener('change', handleFile);
document.getElementById('convertBtn').addEventListener('click', convertToJSON);
document.getElementById('copyBtn').addEventListener('click', copyToClipboard);

let sheetData = [];
let columns = [];

function handleFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            populateColumnSelect();
        };
        reader.readAsArrayBuffer(file);
    }
}

function populateColumnSelect() {
    const columnSelect = document.getElementById('columnSelect');
    columnSelect.innerHTML = '';
    columns = sheetData[0] || [];
    columns.forEach((col, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = col;
        option.selected = false;
        columnSelect.appendChild(option);
    });
}

function convertToJSON() {
    const selectedOptions = Array.from(document.getElementById('columnSelect').selectedOptions);
    const columnIndices = selectedOptions.map(option => parseInt(option.value, 10));

    if (!columnIndices.length || !sheetData.length) {
        alert('Please upload a file and select at least one column.');
        return;
    }

    const program = document.getElementById('programInput').value || '';
    const date = document.getElementById('dateInputD').value || '';
    const to = document.getElementById('dateInputT').value || '';

    const locationIndex = columns.indexOf('location');

    const jsonResult = sheetData.slice(1).map(row => {
        const result = {
            id: generateRandomID(),
            program: program,
            image: "https://yrjournal.org/images/Logo.PNG",
            location: locationIndex !== -1 ? row[locationIndex] || '' : '',
            role: "Junior Researcher",
            date: formatDate(row[columns.indexOf('date')] || date),
            to: formatDate(row[columns.indexOf('date')] || to)
        };

        columnIndices.forEach(index => {
            result[columns[index]] = row[index];
        });

        return result;
    });

    const jsonOutput = JSON.stringify(jsonResult, null, 2);
    document.getElementById('jsonOutput').textContent = jsonOutput;
}

function generateRandomID() {
    const chars = '43ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz25YRJWRP25';
    let result = '';
    for (let i = 0; i < 11; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function copyToClipboard() {
    const jsonOutput = document.getElementById('jsonOutput').textContent;
    if (!jsonOutput) {
        alert('No JSON data to copy.');
        return;
    }

    navigator.clipboard.writeText(jsonOutput)
        .then(() => alert('JSON copied to clipboard!'))
        .catch(err => console.error('Failed to copy JSON: ', err));
}
