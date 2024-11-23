/* ============ Globar variables =================== */
let creatureMap = [];
let initialize = true;
let combinationsMap = [];
let firstcheck = false;
const creatures = [
    "kelpie",
    "puffskein",
    "salamander",
    "swooping",
    "zouwu"
];

/* Score variables */
let globalScore = 0;
let totalMoves = 1;
let totalZouwu = 3;
let totalKelpie = 0;
let winCondition = false;
let gameOver = false;

/* ============= Global methods =============== */

window.generateRandomBeingName = function() {
    return getRandomCreature();
}

window.checkForCombinations = function() {
    const mapLen = creatureMap.length;
    let secuenceFind = false;

    clearCombinationsMap();

    /* Check for horizontal secuences */
    for (let i = 0; i < mapLen; i++) {
        for (let j = 0; j < mapLen - 2; j++) {
            if (creatureMap[i][j] === creatureMap[i][j + 1] && creatureMap[i][j] === creatureMap[i][j + 2]) {
                secuenceFind = true;
                combinationsMap[i][j] = combinationsMap[i][j + 1] = combinationsMap[i][j + 2] = true;
            }
        }
    }

    /* Check for vertical secuences */
    for (let i = 0; i < mapLen - 2; i++) {
        for (let j = 0; j < mapLen; j++) {
            if (creatureMap[i][j] === creatureMap[i + 1][j] && creatureMap[i][j] === creatureMap[i + 2][j]) {
                secuenceFind = true;
                combinationsMap[i][j] = combinationsMap[i + 1][j] = combinationsMap[i + 2][j] = true;
            }
        }
    }

    /* Fill the creature map based on the combinations map */
    for (let i = 0; i < mapLen; i++) {
        for (let j = 0; j < mapLen; j++) {
            if (combinationsMap[i][j]) {
                countCreaturesScore(i, j);
                if (firstcheck) {
                    globalScore += 10;
                    addAnimations(i, j);
                }
                creatureMap[i][j] = window.generateRandomBeingName();
            }
        }
    }

    firstcheck = false;
    return secuenceFind;
}


window.setCreatureMap = function(newMap){
    creatureMap = newMap;
}

window.renderMap = function(rowsCount, colsCount) {
    const mapBody = document.querySelector('.game-map-body');

    for (let i = 0; i < rowsCount; i++) {
        let rowElement = createRowElement();
        if (initialize) {
            creatureMap[i] = [];
            combinationsMap[i] = [];
        }
        for (let j = 0; j < colsCount; j++) {
            let colElement = createColElement(i, j);

            rowElement.append(colElement);
            rowElement.style.gridTemplateColumns = `repeat(${colsCount}, 1fr)`;

            if (initialize) {
                creatureMap[i][j] = null;
                combinationsMap[i][j] = false;
            }
        }
        mapBody.append(rowElement);
    }

    initialize = false;
    mapBody.style.gridTemplateRows = `repeat(${rowsCount}, 1fr)`;
}

window.clearMap = function() {
    document.querySelector('.game-map-body').innerHTML = '';
}

window.redrawMap = function(creaturesArray) {
    const arrayLength = creaturesArray.length;

    let validArray = arrayLength >= 3;
    if (validArray) {
        for (let row of creaturesArray) {
            if (row.length !== arrayLength) {
                validArray = false;
                break;
            }
        }
    }

    if (!validArray) {
        alert("Invalid array dimensions!");
        return false;
    }

    window.clearMap();
    window.renderMap(arrayLength, arrayLength);
    fillCustomCells(creaturesArray);
    window.setCreatureMap(creaturesArray);
}

/* ================ Init method ============================================= */
window.addEventListener('load', init);

function init() {
    const size = 5;
    /* Render initial map with random creatures */
    window.renderMap(size, size);
    fillCells();

    /* Ensure that there are no combinations on initial creation of map */
    if (checkForCombinations()) {
        let combinationsFound;
        do {
            combinationsFound = checkForCombinations();
        } while(combinationsFound);

        window.redrawMap(creatureMap);
    }

    globalScore = 0;
    totalKelpie = 0;
    totalZouwu = 3;
    updateScore();
    updateMoves();
    updateTargetCreatures();
}

/* ======================= Suport functions ================================= */
function createRowElement() {
    let row = document.createElement('tr');
    row.classList.add('game-map-row');

    return row;
}

function createColElement(i, j) {
    let col = document.createElement('td');
    col.classList.add('game-map-cell');
    col.classList.add('cell');
    col.dataset.X = String(j);
    col.dataset.Y = String(i);

    /* Event lisener for Swap functionality */
    col.addEventListener("click", cellListener);

    return col;
}

