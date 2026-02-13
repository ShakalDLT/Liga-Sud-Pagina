// 1. Base de Datos de Equipos
const equipos = [
    { nombre: "SHMALOOGLES", img: "imagenes/equipo1.png" },
    { nombre: "Los Mas Poronga", img: "imagenes/equipo2.png" },
    { nombre: "Goontastic 4", img: "imagenes/equipo3.png" },
    { nombre: "Los Inkers", img: "imagenes/equipo4.png" },
    { nombre: "PermaPlus", img: "imagenes/equipo5.png" },
    { nombre: "Asi Que Esta Es La Calle", img: "imagenes/equipo6.png" },
    { nombre: "Inmaculado Neutral", img: "imagenes/equipo7.png" },
    { nombre: "Goonthom-SE", img: "imagenes/equipo8.png" }
];

// =========================================
// 2. SISTEMA DE ORDENAMIENTO Y GUARDADO
// =========================================

function saveData() {
    const data = {
        combates: [],
        posiciones: []
    };

    // Guardar Rondas
    document.querySelectorAll('#body-combates tr').forEach(tr => {
        const team1 = tr.cells[0].querySelector('.cell-content').innerHTML;
        const team2 = tr.cells[2].querySelector('.cell-content').innerHTML;
        const score = tr.cells[3].querySelector('.score-input').value;
        data.combates.push({ team1, team2, score });
    });

    // Guardar Posiciones
    document.querySelectorAll('#body-leaderboard tr').forEach(tr => {
        const team = tr.cells[0].querySelector('.cell-content').innerHTML;
        const pts = tr.cells[1].querySelector('.score-input').value;
        data.posiciones.push({ team, pts });
    });

    localStorage.setItem('torneoData', JSON.stringify(data));
}

// Reordenar la tabla (Ejecutada al terminar la edición)
function sortLeaderboard() {
    const tbody = document.getElementById('body-leaderboard');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const valA = parseInt(a.cells[1].querySelector('input').value) || 0;
        const valB = parseInt(b.cells[1].querySelector('input').value) || 0;
        return valB - valA; 
    });

    rows.forEach(row => tbody.appendChild(row));
    saveData();
}

function loadData() {
    const saved = localStorage.getItem('torneoData');
    if (!saved) {
        addNewRow();
        addLeaderboardRow();
        return;
    }

    const data = JSON.parse(saved);

    const tbodyCombates = document.getElementById('body-combates');
    tbodyCombates.innerHTML = "";
    data.combates.forEach(c => {
        const tr = addNewRow(false);
        tr.cells[0].querySelector('.cell-content').innerHTML = c.team1;
        tr.cells[2].querySelector('.cell-content').innerHTML = c.team2;
        tr.cells[3].querySelector('.score-input').value = c.score;
    });

    const tbodyPosiciones = document.getElementById('body-leaderboard');
    tbodyPosiciones.innerHTML = "";
    data.posiciones.forEach(p => {
        const tr = addLeaderboardRow(false);
        tr.cells[0].querySelector('.cell-content').innerHTML = p.team;
        tr.cells[1].querySelector('.score-input').value = p.pts;
    });
    
    sortLeaderboard();
}

// =========================================
// 3. FUNCIONES DE MANIPULACIÓN
// =========================================

function removeRow(btn) {
    if(confirm("¿Borrar esta ronda?")) {
        btn.closest('tr').remove();
        saveData();
    }
}

function clearLeaderboard() {
    if(confirm("⚠️ ¿BORRAR TODA la tabla de posiciones?")) {
        document.getElementById('body-leaderboard').innerHTML = "";
        saveData();
    }
}

function clearCombates() {
    if(confirm("⚠️ ¿BORRAR TODOS los registros de rondas?")) {
        document.getElementById('body-combates').innerHTML = "";
        saveData();
    }
}

function addNewRow(shouldSave = true) {
    const tbody = document.getElementById('body-combates');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="team-cell" onclick="toggleMenu(this)">
            <div class="cell-content">Hacer clic para asignar</div>
            <div class="team-menu"></div>
        </td>
        <td style="font-weight: bold; color: #ff0055;">VS</td>
        <td class="team-cell" onclick="toggleMenu(this)">
            <div class="cell-content">Hacer clic para asignar</div>
            <div class="team-menu"></div>
        </td>
        <td>
            <input type="text" 
                   class="score-input" 
                   value="0 - 0" 
                   onfocus="this.select()"
                   oninput="saveData()">
        </td>
        <td><button class="btn-delete-row" onclick="removeRow(this)">X</button></td>
    `;
    tbody.appendChild(tr);
    if(shouldSave) saveData();
    return tr;
}

function addLeaderboardRow(shouldSave = true) {
    const tbody = document.getElementById('body-leaderboard');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="team-cell" onclick="toggleMenu(this)">
            <div class="cell-content">Elegir Equipo</div>
            <div class="team-menu"></div>
        </td>
        <td>
            <input type="number" 
                   class="score-input" 
                   value="0" 
                   onfocus="this.select()" 
                   onblur="sortLeaderboard()" 
                   onkeydown="if(event.key==='Enter') this.blur()">
        </td>
    `;
    tbody.appendChild(tr);
    if(shouldSave) saveData();
    return tr;
}

// =========================================
// 4. LÓGICA DEL SELECTOR
// =========================================

function toggleMenu(cell) {
    document.querySelectorAll('.team-menu').forEach(m => {
        if (m !== cell.querySelector('.team-menu')) m.classList.remove('active');
    });

    const menu = cell.querySelector('.team-menu');
    
    if (menu.innerHTML === "") {
        equipos.forEach(equipo => {
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.innerHTML = `
                <img src="${equipo.img}">
                <span>${equipo.nombre}</span>
            `;
            item.onclick = (e) => {
                e.stopPropagation();
                seleccionarEquipo(cell, equipo);
            };
            menu.appendChild(item);
        });
    }
    menu.classList.toggle('active');
}

function seleccionarEquipo(cell, equipo) {
    cell.querySelector('.cell-content').innerHTML = `
        <img src="${equipo.img}" class="table-img">
        <span>${equipo.nombre}</span>
    `;
    cell.querySelector('.team-menu').classList.remove('active');
    saveData();
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.team-cell')) {
        document.querySelectorAll('.team-menu').forEach(m => m.classList.remove('active'));
    }
});

window.onload = loadData;