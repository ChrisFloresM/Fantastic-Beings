let creatureMap = [];
let initialize = true;

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
        for (let j = 0; j < colsCount; j++) {
            let colElement = createColElement();
            colElement.dataset.X = String(j);
            colElement.dataset.Y = String(i);
            rowElement.append(colElement);
            rowElement.style.gridTemplateColumns = `repeat(${colsCount}, 1fr)`;

            if (initialize) {
                creatureMap[i][j] = null;
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

window.renderMap(5, 5);

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

        let removeXCurrent = horizontalCheck(currentSelectedCoords[0], currentSelectedCoords[1], cellCreature);
        let removeXCell = horizontalCheck(cellElementCoords[0], cellElementCoords[1], currentSelectedCreature);

        let removeYCurrent = verticalCheck(currentSelectedCoords[0], currentSelectedCoords[1], cellCreature);
        let removeYCell = verticalCheck(cellElementCoords[0], cellElementCoords[1], currentSelectedCreature);

        removeCreaturesX(removeXCurrent, currentSelectedCoords[1]);
        removeCreaturesX(removeXCell, cellElementCoords[1]);

        removeCreaturesY(removeYCurrent, currentSelectedCoords[0]);
        removeCreaturesY(removeYCell, cellElementCoords[0])

        return true;
    }
}

function validateNeighbour(cellA, cellB) {
    let diffX = Math.abs(cellA[0] - cellB[0]);
    let diffY = Math.abs(cellA[1] - cellB[1]);

    return (diffX === 0 && diffY === 1) || (diffX === 1 && diffY === 0);
}

function horizontalCheck(coordX, coordY, creature) {

    const maxLen = creatureMap.length - 1;
    let removeIdxs = [];
    let removeIdxsTemp = [];

    coordX = Number(coordX);
    coordY = Number(coordY);

    const startPosition = Math.max(0, coordX - 2);
    const endPosition = Math.min(coordX + 2, maxLen);

    for (let i = startPosition; i <= endPosition; i++) {
        if (creatureMap[coordY][i] === creature) {
            removeIdxsTemp.push(i);
        } else {
            if (removeIdxsTemp.length >= 3) {
                removeIdxsTemp.forEach(idx => {
                    removeIdxs.push(idx);
                });
            }
            removeIdxsTemp.length = 0;
        }
    }

    removeIdxsTemp.forEach(idx => {
        removeIdxs.push(idx);
    });

    return removeIdxs;
}

function verticalCheck(coordX, coordY, creature) {

    const maxLen = creatureMap.length - 1;
    let removeIdxs = [];
    let removeIdxsTemp = [];

    coordX = Number(coordX);
    coordY = Number(coordY);

    const startPosition = Math.max(0, coordY - 2);
    const endPosition = Math.min(coordY + 2, maxLen);

    for (let i = startPosition; i <= endPosition; i++) {
        if (creatureMap[i][coordX] === creature) {
            removeIdxsTemp.push(i);
        } else {
            if (removeIdxsTemp.length >= 3) {
                removeIdxsTemp.forEach(idx => {
                    removeIdxs.push(idx);
                });
            }
            removeIdxsTemp.length = 0;
        }
    }

    removeIdxsTemp.forEach(idx => {
        removeIdxs.push(idx);
    });

    return removeIdxs;
}

function removeCreaturesX(removeIdxs, coordY) {
    if (removeIdxs.length >= 3) {
        removeIdxs.forEach(removeIdx => {
            creatureMap[coordY][removeIdx] = "empty";
        });

        window.redrawMap(creatureMap);
    }
}

function removeCreaturesY(removeIdxs, coordX) {
    if (removeIdxs.length >= 3) {
        removeIdxs.forEach(removeIdx => {
            creatureMap[removeIdx][coordX] = "empty";
        });

        window.redrawMap(creatureMap);
    }
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