function cellListener(e) {
    const currentSelected = document.querySelector('.game-map-cell--selected');
    const cellElement = e.currentTarget;

    if (!currentSelected) {
        cellElement.classList.add("game-map-cell--selected");
    } else {
        swapCreatures(currentSelected, cellElement);
        firstcheck = true;
        if (checkForCombinations()) {
            let combinationsFound;
            do {
                combinationsFound = checkForCombinations();
            } while(combinationsFound);

            setTimeout(() => {
                window.redrawMap(creatureMap);
            }, 700);
        }
        updateScore();
        updateTargetCreatures();
        checkGameState();
    }
}

/* Animations */
function addAnimations(i, j) {
    const cell = document.querySelector(`.cell[data--x="${j}"][data--y="${i}"]`);

    cell.classList.add('animation');
}

/* Gameplay */
function swapCreatures(peviousSelectedCell, currentSelectedCell) {
    const previousSelectedCoords = [peviousSelectedCell.dataset.X, peviousSelectedCell.dataset.Y];
    const currentSelectedCoords = [currentSelectedCell.dataset.X, currentSelectedCell.dataset.Y];

    if (validateNeighbour(previousSelectedCoords, currentSelectedCoords)) {
        /* 1. Get the being inside each cell */
        const previousCellCreature = peviousSelectedCell.dataset.being;
        const currentSelectedCreature = currentSelectedCell.dataset.being;

        /* 2. Swap the creatures accordingly */
        setCreature(peviousSelectedCell, currentSelectedCreature);
        setCreature(currentSelectedCell, previousCellCreature);

        currentSelectedCell.classList.remove('game-map-cell--selected');
        peviousSelectedCell.classList.remove('game-map-cell--selected');

        totalMoves--;
        updateMoves();
    }
}


function validateNeighbour(cellA, cellB) {
    let diffX = Math.abs(cellA[0] - cellB[0]);
    let diffY = Math.abs(cellA[1] - cellB[1]);

    return (diffX === 0 && diffY === 1) || (diffX === 1 && diffY === 0);
}

function setCreature(cell, creature) {
    const coordX = cell.dataset.X;
    const coordY = cell.dataset.Y;

    /* TODO: Verify if this IF condition can be removed */
    if (creature === "empty") {
        cell.innerHTML = "";
        cell.dataset.being = "";
    } else {
        cell.innerHTML =
            `<img class="creature" src="img/${creature}.png" alt="An image of the creaure ${creature}" 
                  data-coords="x${coordX}_y${coordY}">`
        cell.dataset.being = creature;
    }

    creatureMap[coordY][coordX] = creature;
}

function getRandomCreature() {
    const randomNumber = Math.floor(Math.random() * (4 + 1));
    return creatures[randomNumber];
}

function clearCombinationsMap() {
    for(let i = 0; i < combinationsMap.length; i++) {
        for(let j = 0; j < combinationsMap[i].length; j++) {
            combinationsMap[i][j] = false;
        }
    }
}

/* Methods to fill cells randomly and with a given array */
function fillCells() {
    const tableElements = document.querySelectorAll('.cell');

    tableElements.forEach((cell) => {
        if (cell.innerHTML.trim() === "") {
            setCreature(cell, window.generateRandomBeingName());
        }
    })
}

function fillCustomCells(creaturesArray) {
    const tableElements = document.querySelectorAll('.cell');

    tableElements.forEach((cell) => {
        const coordX = cell.dataset.X;
        const coordY = cell.dataset.Y;
        setCreature(cell, creaturesArray[coordY][coordX]);
    })
}

/* Score functions */
function updateScore() {
    const scoreElement = document.querySelector('.score-value');
    scoreElement.textContent = globalScore;
}

function updateMoves() {
    totalMoves = Math.max(0, totalMoves);

    const movesElement = document.querySelector('.moves-left');
    movesElement.textContent = String(totalMoves);

    if (totalMoves === 0) {
        gameOver = true;
        winCondition = false;
    }
}

function updateTargetCreatures() {
    const zouwu = document.querySelector('.zouwu');
    zouwu.textContent = String(totalZouwu);

    const kelpie = document.querySelector('.kelpie');
    kelpie.textContent = String(totalKelpie);
}

function countCreaturesScore(i, j) {
    if (creatureMap[i][j] === "zouwu") {
        totalZouwu = Math.max(0, --totalZouwu);
    }

    if (creatureMap[i][j] === "kelpie") {
        totalKelpie = Math.max(0, --totalKelpie);
    }

    if (totalZouwu === 0 && totalKelpie === 0) {
        gameOver = true;
        winCondition = true;
    }
}

function checkGameState() {
    if (gameOver) {
        const endMessage = document.querySelector('#game-footer');
        endMessage.textContent = winCondition ? "You won! Reload the page to start the game again."
            : "You lost! Reload the page to start the game again.";
/*        removeEventListener();*/
    }
}

function removeEventListener() {
    document.querySelectorAll('.cell').forEach(cell => cell.removeEventListener('click', cellListener));
}