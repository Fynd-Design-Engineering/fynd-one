document.addEventListener('DOMContentLoaded', function() {
    const erpSelect = document.getElementById('erp-system');
    const ifYesDiv = document.getElementById('if-yes');
    
    if (!erpSelect) {
        console.warn('Element with ID "erp-system" not found');
        return;
    }
    
    if (!ifYesDiv) {
        console.warn('Element with ID "if-yes" not found');
        return;
    }
    
    function updateDisplay() {
        if (erpSelect.value === 'yes') {
            ifYesDiv.style.display = 'block';
        } else {
            ifYesDiv.style.display = 'none';
        }
    }
    
    ifYesDiv.style.display = 'none';
    
    erpSelect.addEventListener('change', updateDisplay);
    
    updateDisplay();
});