// 1. BASE DE DATOS DE EQUIPOS
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

// Variables de estado
let historialMatch = JSON.parse(localStorage.getItem('historialMatch')) || [];

// =========================================
// 2. SISTEMA DE LA RULETA (MATCHMAKING)
// =========================================

function spinRoulette() {
    const s1 = document.getElementById('slot1');
    const s2 = document.getElementById('slot2');

    // PUNTO 5: Filtrar combinaciones válidas (No contra sí mismo, no repetidos)
    let posibles = [];
    for (let i = 0; i < equipos.length; i++) {
        for (let j = 0; j < equipos.length; j++) {
            if (i !== j) { // Evita Equipo 1 vs Equipo 1
                const idCombate = [equipos[i].nombre, equipos[j].nombre].sort().join(" vs ");
                if (!historialMatch.includes(idCombate)) {
                    posibles.push({ e1: equipos[i], e2: equipos[j], id: idCombate });
                }
            }
        }
    }

    if (posibles.length === 0) {
        alert("¡Todos los combates posibles ya se han realizado!");
        return;
    }

    // Animación visual
    s1.classList.add('spinning');
    s2.classList.add('spinning');

    let iteraciones = 0;
    const maxIteraciones = 15;

    const interval = setInterval(() => {
        const temp1 = equipos[Math.floor(Math.random() * equipos.length)];
        const temp2 = equipos[Math.floor(Math.random() * equipos.length)];
        
        s1.innerHTML = `<img src="${temp1.img}" style="height:60px"><p>${temp1.nombre}</p>`;
        s2.innerHTML = `<img src="${temp2.img}" style="height:60px"><p>${temp2.nombre}</p>`;
        
        iteraciones++;
        if (iteraciones >= maxIteraciones) {
            clearInterval(interval);
            s1.classList.remove('spinning');
            s2.classList.remove('spinning');

            // SELECCIÓN FINAL
            const final = posibles[Math.floor(Math.random() * posibles.length)];
            
            // Punto 3: Mostrar resultado final
            s1.innerHTML = `<img src="${final.e1.img}" style="height:80px"><h3>${final.e1.nombre}</h3>`;
            s2.innerHTML = `<img src="${final.e2.img}" style="height:80px"><h3>${final.e2.nombre}</h3>`;

            // Guardar en historial para no repetir
            historialMatch.push(final.id);
            localStorage.setItem('historialMatch', JSON.stringify(historialMatch));

            // Punto 4: Mandar automáticamente al registro de rondas
            const nuevaFila = addNewRow();
            seleccionarEquipo(nuevaFila.cells[0], final.e1);
            seleccionarEquipo(nuevaFila.cells[2], final.e2);
        }
    }, 100);
}

function resetMatchHistory() {
    if(confirm("¿Seguro que quieres resetear el historial de combates?")) {
        historialMatch = [];
        localStorage.removeItem('historialMatch');
        alert("Historial de la ruleta reseteado.");
    }
}

// =========================================
// 3. GESTIÓN DE TABLAS (REGISTRO Y POSICIONES)
// =========================================

