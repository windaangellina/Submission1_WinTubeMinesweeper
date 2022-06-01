var gametable = document.getElementById("game-table");
var cbMode = document.getElementById("cbMode");
var txtX = document.getElementById("txtX");
var txtY = document.getElementById("txtY");
var mode, qtyMines;
var row, cell;
var width, height;
var testMode = false; //true apabila test mode, false apabila play mode
var sizeValid = false;

document.body.onload = function() {
    txtX.focus();
}

function getWidthHeight() {
    width = txtX.value;
    height = txtY.value;
}

function getMode() {
    getWidthHeight();
    mode = cbMode.options[cbMode.selectedIndex].value;
    let w = parseFloat(width)
    let h = parseFloat(height)
    qtyMines = w * h
    if (mode == "Easy") {
        qtyMines *= 0.1;
    } else if (mode == "Medium") {
        qtyMines *= 0.3;
    } else if (mode == "Hard") {
        qtyMines *= 0.5;
    } else {
        qtyMines = -1;
    }
    qtyMines = parseInt(qtyMines);
    console.log(mode + " - qty mines : " + qtyMines);
}

function prepareGameTable() {
    let w = parseInt(width);
    let h = parseInt(height);
    for (let i = 0; i < h; i++) {
        row = gametable.insertRow(i);
        for (let j = 0; j < w; j++) {
            cell = row.insertCell(j);
            cell.setAttribute("status-mine", "false");
            cell.setAttribute("flagged", "false");
            cell.onclick = function() {
                // klikMouse(event, this);
                klikCell(this);
            }

            //event.preventDefault() dan return false membuat supaya default context menu ga muncul
            cell.addEventListener("contextmenu", function(event) {
                event.preventDefault();
                klikFlag(this);
                return false;
            });
        }
    }

    randomMines();
}

function generateGameTable() {
    getMode();
    gametable.innerHTML = ""; //mengosongkan isi papan permainan
    if (width >= 5 && width <= 10 && height >= 5 && height <= 10) {
        sizeValid = true;
    } else {
        sizeValid = false;
    }

    //set apakah range luas papan sesuai ketentuan
    if (!sizeValid) {
        txtX.focus();
        alert("ERROR : range luas papan 5x5 sampai 10x10");
    } else {
        prepareGameTable();
        console.log("game table telah disiapkan");
    }
}


function randomMines() {
    if (qtyMines >= 0) {
        for (let i = 0; i < qtyMines; i++) {
            //idx dibulatkan ke bawah
            let idxRow = Math.floor(Math.random() * height);
            let idxCol = Math.floor(Math.random() * width);
            let cell = gametable.rows[idxRow].cells[idxCol];
            //atur atribut status mine menjadi true
            cell.setAttribute("status-mine", "true");

            //apabila dalam test mode maka mines akan ditampilan
            if (testMode) {
                cell.innerHTML = "*";
            }
        }
        console.log("info : mines telah dirandom");

    } else {
        console.log("error : qty mines belum diatur");
    }
}


function showMines() {
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let cell = gametable.rows[i].cells[j];
            if (cell.getAttribute("status-mine") == "true") {
                // cell.classList.add("mines");
                cell.innerHTML = "*";
            }
        }
    }
}


function checkWin() {
    //player akan menang saat numOpenedCells = numBombs
    /*  If numUnopenedCells > numBombs then the player has unopened cells which are not bombs (i.e. some work left to do)
        If numUnopenedCells < numBombs then the player has necessarily "opened" a bomb cell and already lost.
    */
    let ctrUnopenedCells = 0;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let cell = gametable.rows[i].cells[j];
            //pengecekkan apakah cell masih belum diklik
            //cek apabila test mode maka text pada kotak bomb diacuhkan
            if (testMode) {
                if (cell.innerHTML == "*" || cell.innerHTML == "" || cell.innerHTML == "?") {
                    ctrUnopenedCells++;
                }
            } else {
                if (cell.innerHTML == "" || cell.innerHTML == "?") {
                    ctrUnopenedCells++;
                }
            }
        }
    }

    console.log("num unopened cells : " + ctrUnopenedCells);

    //cek menang atau tidak
    if (ctrUnopenedCells == qtyMines) { //apabila menang
        if (ctrShown <= 0) { //hanya tampilkan sekali saja
            playerWin = true;
            showMines();
            promptPlayAgain();
        }
        ctrShown++;
    }

}

function promptPlayAgain() {
    let playagain = prompt("Congrats, you win! Do you want to play again [Y/N] ?");
    if (playagain != null) {
        if (playagain.toLocaleLowerCase().trim() == "y") {
            resetGame(false);
            generateGameTable();
        } else {
            return null;
        }
    }
}


