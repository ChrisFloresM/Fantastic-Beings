let creatureMap = [];
let initialize = true;
let combinationsMap = [];
const creatures = [
    "kelpie",
    "puffskein",
    "salamander",
    "swooping",
    "zouwu"
];

window.generateRandomBeingName = function() {
    return getRandomCreature();
}

window.checkForCombinations = function() {
    const mapLen = creatureMap.length;
    let secuenceFind = false;

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

    for (let i = 0; i < mapLen; i++) {
        for (let j = 0; j < mapLen; j++) {
            if (combinationsMap[i][j]) {
               creatureMap[i][j] =  window.generateRandomBeingName();
            }
        }
    }

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
        }
        combinationsMap[i] = [];
        for (let j = 0; j < colsCount; j++) {
            let colElement = createColElement();
            colElement.dataset.X = String(j);
            colElement.dataset.Y = String(i);
            rowElement.append(colElement);
            rowElement.style.gridTemplateColumns = `repeat(${colsCount}, 1fr)`;

            if (initialize) {
                creatureMap[i][j] = null;
            }
            combinationsMap[i][j] = false;
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

window.renderMap(5, 5);
fillCells();

if (checkForCombinations()) {
    do {
        window.redrawMap(creatureMap);
    } while(checkForCombinations());
}

function createRowElement() {
    let row = document.createElement('tr');
    row.classList.add('game-map-row');

    return row;
}

function createColElement() {
    let col = document.createElement('td');
    col.classList.add('game-map-cell');
    col.classList.add('cell');

    col.addEventListener("click", (e) => {
        const currentSelected = document.querySelector('.game-map-cell--selected');
        const cellElement = e.currentTarget;

        if (!currentSelected) {
            cellElement.classList.add("game-map-cell--selected");
        } else {
            swapCreatures(currentSelected, cellElement);
            if(checkForCombinations()) {
                do {
                    window.redrawMap(creatureMap);
                } while(checkForCombinations());
            }

        }
    })
    return col;
}

function setCreatureMap(newMap) {
    creatureMap = newMap;
}

/* Gameplay */
function swapCreatures(currentSelected, cellElement) {
    const currentSelectedCoords = [currentSelected.dataset.X, currentSelected.dataset.Y];
    const cellElementCoords = [cellElement.dataset.X, cellElement.dataset.Y];

    if (validateNeighbour(currentSelectedCoords, cellElementCoords)) {
        const currentSelectedCreature = currentSelected.dataset.being;
        const cellCreature = cellElement.dataset.being;

        setCreature(currentSelected, cellCreature);
        setCreature(cellElement, currentSelectedCreature);

        cellElement.classList.remove('game-map-cell--selected');
        currentSelected.classList.remove('game-map-cell--selected');
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

    if(creature === "empty") {
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

function fillCells() {
    const tableElements = document.querySelectorAll('.cell');

    tableElements.forEach((tableElement) => {
        if (tableElement.innerHTML.trim() === "") {
            setCreature(tableElement, window.generateRandomBeingName());
        }
    })
}

function fillCustomCells(creaturesArray) {
    const tableElements = document.querySelectorAll('.cell');

    tableElements.forEach((tableElement) => {
        const coordX = tableElement.dataset.X;
        const coordY = tableElement.dataset.Y;
        setCreature(tableElement, creaturesArray[coordY][coordX]);
    })
}