function saveData() {
    const data = {
        combates: [],
        posiciones: []
    };

    document.querySelectorAll('#body-combates tr').forEach(tr => {
        const team1 = tr.cells[0].querySelector('.cell-content')?.innerText || "";
        const team2 = tr.cells[2].querySelector('.cell-content')?.innerText || "";
        const score = tr.cells[3].querySelector('.score-input')?.value || "0 - 0";
        if(team1) data.combates.push({ team1, team2, score });
    });

    document.querySelectorAll('#body-leaderboard tr').forEach(tr => {
        const team = tr.cells[0].querySelector('.cell-content')?.innerText || "";
        const pts = tr.cells[1].querySelector('.score-input')?.value || "0";
        if(team) data.posiciones.push({ team, pts });
    });

    localStorage.setItem('torneoData', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('torneoData');
    if (!saved) return;

    const data = JSON.parse(saved);

    const tbodyCombates = document.getElementById('body-combates');
    tbodyCombates.innerHTML = "";
    data.combates.forEach(c => {
        const tr = addNewRow(false);
        const eq1 = equipos.find(e => e.nombre === c.team1);
        const eq2 = equipos.find(e => e.nombre === c.team2);
        if(eq1) seleccionarEquipo(tr.cells[0], eq1, false);
        if(eq2) seleccionarEquipo(tr.cells[2], eq2, false);
        tr.cells[3].querySelector('.score-input').value = c.score;
    });

    const tbodyPosiciones = document.getElementById('body-leaderboard');
    tbodyPosiciones.innerHTML = "";
    data.posiciones.forEach(p => {
        const tr = addLeaderboardRow(false);
        const eq = equipos.find(e => e.nombre === p.team);
        if(eq) seleccionarEquipo(tr.cells[0], eq, false);
        tr.cells[1].querySelector('.score-input').value = p.pts;
    });
}

function addNewRow(shouldSave = true) {
    const tbody = document.getElementById('body-combates');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="team-cell" onclick="toggleMenu(this)">
            <div class="cell-content">Asignar</div>
            <div class="team-menu"></div>
        </td>
        <td style="font-weight: bold; color: #ff0055;">VS</td>
        <td class="team-cell" onclick="toggleMenu(this)">
            <div class="cell-content">Asignar</div>
            <div class="team-menu"></div>
        </td>
        <td><input type="text" class="score-input" value="0 - 0" oninput="saveData()"></td>
        <td><button class="btn-delete-row" onclick="removeRow(this)">X</button></td>
    `;
    tbody.prepend(tr);
    if(shouldSave) saveData();
    return tr;
}

function addLeaderboardRow(shouldSave = true) {
    const tbody = document.getElementById('body-leaderboard');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="team-cell" onclick="toggleMenu(this)">
            <div class="cell-content">Elegir</div>
            <div class="team-menu"></div>
        </td>
        <td><input type="number" class="score-input" value="0" onblur="sortLeaderboard()"></td>
    `;
    tbody.appendChild(tr);
    if(shouldSave) saveData();
    return tr;
}

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

// =========================================
// 4. LÓGICA DE INTERFAZ (SELECTORES)
// =========================================

function toggleMenu(cell) {
    const menu = cell.querySelector('.team-menu');
    const isActive = menu.classList.contains('active');
    
    document.querySelectorAll('.team-menu').forEach(m => m.classList.remove('active'));
    
    if (!isActive) {
        if (menu.innerHTML === "") {
            equipos.forEach(equipo => {
                const item = document.createElement('div');
                item.className = 'menu-item';
                item.innerHTML = `<img src="${equipo.img}"> <span>${equipo.nombre}</span>`;
                item.onclick = (e) => {
                    e.stopPropagation();
                    seleccionarEquipo(cell, equipo);
                };
                menu.appendChild(item);
            });
        }
        menu.classList.add('active');
    }
}

function seleccionarEquipo(cell, equipo, shouldSave = true) {
    cell.querySelector('.cell-content').innerHTML = `
        <img src="${equipo.img}" class="table-img">
        <span>${equipo.nombre}</span>
    `;
    cell.querySelector('.team-menu').classList.remove('active');
    if(shouldSave) saveData();
}

function removeRow(btn) {
    btn.closest('tr').remove();
    saveData();
}

function clearCombates() {
    if(confirm("¿Borrar todas las rondas?")) {
        document.getElementById('body-combates').innerHTML = "";
        saveData();
    }
}

function clearLeaderboard() {
    if(confirm("¿Limpiar tabla de posiciones?")) {
        document.getElementById('body-leaderboard').innerHTML = "";
        saveData();
    }
}

// Cerrar menús al clickear fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.team-cell')) {
        document.querySelectorAll('.team-menu').forEach(m => m.classList.remove('active'));
    }
});

// CARGA INICIAL
window.onload = loadData;