function revealAllNonMines() {
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let gamecell = gametable.rows[i].cells[j];
            if (gamecell.getAttribute("status-mine") == "false") {
                let ctrMine = mineCount(gamecell);
                gamecell.innerHTML = ctrMine;
                changeColor(gamecell, ctrMine);
            }
        }
    }
}

var ctrShown = 0; //ctr menandakan berapa kali prompt play again dimunculkan
var playerWin = false;

function mineCount(cell) {
    let ctrMine = 0;
    //mendapatkan index row dan col dari cell yang sedang diklik
    let idxRow = cell.parentNode.rowIndex;
    let idxCol = cell.cellIndex;

    //math.max = mengambil nilai max dari antara 2 angka
    //math.min = mengambil nilai min dari antara 2 angka

    //mine count
    for (let i = Math.max(idxRow - 1, 0); i <= Math.min(idxRow + 1, height - 1); i++) {
        for (let j = Math.max(idxCol - 1, 0); j <= Math.min(idxCol + 1, width - 1); j++) {
            let cell2 = gametable.rows[i].cells[j];
            if (cell2.getAttribute("status-mine") == "true") {
                ctrMine++;
            }
        }
    }
    return ctrMine;
}

function changeColor(cell, ctrMine) {
    //tampilkan angka sesuai ketentuan warna
    cell.innerHTML = ctrMine;
    if (ctrMine == 1) {
        cell.style.color = 'red';
    } else if (ctrMine == 2) {
        cell.style.color = 'orange';
    } else if (ctrMine == 3) {
        cell.style.color = 'yellow';
    } else if (ctrMine == 4) {
        cell.style.color = 'green';
    } else if (ctrMine == 5) {
        cell.style.color = 'blue';
    } else if (ctrMine == 6) {
        cell.style.color = '#6f00ff';
    } else if (ctrMine == 7) {
        cell.style.color = '#800080';
    }

    //ubah background sesuai ketentuan
    cell.style.backgroundColor = '#7E8085';
    cell.style.border = '1px solid black';
}

function klikCell(cell) {
    if (cell.getAttribute("flagged") == "true") {
        alert("cell can't be opened, cell is flagged");
    } else {
        // gametable.classList.add
        if (cell.getAttribute("status-mine") == "true") {
            if (playerWin == false) {
                alert("Game Over!");
                showMines();
                revealAllNonMines();
            }
        } else {
            let idxRow = cell.parentNode.rowIndex;
            let idxCol = cell.cellIndex;
            let ctrMine = mineCount(cell);
            changeColor(cell, ctrMine);


            if (ctrMine == 0) {
                //tampilkan semua petak yang ga punya mine
                for (let i = Math.max(idxRow - 1, 0); i <= Math.min(idxRow + 1, height - 1); i++) {
                    for (let j = Math.max(idxCol - 1, 0); j <= Math.min(idxCol + 1, width - 1); j++) {
                        //recursive call
                        let cell2 = gametable.rows[i].cells[j];
                        if (cell2.innerHTML == "") {
                            cell2.style.backgroundColor = '#7E8085';
                            cell2.style.border = '1px solid black';
                            klikCell(cell2);
                        }
                    }
                }
            }

            //cek menang
            checkWin();
        }
    }
}


function klikFlag(cell) {
    //ganti atribut flagged
    if (cell.getAttribute("flagged") == "true") {
        cell.setAttribute("flagged", "false");
        cell.innerHTML = "";
    } else if (cell.getAttribute("flagged") == "false") {
        if (cell.innerHTML == "") {
            cell.setAttribute("flagged", "true");
            cell.innerHTML = "?";
        }
    }
}

// function klikMouse(event, cell) {
//     /* untuk mengetahui tombol mouse mana yang diklik, gunakan event onmousedown, return value :
//         0 = The left mouse button
//         1 = The middle mouse button
//         2 = The right mouse button
//         */

//     let returnMouse = parseInt(event.button);
//     console.log("return mouse : " + returnMouse);
//     //cek apakah tombol mouse kanan yang diklik
//     if (returnMouse == 0) {
//         klikCell(cell);
//     } else if (returnMouse == 2) {
//         klikFlag(cell);
//     }
// }

function resetGame(resetSize) {
    gametable.innerHTML = ""; //mengosongkan isi papan permainan
    ctrShown = 0; //reset ctr prompt play again dimunculkan menjadi 0
    playerWin = false;
    if (resetSize) {
        txtX.value = "";
        txtY.value = "";
        cbMode.selectedIndex = 0;
        txtX.focus();
    }
}