document.addEventListener("DOMContentLoaded", () =>{
    const grid = document.querySelector('.grid');
    const size = 4;
    let board = [];
    let currentScore = 0;
    const currentScoreElem = document.getElementById('current-score');

    // Obtener el puntaje más alto del almacenamiento local o que valga 0 si no lo encuentra
    let highScore = localStorage.getItem('2048-highScore') || 0;
    const highScoreElem = document.getElementById('high-score');
    highScoreElem.textContent = highScore;

    const gameOverElem = document.getElementById('game-over');

    // Función para actualizar el puntaje
    function updateScore(value){
        currentScore += value;
        currentScoreElem.textContent = currentScore;
        if(currentScore > highScore){
            highScore = currentScore;
            highScoreElem.textContent = highScore;
            localStorage.setItem('2048-highScore', highScore);
        }
    }

    // Función para reiniciar el juego
    function restartGame(){
        currentScore = 0;
        currentScoreElem.textContent = '0';
        gameOverElem.style.display = 'none';
        initializeGame();
    }

    // Función para iniciar el juego
    function initializeGame(){
        board = [...Array(size)].map(e => Array(size).fill(0));
        placeRandom();
        placeRandom();
        renderBoard();
    }

    // Función para renderizar la cuadrícula en la UI
    function renderBoard(){
        for(let i = 0; i < size; i++){
            for(let j = 0; j < size; j++){
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const prevValue = cell.dataset.value;
                const currentValue = board[i][j];
                if(currentValue !== 0){
                    cell.dataset.value = currentValue;
                    cell.textContent = currentValue;
                    // Manejo de animaciones
                    if(currentValue !== parseInt(prevValue) && !cell.classList.contains('new-tile')){
                        cell.classList.add('merged-tile');
                    }
                }else{
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('merged-tile','new-tile');
                }
            }
        }

        // Clases de animación de limpieza
        setTimeout(() =>{
            const cells = document.querySelectorAll('.grid-cell');
            cells.forEach(cell =>{
                cell.classList.remove('merged-tile','new-tile');
            });
        }, 300);
    }

    // Función para poner un número aleatorio en la cuadrícula
    function placeRandom(){
        const available = [];
        for(let i=0; i < size; i++){
            for(let j=0; j < size; j++){
                if(board[i][j] === 0){
                    available.push({x: i, y: j});
                }
            }
        }

        if(available.length > 0){
            const randomCell = available[Math.floor(Math.random() * available.length)];
            board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            const cell = document.querySelector(`[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`);
            cell.classList.add('new-tile'); // Animaciones para nuevo cuadro
        }
    }

    // Función para mover los cuadros con las flechas del teclado
    function move(direction){
        let hasChanged = false;
        if(direction === 'ArrowUp' || direction === 'ArrowDown'){
            for (let j = 0; j < size; j++){
                const column = [...Array(size)].map((_,i) => board[i][j]);
                const newColumn = transform(column, direction === 'ArrowUp');
                for (let i = 0; i < size; i++){
                    if(board[i][j] !== newColumn[i]){
                        hasChanged = true;
                        board[i][j] = newColumn[i];
                    }
                }
            }
        }else if(direction === 'ArrowLeft' || direction === 'ArrowRight'){
            for (let i = 0; i < size; i++){
                const row = board[i];
                const newRow = transform(row, direction === 'ArrowLeft');
                if(row.join(',') !== newRow.join(',')){
                    hasChanged = true;
                    board[i] = newRow;
                }
            }
        }
        if(hasChanged){
            placeRandom();
            renderBoard();
            checkGameOver();
        }
    }

    // Función para transformar una línea (fila o columna) basado en dirección de movimiento
    function transform(line, moveTowardsStart){
        let newLine = line.filter(cell => cell !== 0);
        if(!moveTowardsStart){
            newLine.reverse();
        }
        for(let i = 0; i < newLine.length - 1; i++){
            if(newLine[i] === newLine[i + 1]){
                newLine[i] *= 2;
                updateScore(newLine[i]); // Actualiza el puntaje cuando los cuadros se fusionan
                newLine.splice(i + 1, 1);
            }
        }
        while (newLine.length < size){
            newLine.push(0);
        }
        if(!moveTowardsStart){
            newLine.reverse()
        }
        return newLine;
    }

    // Función para revisar si se terminó el juego
    function checkGameOver(){
        for(let i = 0; i < size; i++){
            for(let j = 0; j < size; j++){
                if(board[i][j] === 0){
                    return; // Celda vacía, así que el juego continúa
                }
                if(j < size - 1 && board[i][j] === board[i][j+1]){
                    return; // Celdas iguales juntas de manera horizontal, es posible moverse
                }
                if(i < size - 1 && board[i][j] === board[i+1][j]){
                    return; // Celdas iguales juntas de manera vertical, es posible moverse
                }
            }
        }

        // Si llegamos aquí entonces no hay más movimientos posibles
        gameOverElem.style.display = 'flex';
    }

    // Event listeners
    document.addEventListener('keydown', event =>{
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)){
            move(event.key);
        }
    });
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    initializeGame();

});