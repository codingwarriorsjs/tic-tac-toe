(() => {
    let isGameEnd = false;
    let crossOrCircle = 'cross';
    let myTurn = true;

    // cells

    let cells = document.querySelectorAll('.grid-cell');

    // restart button

    let restartBtn = document.getElementById("restart-btn");

    restartBtn.addEventListener('click', function() {
        // Refesh All Screens
        bc.postMessage({
            event: 'refresh'
        })

        window.location.reload();
    })
    



    // Add Events on click

    cells.forEach(el => {
        el.filled = false;
        el.addEventListener('click', onClick);
    })

    function onClick({ target }) {
        if(myTurn) {
            if(!isGameEnd) sendData({
                index: target.getAttribute('data-index')
            })
            if(!isGameEnd) handleClick({
                index: target.getAttribute('data-index'),
                currentTab: true
            })
        }
    }


    // broadCastChannel Events

    const bc = new BroadcastChannel('game');

    bc.addEventListener('message', receiveData);


    // Add or check if player one exists

    let count = parseInt(localStorage['gameCount']) || 0;
    if(count > 1) count = 0;
    if(!count) {
        localStorage['gameCount'] = 1;
        buildPlayerUi('player1', 'You', crossOrCircle);
        changeBounceAnimation();
    }
    else {
        crossOrCircle = 'circle';
        localStorage['gameCount'] = 0;
        myTurn = false;
        buildPlayerUi('player1', 'You', crossOrCircle);
        buildPlayerUi('player2', 'Player 2', 'cross');
        changeBounceAnimation();
        bc.postMessage({
            event: 'newPlayer',
            data: {
                type: crossOrCircle
            }
        })
    }

    

    function buildPlayerUi(id, name, img) {
        let nameEL = document.querySelector('#' + id + '>.player-name');
        let imgEl = document.querySelector('#' + id + '>.player-img');

        nameEL.innerHTML = name;
        imgEl.innerHTML = `<div class='${img}'></div>`;
    }

    function sendData(data) {
        bc.postMessage({
            event: 'click',
            data: data
        });
        myTurn = false;
        changeBounceAnimation();
    }

    function receiveData({ data }) {
        if(data.event == 'click') {
            myTurn = true;
            changeBounceAnimation();
            handleClick(data.data);
        }
        if(data.event == 'newPlayer') newPlayer(data.data);
        if(data.event == 'refresh') window.location.reload();;
    }

    function newPlayer({ type }) {
        buildPlayerUi('player2', 'Player 2', type);
    }

    function handleClick({ index, currentTab }) {
        let el = cells[index - 1];
        if(!el.filled) {
            let newEl = document.createElement('div');
            let type = currentTab ? crossOrCircle : (crossOrCircle == 'cross' ? 'circle' : 'cross');
            newEl.classList.add(type);
            el.appendChild(newEl);      
            el.type = type;      
        }
        el.filled = true;

        checkForEnd(); // IF one player won

        // What if game Tied
        let res = (new Array(...cells)).filter(cell => cell.filled).length == cells.length;
        if(res) {
            isGameEnd = true;
            gameEndUi({}, true);
            changeBounceAnimation();
        } // calls the end if game tied
        
    }

    function checkForEnd() {
        // Columns Wise
        let points = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        for(i = 0; i < points.length; i++) {
            let res = check(...points[i]);
            if(res.isEnd) {
                theEnd(res);
                break;
            }
        }

    }

    function check(...p) {
        if(cells[p[0]].type && cells[p[1]].type && cells[p[2]].type &&((cells[p[0]].type === cells[p[1]].type) && (cells[p[0]].type === cells[p[2]].type))) {
            let type = cells[p[0]].type == 'cross' ? 'cross' : 'circle';
            return {
                isEnd: true,
                type,
                p
            }
        } else return {
            isEnd: false
        }
    }

    function theEnd(data) {
        isGameEnd = true;
        gameEndUi(data);
        changeBounceAnimation();
    }

    function gameEndUi({ p, type }, isGameTied = false) {
        if(!isGameTied) {
            cells.forEach((el, index) => {
                if(!p.includes(index)) el.style.backgroundColor = "transparent";
            })
        }
        let wonScreen = document.getElementById("wonMsg");

        // show won screen

        wonScreen.style.display = 'flex';

        let wonText = document.querySelector("#wonMsg>.msg-text");
        if(!isGameTied) wonText.innerHTML = `${type == crossOrCircle ? 'You' : 'Player 2'} won`;
        else wonText.innerHTML = 'Game Tied.';
    }
    

    function changeBounceAnimation() {
        let player1 = document.getElementById("player1");
        let player2 = document.getElementById("player2");
        
        player1.classList[myTurn ? 'add' : 'remove']('bounce');
        player2.classList[!myTurn ? 'add' : 'remove']('bounce');
        if(isGameEnd) player2.parentElement.classList.add('game-end');
    }
})();