// Dicionário de cores (Pastéis)
// const colorMap = {
//     1: '#90b69e', // Verde
//     2: '#988cd2', // Roxo
//     3: '#ffd88a', // Amarelo
//     4: '#6a8fd2', // Azul escuro
//     5: '#ff9d60', // Laranja
//     6: '#fb705e', // Vermelho
//     7: '#79badd'  // Azul claro
// };
const colorMap = {
   1: '#90b69e',
   2: '#79badd',
   3: '#ffd88a',
   4: '#988cd2', 
   5: '#6a8fd2',
   6: '#ff9d60',
   7: '#fb705e'
}


// NOVO: Dicionário tradutor de Pastel para Saturado
const pastelToSaturated = {
    '#90b69e': '#5c9f7e', // Verde
    '#988cd2': '#7a65c7', // Roxo
    '#ffd88a': '#ffc745', // Amarelo
    '#6a8fd2': '#1a6dca', // Azul escuro
    '#ff9d60': '#ff801b', // Laranja
    '#fb705e': '#ff3b3e', // Vermelho
    '#79badd': '#00a6d5'  // Azul claro
};

// Algoritmo de permutação
function generateNumbers(position) {
    if (position < 1 || position > 5040) return [1, 2, 3, 4, 5, 6, 7];
    
    let availableNumbers = [1, 2, 3, 4, 5, 6, 7];
    let k = position - 1;
    const factorials = [720, 120, 24, 6, 2, 1, 1];
    let generatedCombination = [];

    for (let i = 0; i < 7; i++) {
        let index = Math.floor(k / factorials[i]);
        generatedCombination.push(availableNumbers[index]);
        availableNumbers.splice(index, 1);
        k = k % factorials[i];
    }
    return generatedCombination;
}

// Função de mistura de cores
function blendColors(hexTop, hexBottom, ratio) {
    hexTop = hexTop.replace('#', '');
    hexBottom = hexBottom.replace('#', '');

    const r1 = parseInt(hexTop.substring(0, 2), 16);
    const g1 = parseInt(hexTop.substring(2, 4), 16);
    const b1 = parseInt(hexTop.substring(4, 6), 16);

    const r2 = parseInt(hexBottom.substring(0, 2), 16);
    const g2 = parseInt(hexBottom.substring(2, 4), 16);
    const b2 = parseInt(hexBottom.substring(4, 6), 16);

    const r = Math.round(r1 * ratio + r2 * (1 - ratio));
    const g = Math.round(g1 * ratio + g2 * (1 - ratio));
    const b = Math.round(b1 * ratio + b2 * (1 - ratio));

    return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}


// --- LÓGICA DO PICKER (TROCANDO TELAS) ---
const tabs = document.querySelectorAll('.picker-tab');
var currentTab = '';
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.view-panel').forEach(v => v.style.display = 'none');
        
        tab.classList.add('active');
        const targetViewId = tab.getAttribute('data-target');
        document.getElementById(targetViewId).style.display = 'block';

        const controlsStack = document.querySelector('.controls-stack');
        if (targetViewId === 'colorView') {
            controlsStack.style.display = 'none';
            currentTab = 'colorView';
        } else {
            controlsStack.style.display = 'flex'; 
            currentTab = 'logoview';
        }
    });
});

// --- TELA 1: Atualiza a UI baseada no input numérico ---
function updateUI(position) {
    const colorOrder = generateNumbers(position);
    document.getElementById('numberSequenceOutput').textContent = `Opção dos números: [${colorOrder.join(', ')}]`;

    const generatedHexColors = colorOrder.map(num => colorMap[num]);
    const standardParts = document.querySelectorAll('.brand-part:not(.cls-8)');
    
    let colorOfCls5 = '', colorOfCls3 = '';

    standardParts.forEach((part, index) => {
        const colorToApply = generatedHexColors[index];
        part.style.fill = colorToApply;
        if (part.classList.contains('cls-3')) colorOfCls3 = colorToApply;
        if (part.classList.contains('cls-5')) colorOfCls5 = colorToApply;
    });

    const cls8 = document.querySelector('.cls-8');
    if (cls8 && colorOfCls5 && colorOfCls3) {
        // Pega as versões saturadas das duas cores

        if (currentTab === 'colorView') {
        const saturated5 = pastelToSaturated[colorOfCls5];
        const saturated3 = pastelToSaturated[colorOfCls3];
        // Mistura as versões saturadas e aplica na cls-8
        cls8.style.fill = blendColors(saturated5, saturated3, 0.75);
        } else {
            cls8.style.fill = blendColors(colorOfCls5, colorOfCls3, 0.75)
        }
    }
}

// --- EVENT LISTENERS DOS CONTROLES (TELA 1) ---
const positionInput = document.getElementById('positionInput');
const randomBtn = document.getElementById('randomBtn');

positionInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value);
    if (val >= 1 && val <= 5040) updateUI(val);
    else if (e.target.value === '') document.getElementById('numberSequenceOutput').textContent = "Opção dos números: ";
});

randomBtn.addEventListener('click', () => {
    const randomPosition = Math.floor(Math.random() * 5040) + 1;
    positionInput.value = randomPosition;
    updateUI(randomPosition);
});


// --- EXPORTAR SVG ---
document.getElementById('exportBtn').addEventListener('click', () => {
    const svgElement = document.getElementById('mutantLogo');
    const serializer = new XMLSerializer();
    let svgData = serializer.serializeToString(svgElement);
    if (!svgData.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgData = svgData.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'marca-mutante.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// --- LÓGICA DA TELA 2 (COLOR ILLUSTRATION VIEW) ---
const select3 = document.getElementById('select3');
const select5 = document.getElementById('select5');
const illus3 = document.getElementById('illus-3');
const illus5 = document.getElementById('illus-5');
const illus8 = document.getElementById('illus-8');

function updateIllustrationBlend() {
    // Cores pasteis escolhidas no menu
    const pastel3 = select3.value;
    const pastel5 = select5.value;
    
    // As formas externas ficam pasteis
    illus3.style.fill = pastel3;
    illus5.style.fill = pastel5;
    
    // Transforma em saturadas para calcular o meio
    const saturated3 = pastelToSaturated[pastel3];
    const saturated5 = pastelToSaturated[pastel5];
    
    // Mistura as versões saturadas e aplica na intersecção
    illus8.style.fill = blendColors(saturated5, saturated3, 0.75);
}

select3.addEventListener('change', updateIllustrationBlend);
select5.addEventListener('change', updateIllustrationBlend);

// Setup Inicial ao abrir a página
const initialPos = Math.floor(Math.random() * 5040) + 1;
positionInput.value = initialPos;
updateUI(initialPos);
updateIllustrationBlend();