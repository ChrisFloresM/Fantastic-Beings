const creatures = [
    "kelpie",
    "puffskein",
    "salamander",
    "swooping",
    "zouwu"
];

fillCells();

function fillCells() {
    const tableElements = document.querySelectorAll('.cell');

    tableElements.forEach((tableElement) => {
        if (tableElement.innerHTML.trim() === "") {
            setCreature(tableElement, getRandomCreature());
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

function getRandomCreature() {
    const randomNumber = Math.floor(Math.random() * (4 + 1));
    return creatures[randomNumber];
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

