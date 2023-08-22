function addComponentRow(tableId) {
    const table = document.getElementById(tableId);
    const newRow = table.insertRow(-1);
    for (let i = 0; i < 3; i++) {
        const cell = newRow.insertCell(i);
        if (i === 0) {
            const input = document.createElement('input');
            input.type = "text";
            input.name = "component";
            cell.appendChild(input);
        } else if (i === 1) {
            const select = document.createElement('select');
            select.name = "instanceType";
            ["c4.large", "c4.xlarge", "c4.2xlarge", "c4.4xlarge", "c4.8xlarge"].forEach(type => {
                const option = document.createElement('option');
                option.value = {"c4.large": 1, "c4.xlarge": 2, "c4.2xlarge": 4, "c4.4xlarge": 8, "c4.8xlarge": 16}[type];
                option.text = type;
                select.appendChild(option);
            });
            cell.appendChild(select);
        } else {
            const input = document.createElement('input');
            input.type = "number";
            input.name = "noOfInstance";
            cell.appendChild(input);
        }
    }
}

function calculateInfrastructureSize(tableId) {
    const table = document.getElementById(tableId);
    let size = 0;
    for (let i = 1; i < table.rows.length; i++) {
        const instanceSize = table.rows[i].cells[1].querySelector('select').value;
        const noOfInstance = table.rows[i].cells[2].querySelector('input').value;
        size += instanceSize * noOfInstance;
    }
    return size;
}

function calculate() {
    const prodSize = calculateInfrastructureSize('prodTable');
    const perfSize = calculateInfrastructureSize('perfTable');
    const differencePercentage = ((prodSize - perfSize) / prodSize) * 100;
    const prodUserCount = document.getElementById('prodUserCount').value;
    const perfUserCount = prodUserCount * (1 - (differencePercentage / 100));
    document.getElementById('result').innerText = `Performance User Count: ${Math.round(perfUserCount)}`;
}

function downloadCSV() {
    const prodSize = calculateInfrastructureSize('prodTable');
    const perfSize = calculateInfrastructureSize('perfTable');
    const differencePercentage = ((prodSize - perfSize) / prodSize) * 100;
    const prodUserCount = document.getElementById('prodUserCount').value;
    const perfUserCount = prodUserCount * (1 - (differencePercentage / 100));

    const csvData = `Prod Size,${prodSize}\nPerf Size,${perfSize}\nDifference %,${differencePercentage}\nProd User Count,${prodUserCount}\nPerf User Count,${Math.round(perfUserCount)}`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'result.csv';
    a.click();
}

function removeComponentRow(buttonElement) {
    const row = buttonElement.closest('tr');
    row.parentElement.removeChild(row);
}

function uploadCSVAndUpdateTable() {
    const fileInput = document.getElementById('csvUpload');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const csvData = event.target.result;
            const rows = csvData.split('\n');
            const table = document.getElementById('prodTable');
            
            // Clear existing rows (except header)
            for(let i = table.rows.length - 1; i > 0; i--) {
                table.deleteRow(i);
            }

            // Populate rows from CSV data
            rows.forEach(row => {
                if(row.trim() !== '') {
                    const [component, instanceType, noOfInstance] = row.split(',');
                    addComponentRowWithData('prodTable', component, instanceType, noOfInstance);
                }
            });
        };
        reader.readAsText(file);
    }
}

function addComponentRowWithData(tableId, component, instanceType, noOfInstance) {
    addComponentRow(tableId);
    const table = document.getElementById(tableId);
    const lastRow = table.rows[table.rows.length - 1];
    lastRow.cells[0].querySelector('input').value = component;
    lastRow.cells[1].querySelector('select').value = {
        "c4.large": 1, 
        "c4.xlarge": 2, 
        "c4.2xlarge": 4, 
        "c4.4xlarge": 8, 
        "c4.8xlarge": 16
    }[instanceType];
    lastRow.cells[2].querySelector('input').value = noOfInstance;
}

function uploadCSVAndUpdateTablePerf() {
    const fileInput = document.getElementById('csvUploadPerf');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const csvData = event.target.result;
            const rows = csvData.split('\n');
            const table = document.getElementById('perfTable');
            
            // Clear existing rows (except header)
            for(let i = table.rows.length - 1; i > 0; i--) {
                table.deleteRow(i);
            }

            // Populate rows from CSV data
            rows.forEach(row => {
                if(row.trim() !== '') {
                    const [component, instanceType, noOfInstance] = row.split(',');
                    addComponentRowWithData('perfTable', component, instanceType, noOfInstance);
                }
            });
        };
        reader.readAsText(file);
    }
}
