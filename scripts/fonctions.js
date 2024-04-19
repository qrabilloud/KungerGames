let players = []; //Liste contenant tous les joueurs de la partie, elle ne change pas au cours de la partie
let round = 1; //Itérateur donnant le round auquel on se trouve
let playersInFight = []; //Liste des joueurs actuellement en combat, elle change à chaque round
let roundCombatDone = false;

class Player { //Classe correspondant à un joueur, elle contient toutes les données qui permettent de le définir
    constructor(pseudo, district, number) { //Le constructeur d'une instance prend en paramètre un pseudo, un numéro de district et une position dans la liste
        this.pseudo = pseudo; //Pseudo du joueur
        this.district = district; //District du joueur 
        this.number = number; //Position du joueur dans la liste des joueurs 
        this.isAlive = true; //Détermine si le joueur est mort ou non
        this.isLastWinner = false; //Si le joueur est le gagnant du combat précédent
        this.inCombat = false; //Si le joueur est en combat
        this.isKaipitole = false; //Si le joueur est le Kaipitole
        this.wasAFK = false; //Si le joueur s'est fait éliminé en étant AFK au premier tour
        this.wasFirstKilled = false; //Si le joueur s'est fait tué au premier round
        this.interKilled = false; //Si le joueur s'est entretué avec quelqu'un
        this.hasWon = false; //Si le joueur a gagné les Kunger Games
        this.isKillLeader = false; //Si le joueur totalise le plus de kills
        this.twoVsOne = false;
        this.kills = 0; //Nombre de kills effectués par le joueur
        this.chosenNumber = -1; //Nombre choisi par le joueur lors d'un combat, change à chaque round
        this.killedAtRound = 0; //Donne le round lors duquel le joueur a été tué
        this.wasKilledBy = ""; //Donne le pseudo de celui qui a tué le joueur
        this.dodgedKaipitole = 0; //Nombre de fois où le joueur a gagné contre le Kaipitole
        this.noFightingRounds = 0; //Nombre de rounds passés sans combattre
        this.victims = []; //Liste contenant ceux tués par le joueur
        this.semiFinalPoints = 0;
        this.finalPoints = 0;
        this.firstAidKit = 0;
        this.representation = document.getElementById("J" + this.number); //Case dans laquelle est affiché le pseudo du joueur
        this.colors = ["#8D0D18", "#8D420D", "#8D820D", "#588D0D", "#188D0D", "#0D8D42", "#0D8D82", "#0D588D", "#0D188D", "#420D8D", "#820D8D", "#8D0D58"];
        this.districtColor = this.colors[this.district - 1];
    }
    dies(killer, combatNumber) { //Méthode appelée lorsque le joueur se fait tué
        if (this.isAlive && this.isKaipitole == false) {
            killer.kills++; //Celui qui a tué le joueur gagne 1 kill
            killer.addAVictim(this.pseudo); //Le joueur est ajouté aux victimes de celui qui l'a tué
            killer.isLastWinner = true; //Celui qui a tué le joueur est déclaré vainqueur du dernier round
            this.wasKilledBy = killer.pseudo; //Le joueur enregistre le pseudo de celui qui l'a tué
            this.killedAtRound = round; //Le round où le joueur a été tué est enregistré
            this.isAlive = false; //Le joueur n'est plus en vie
            this.representation.setAttribute('style', 'background-color : grey'); //La case du joueur est grisée
            if (round == 1) { //Si le joueur est tué au premier round c'est enregistré
                this.wasFirstKilled = true;
            }
            if (this.chosenNumber == killer.chosenNumber) { //Si le joueur s'est entretué avec quelqu'un
                this.interKilled = true;
            }
            manageKillFeed(this, killer, combatNumber, this.interKilled, this.twoVsOne);
        }
    }
    diesAtSemiFinal(killer) {
        killer.kills++;
        killer.addAVictim(this.pseudo);
        this.wasKilledBy = killer.pseudo;
        this.isAlive = false;
    }
    isEliminated() { //Méthode appelée si le joueur est éliminé car il est AFK
        this.killedAtRound = round; //Le round où le joueur a été éliminé est enregistré
        this.isAlive = false; //Le joueur n'est plus en vie
        this.representation.setAttribute('style', 'background-color : dimgrey'); //La case du joueur est grisée foncé
        if (round == 1) { //Si le joueur est éliminé au premier round c'est enregistré
            this.wasFirstKilled = true;
            this.wasAFK = true;
        }
        if (this.isKaipitole == false) {
            let paragraphe = document.createElement('p');
            let text = document.createTextNode("Elimination pour cause d'inactivite de " + this.pseudo);
            paragraphe.appendChild(text);
            document.getElementById("division_type").appendChild(paragraphe);
        }
    }
    get_distance(n) { //Méthode appelée pour renvoyer la distance modulo 100 entre le nombre choisi par le joueur et celui tiré aléatoirement
        return Math.min(Math.abs(this.chosenNumber - n), Math.abs(Math.abs(this.chosenNumber - n) - 100));
    }
    addAVictim(pseudo) { //Méthode appelée pour ajouter une victime à la liste du joueur
        this.victims = this.victims + pseudo;
    }
    dodgesKaipitole() {
        this.dodgedKaipitole++;
        let Kaipitole = players[players.length - 1];
        let paragraphe = document.createElement('p');
        let numberRound = document.createTextNode("Round " + round);
        let pseudosAndChosenNumbers = document.createTextNode("Kaipitole" + " , " + Kaipitole.chosenNumber + "   " + this.chosenNumber + " , " + this.pseudo);
        let results = document.createTextNode(this.pseudo + " a esquive le Kaipitole");
        paragraphe.appendChild(numberRound);
        if (this.interkilled) { paragraphe.appendChild(document.createTextNode(" : (egalite)")); }
        if (this.twoVsOne) { paragraphe.appendChild(document.createTextNode(" : (2 vs 1)")); }
        paragraphe.appendChild(document.createElement("br"));
        paragraphe.appendChild(pseudosAndChosenNumbers);
        paragraphe.appendChild(document.createElement("br"));
        paragraphe.appendChild(results);
        document.getElementById("division_type").appendChild(paragraphe);
        return 0;
    }
    revive() {
        this.isAlive = true;
        this.representation.setAttribute('style', 'background-color : ' + this.colors[this.district - 1]);
        alert(this.pseudo + " a ressucite !");
        let paragraphe = document.createElement('p');
        let text = document.createTextNode("Resurrection de " + this.pseudo);
        paragraphe.appendChild(text);
        document.getElementById("division_type").appendChild(paragraphe);
    }
    fightsTwoVsOne() {
        this.twoVsOne = true;
    }
    unFightsTwoVsOne() {
        this.twoVsOne = false;
    }
}

function getDistance(player, combatNumber) {
    return Math.min(Math.abs(player.chosenNumber - combatNumber), Math.abs(Math.abs(player.chosenNumber - combatNumber) - 100));
}

//#region StartingGame

function storeItems() {
    let stringPlayers = JSON.stringify(players);
    let stringRound = JSON.stringify(round);
    let stringRoundCombatDone = JSON.stringify(roundCombatDone);
    let stringPlayersInFight = JSON.stringify(playersInFight);
    localStorage.setItem("players", stringPlayers);
    localStorage.setItem("playersInFight", stringPlayersInFight);
    localStorage.setItem("roundCombatDone", stringRoundCombatDone);
    localStorage.setItem("round", stringRound);
}

function fillPlayers() {
    players = [];
    let n = 36;
    for (k = 0; k < n; k++) {
        let number = k;
        let pseudo = document.getElementById('J' + k).value;
        if (pseudo == '') { continue; }
        else {
            let district = Math.trunc(k / 3) + 1;
            let player = new Player(pseudo, district, number);
            players.push(player);
        }
    }
  if (document.getElementById('J36').value != '') {
	let kaipitole = new Player("Kaipitole", 0, n);
	kaipitole.isKaipitole = true;
	players.push(kaipitole);
  }
}

function unGrey() {
    let colors = ["#8D0D18", "#8D420D", "#8D820D", "#588D0D", "#188D0D", "#0D8D42", "#0D8D82", "#0D588D", "#0D188D", "#420D8D", "#820D8D", "#8D0D58"];
    let j = 0;
    for (k = 0; k < 36; k++) {
        j = Math.trunc(k / 3);
        document.getElementById("J" + k).setAttribute("style", "background-color : " + colors[j]);
    }
}

function emptyKillFeed() {
    document.getElementById("division_type").innerHTML = "";
}

function initialize() {
    let c = confirm("Etes-vous sur de vouloir lancer une nouvelle partie ?");
    if (c == true) {
        alert("Nouvelle partie");
        round = 1;
        players = [];
        fillPlayers();
        roundCombatDone = false;
        playersInFight = [];
        storeItems();
        unGrey();
        emptyKillFeed();
    }
    else {
        alert("La partie continue");
    }
}

//#endregion

//#region SelectingPlayers


function updateCombatsAndLastWinners() {
    for (k = 0; k < players.length - 1; k++) {
        players[k].isLastWinner = false;
        players[k].inCombat = false;
    }
}

function pickRandomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function pickRandomPlayer() {
    let randomNumber = pickRandomNumber(0, players.length - 1);
    while (players[randomNumber].isAlive == false || players[randomNumber].isLastWinner == true) {
        randomNumber = pickRandomNumber(0, players.length - 1);
    }
    return randomNumber;
}

function pickRandomPlayer2(n1) {
    let randomNumber = pickRandomNumber(0, players.length - 1);
    while (players[randomNumber].isAlive == false || (players[randomNumber].isLastWinner == true && players[n1].district != players[randomNumber].district)) {
        randomNumber = pickRandomNumber(0, players.length - 1);
    }
    return randomNumber;
}

function addNumberBox() {
    let numberBox = document.createElement('input');
    numberBox.type = "number";
    numberBox.size = 3;
    numberBox.min = 1;
    numberBox.max = 100;
    numberBox.id = "N11";
    numberBox.name = "nombre";
    numberBox.value = 0;
    numberBox.required = true;
    document.getElementById('Combattant_1').appendChild(numberBox);
}

function deleteNumberBox() {
    if (document.getElementById("Combattant_1").contains(document.getElementById("N11"))) {
        let element = document.getElementById("N11");
        element.remove();
    }
}

function findKillLeader() {
    let maxKills = 1;
    for (k = 0; k < players.length - 1; k++) {
        if (players[k].kills > maxKills) {
            maxKills = players[k].kills;
        }
        players[k].isKillLeader = false;
    }

    for (k = 0; k < players.length - 1; k++) {
        if (players[k].kills >= maxKills) {
            players[k].isKillLeader = true;
        }
    }
}

function choosePlayers() {
    findKillLeader();
    deleteNumberBox();
    let nPlayer1 = pickRandomPlayer();
    let nPlayer2 = pickRandomPlayer2(nPlayer1);
    let nPlayer3 = -1;
    let s1 = "";
    let s2 = "";
    let s3 = "";
    while (nPlayer1 == nPlayer2) { nPlayer2 = pickRandomPlayer2(nPlayer1); }
    let player1 = players[nPlayer1];
    let player2 = players[nPlayer2];
    if (player1.district == player2.district) {
        nPlayer3 = pickRandomPlayer();
        while (nPlayer1 == nPlayer3 || nPlayer2 == nPlayer3 || player1.district == players[nPlayer3].district) {
            nPlayer3 = pickRandomPlayer();
        }
        updateCombatsAndLastWinners();
        let player3 = players[nPlayer3];

        document.getElementById('pseudo2').innerHTML = player3.pseudo;
        if (player1.kills > 1) {
            s1 = "s";
        }
        if (player2.kills > 1) {
            s2 = "s";
        }
        if (player3.kills > 1) {
            s3 = "s";
        }
        document.getElementById('districtj2').innerHTML = "District " + player3.district;
        if (player3.isKillLeader == true) {
            document.getElementById('nkills2').innerHTML = player3.kills + " kill" + s3 + " KILL LEADER";
        }
        else {
            document.getElementById('nkills2').innerHTML = player3.kills + " kill" + s3;
        }

        document.getElementById('pseudo1').innerHTML = player1.pseudo + " et " + player2.pseudo;
        document.getElementById('districtj1').innerHTML = "District " + player1.district;
        if (player1.isKillLeader == true && player2.isKillLeader == false) {
            document.getElementById('nkills1').innerHTML = player1.kills + " kill" + s1 + " KILL LEADER" + " ; " + player2.kills + " kill" + s2;
        }
        else if (player2.isKillLeader == true && player1.isKillLeader == false) {
            document.getElementById('nkills1').innerHTML = player1.kills + " kill" + s1 + " ; " + player2.kills + " kill" + s2 + " KILL LEADER";
        }
        else if (player1.isKillLeader == true && player2.isKillLeader == true) {
            document.getElementById('nkills1').innerHTML = player1.kills + " kill" + s1 + " KILL LEADER" + " ; " + player2.kills + " kill" + s2 + " KILL LEADER";
        }
        else {
            document.getElementById('nkills1').innerHTML = player1.kills + " kill" + s1 + " ; " + player2.kills + " kill" + s2;
        }
        player1.inCombat = true;
        player2.inCombat = true;
        player3.inCombat = true;
        player1.noFightingRounds = 0;
        player2.noFightingRounds = 0;
        player3.noFightingRounds = 0;
        addNumberBox();
        return [player1, player2, player3];
    }
    else {
        updateCombatsAndLastWinners();
        if (player1.kills > 1) {
            s1 = "s";
        }
        if (player2.kills > 1) {
            s2 = "s";
        }
        document.getElementById('pseudo1').innerHTML = player1.pseudo;
        document.getElementById('districtj1').innerHTML = "District " + player1.district;
        if (player1.isKillLeader == true) {
            document.getElementById('nkills1').innerHTML = player1.kills + " kill" + s1 + " KILL LEADER";
        }
        else {
            document.getElementById('nkills1').innerHTML = player1.kills + " kill" + s1;
        }
        document.getElementById('pseudo2').innerHTML = player2.pseudo;
        document.getElementById('districtj2').innerHTML = "District " + player2.district;
        if (player2.isKillLeader == true) {
            document.getElementById('nkills2').innerHTML = player2.kills + " kill" + s2 + " KILL LEADER";
        }
        else {
            document.getElementById('nkills2').innerHTML = player2.kills + " kill" + s2;
        }
        player1.inCombat = true;
        player2.inCombat = true;
        player1.noFightingRounds = 0;
        player2.noFightingRounds = 0;
        return [player1, player2];
    }
}

//#endregion

//#region Fighting

function duel() {
  	let kaipitole = playersInFight[0];
    let challenger = playersInFight[1];
    kaipitole.chosenNumber = document.getElementById('N1');
    challenger.chosenNumber = document.getElementById('N2');
    let combatNumber = pickRandomNumber(1, 100);
    let d1 = Math.min(Math.abs(kaipitole.chosenNumber - combatNumber), Math.abs(Math.abs(kaipitole.chosenNumber - combatNumber) - 100));
    let d2 = Math.min(Math.abs(challenger.chosenNumber - combatNumber), Math.abs(Math.abs(challenger.chosenNumber - combatNumber) - 100));
    if (d1 > d2) { alert("ca va plus");}
    document.getElementById("affichage_nombre").innerHTML = combatNumber;
}

function district(player) {
    let districtMembers = [];
    for (k = 0; k < players.length; k++) {
        if (players[k].district == player.district) {
            districtMembers.push(players[k]);
        }
    }
    return districtMembers;
}

function decideWinner(fightingPlayers) {
    let combatNumber = pickRandomNumber(1, 100);
    document.getElementById("affichage_nombre").innerHTML = combatNumber;
    if (fightingPlayers.length == 2) {
        let player1 = fightingPlayers[0];
        let player2 = fightingPlayers[1];
        player1.chosenNumber = document.getElementById('N1').value;
        player2.chosenNumber = document.getElementById('N2').value;

        if (player1.chosenNumber == 0 || player2.chosenNumber == 0) {
            fightingPlayers.forEach(player => { if (player.chosenNumber == 0) { player.isEliminated(); } });
            return 0;
        }
        else if (player1.chosenNumber == player2.chosenNumber) {
            player2.dies(player1, combatNumber);
            player1.dies(player2, combatNumber);
        }
        else if (player1.chosenNumber == combatNumber) {
            if (player1.isKaipitole == true) {
                district(player2).forEach(elt => elt.dies(player1, combatNumber));
            }
            else {
                if (player2.isKaipitole == true) { player1.dodgesKaipitole(); }
                else { player2.dies(player1, combatNumber); }
                player1.firstAidKit++;
                alert("Le district " + player1.district + " possede desormais un kit de sante");
            }
        }
        else if (player2.chosenNumber == combatNumber) {
            if (player2.isKaipitole == true) {
                district(player1).forEach(elt => elt.dies(player2, combatNumber));
            }
            else {
                if (player1.isKaipitole == true) { player2.dodgesKaipitole(); }
                else { player1.dies(player2, combatNumber); }
                player2.firstAidKit++;
                alert("Le district " + player2.district + " possede desormais un kit de sante");
            }
        }

        if (player1.get_distance(combatNumber) < player2.get_distance(combatNumber)) {
            if (player2.isKaipitole == false) {
                player2.dies(player1, combatNumber);
            }
            else { player1.dodgesKaipitole(); }
        }
        else if (player1.get_distance(combatNumber) > player2.get_distance(combatNumber)) {
            if (player1.isKaipitole == false) {
                player1.dies(player2, combatNumber);
            }
            else { player2.dodgesKaipitole(); }
        }
        else {
            if (player1.isKaipitole == false && player2.isKaipitole == false) {
                player2.dies(player1, combatNumber);
                player1.dies(player2, combatNumber);
            }
            else if (player1.isKaipitole == true) {
                player2.dies(player1, combatNumber);
            }
            else if (player2.isKaipitole == true) {
                player1.dies(player2, combatNumber);
            }
        }
    }
    else {
        let player1 = fightingPlayers[0];
        let player2 = fightingPlayers[1];
        let player3 = fightingPlayers[2];
        for (let k = 0; k < 3; k++) {
            fightingPlayers[k].fightsTwoVsOne();
        }
        player1.chosenNumber = document.getElementById('N1').value;
        player2.chosenNumber = document.getElementById('N11').value;
        player3.chosenNumber = document.getElementById('N2').value;
        if (player1.chosenNumber == 0 || player2.chosenNumber == 0 || player3.chosenNumber == 0) {
            fightingPlayers.forEach(player => { if (player.chosenNumber == 0) { player.isEliminated(); } });
            return 0;
        }
        if (player3.get_distance(combatNumber) > player1.get_distance(combatNumber)) {
            if (player3.isKaipitole == false) {
                player3.dies(player1, combatNumber);
            }
            else { player1.dodgesKaipitole(); }
        }
        else if (player3.get_distance(combatNumber) > player2.get_distance(combatNumber)) {
            if (player3.isKaipitole == false) {
                player3.dies(player2, combatNumber);
            }
            else { player2.dodgesKaipitole(); }
        }
        else if (player3.get_distance(combatNumber) < player1.get_distance(combatNumber) && player3.get_distance(combatNumber) < player2.get_distance(combatNumber)) {
            player1.dies(player3, combatNumber);
            player2.dies(player3, combatNumber);
        }
        else if (player1.get_distance(combatNumber) == player2.get_distance(combatNumber) && player1.get_distance(combatNumber) < player3.get_distance(combatNumber)) {
            if (player3.isKaipitole == false) {
                if (player1.chosenNumber < player2.chosenNumber) {
                    player3.dies(player1, combatNumber);
                }
                else {
                    player3.dies(player2, combatNumber);
                }
            }
            else {
                player2.dodgesKaipitole();
                player1.dodgesKaipitole();
            }
        }
        else if (player3.get_distance(combatNumber) < player1.get_distance(combatNumber) && player2.get_distance(combatNumber) == player3.get_distance(combatNumber)
            || player3.get_distance(combatNumber) < player2.get_distance(combatNumber) && player1.get_distance(combatNumber) == player3.get_distance(combatNumber)) {
            player1.dies(player3, combatNumber);
            player2.dies(player3, combatNumber);
        }
        else if (player3.chosenNumber == combatNumber) {
            if (player3.isKaipitole == true) {
                district(player1).forEach(elt => elt.dies(player3, combatNumber));
            }
            else {
                player1.dies(player3, combatNumber);
                player2.dies(player3, combatNumber);
                player3.firstAidKit++;
                alert("Le district " + player3.district + " possede desormais un kit de sante");
            }
        }
        else if (player1.chosenNumber == combatNumber) {
            if (player3.isKaipitole == false) {
                player3.dies(player1, combatNumber);
                player1.firstAidKit++;
                alert("Le district " + player1.district + " possede desormais un kit de sante");
            }
            else {
                player1.dodgesKaipitole();
                player1.firstAidKit++;
                alert("Le district " + player1.district + " possede desormais un kit de sante");
            }
        }
        else if (player2.chosenNumber == combatNumber) {
            if (player3.isKaipitole == false) {
                player3.dies(player2, combatNumber);
                player2.firstAidKit++;
                alert("Le district " + player2.district + " possede desormais un kit de sante");
            }
            else {
                player2.dodgesKaipitole();
                player2.firstAidKit++;
                alert("Le district " + player2.district + " possede desormais un kit de sante");
            }
        }
        for (let k = 0; k < 3; k++) {
            fightingPlayers[k].unFightsTwoVsOne();
        }
    }
    deleteNumberBox();
    if (alivePlayers().length <= 3) {
        document.getElementById("bouton_choix_viewer").value = "Lancer l'etape suivante";
    }
    return 0;
}

//#endregion


//#region ExecutedAtEachRound

function manageKillFeed(loser, winner, combatNumber, interkilled, twoVsOne) {
    let paragraphe = document.createElement('p');
    let numberRound = document.createTextNode("Round " + round);
    let pseudosAndChosenNumbers = document.createTextNode(loser.pseudo + " , " + loser.chosenNumber + "   " + winner.chosenNumber + " , " + winner.pseudo);
    let results = document.createTextNode("Defaite " + combatNumber + " Victoire");
    paragraphe.appendChild(numberRound);
    if (interkilled) { paragraphe.appendChild(document.createTextNode(" : (egalite)")); }
    if (twoVsOne) { paragraphe.appendChild(document.createTextNode(" : (2 vs 1)"));}
    paragraphe.appendChild(document.createElement("br"));
    paragraphe.appendChild(pseudosAndChosenNumbers);
    paragraphe.appendChild(document.createElement("br"));
    paragraphe.appendChild(results);
    document.getElementById("division_type").appendChild(paragraphe);
    return 0;
}

function takeBackKaipitole() {
    for (k = 0; k < players.length; k++) {
        if (players[k].isKaipitole == true) {
            players[k].isEliminated();
        }
    }
}

function alivePlayers() {
    let listAlivePlayers = [];
    for (k = 0; k < players.length; k++) {
        if (players[k].isAlive == true) {
            listAlivePlayers.push(players[k]);
        }
    }
    return listAlivePlayers;
}

function manageAchievements() {
    return 0;
}

//#endregion

function getStoredItems() {
    round = JSON.parse(localStorage.getItem("round"));
    players = JSON.parse(localStorage.getItem("players"));
    playersInFight = JSON.parse(localStorage.getItem("playersInFight"));
    roundCombatDone = JSON.parse(localStorage.getItem("roundCombatDone"));
}


function goToSemiFinal() {
    document.location.href = "DemiFinale.html";
}

function goToFinal() {
    document.location.href = "Finale.html";
}

function goToIntraDistrictFinal() {
    document.location.href = "FinaleIntraDistrict.html";
}

function goToEcranFin() {
    document.location.href = ecranFinUrl;
}


function newRound() {
    if (players.length == 0) { alert("La partie n'est pas encore lancee"); return 0;}
    players.forEach(function (elt) { if (elt.isAlive == true) { elt.noFightingRounds++; } elt.chosenNumber = -1; });
    if (alivePlayers().length > 3) {
        playersInFight = choosePlayers();
    }
    else if (alivePlayers().length == 3) {
        playersInFight = chooseSemiFinalists(alivePlayers());
        storeItems();
        if (playersInFight.length == 2) {
            alert("C'est l'heure de la demi-finale !")
            goToSemiFinal();
        }
        else if (playersInFight.length == 3) {
            alert("C'est l'heure de la finale en 2v1 !")
            chooseFinalists();
        }
        else if (playersInFight.length == 1) {
            alert("Par deux ils vont, c'est pourquoi le ASAR elimine " + playersInFight[0].pseudo);
            alert("C'est l'heure de la finale intra district")
            playersInFight = alivePlayers();
            if (playersInFight.length > 2) { alert("Mais WTF !!!"); }
            chooseFinalists();
        }
        else {
            alert("Cette situation n'avait pas ete anticipee");
        }
    }
    else if (alivePlayers().length == 2) {
        if (alivePlayers()[0].isKaipitole) {
            playersInFight = [alivePlayers()[0], alivePlayers()[1]];
            document.getElementById('pseudo1').innerHTML = alivePlayers()[0].pseudo;
            document.getElementById('pseudo2').innerHTML = alivePlayers()[1].pseudo;
            alert("Le duel est pret a commencer");
        }
        else if (alivePlayers()[1].isKaipitole) {
            playersInFight = [alivePlayers()[1], alivePlayers()[0]];
            document.getElementById('pseudo1').innerHTML = alivePlayers()[1].pseudo;
            document.getElementById('pseudo2').innerHTML = alivePlayers()[0].pseudo;
            alert("Le duel est pret a commencer");
        }
        else {
            playersInFight = alivePlayers();
            storeItems();
            chooseFinalists();
        }
    }
    else {
        alert("Situation non anticipee");
    }
    manageAchievements();
    roundCombatDone = false;
    return 0;
}

function useFirstAidKit(event) {
    let name = event.target.value;
    for (k = 0; k < players.length; k++) {
        let player = players[k];
        if (player.pseudo == name && player.isAlive == false) {
            let d = district(player);
            if (d.length == 2) {
                if (d[0].firstAidKit > 0) {
                    player.revive();
                    d[0].firstAidKit--;
                }
                else if (d[1].firstAidKit > 0) {
                    player.revive();
                    d[1].firstAidKit--;
                }
                else {
                    if (d.length == 3) {
                        if (d[2].firstAidKit > 0) {
                            player.revive();
                            d[2].firstAidKit--;
                        }
                    }
                }
            }
        }
    }
    document.getElementById("bouton_choix_viewer").value = "Choisir les combattants";
    return 0;
}

function fight() {
    document.getElementById("bouton_choix_viewer").value = "Choisir les combattants";
    if (alivePlayers().length > 3 && roundCombatDone == false && round > 0) {
        roundCombatDone = true;
        decideWinner(playersInFight);
	    round++;
    }
  	else if (alivePlayers().length == 2 && round > 0 && roundCombatDone == false) {
	  	duel();
	}
    else {
        alert("Kaiden tu abuses");
    }
    if (alivePlayers().length <= 11 && alivePlayers().length > 2) { takeBackKaipitole(); }
}


//#region SemiFinal

function takeOutDead(guys, dead) {
    let newList = [];
    for (k = 0; k < guys.length; k++) {
        if (guys[k].pseudo != dead.pseudo) {
            newList.push(guys[k]);
        }
    }
    return newList;
}

function semiFinalPlayers(semiFinalist1, semiFinalist2) {
    let remainingPlayers = alivePlayers();
    let finalist = new Player("none", -1, -1);
    remainingPlayers.forEach(function (player) { if (player.pseudo != semiFinalist1.pseudo && player.pseudo != semiFinalist2.pseudo) { finalist = player; } });
    let j1 = document.createElement("p");
    j1.appendChild(document.createTextNode(semiFinalist1.pseudo));
    document.getElementById("Joueur_1").innerHTML = "";
    document.getElementById("Joueur_1").appendChild(j1);
    let j2 = document.createElement("p");
    j2.appendChild(document.createTextNode(semiFinalist2.pseudo));
    document.getElementById("Joueur_2").innerHTML = "";
    document.getElementById("Joueur_2").appendChild(j2);
    document.getElementById("Joueur_Finaliste").innerHTML = "Finaliste :      " + finalist.pseudo;
}

function semiFinal() {
    getStoredItems();
    if (document.getElementById("Joueur_Finaliste").innerHTML == "") {
        semiFinalPlayers(playersInFight[0], playersInFight[1]);
        document.getElementById("bouton_aleatoire").value = "Lancer le combat";
        document.getElementById("affichage_nombre").innerHTML = "";
        return 0;
    }
    let semiFinalist1 = playersInFight[0];
    let semiFinalist2 = playersInFight[1];
    if (semiFinalist1.semiFinalPoints >= 2) {
        playersInFight = takeOutDead(alivePlayers(), semiFinalist2);
        semiFinalist2.isAlive = false;
        alert("Le gagnant de la demi finale est " + semiFinalist1.pseudo);
        storeItems();
        chooseFinalists();
        return 0;
    }
    else if (semiFinalist2.semiFinalPoints >= 2) {
        playersInFight = takeOutDead(alivePlayers(), semiFinalist1);
        semiFinalist1.isAlive = false;
        alert("Le gagnant de la demi finale est " + semiFinalist2.pseudo);
        storeItems();
        chooseFinalists();
        return 0;
    }
    let combatNumber = pickRandomNumber(1, 100);
    document.getElementById("affichage_nombre").innerHTML = combatNumber;
    semiFinalist1.chosenNumber = document.getElementById("N1").value;
    semiFinalist2.chosenNumber = document.getElementById("N2").value;
  
  	if (semiFinalist1.chosenNumber == 0) { semiFinalist2.semiFinalPoints = 3; }
    else if (semiFinalist2.chosenNumber == 0) { semiFinalist1.semiFinalPoints = 3;}

    if (getDistance(semiFinalist1, combatNumber) < getDistance(semiFinalist2, combatNumber)) {
        semiFinalist1.semiFinalPoints++;
    }
    else if (getDistance(semiFinalist1, combatNumber) > getDistance(semiFinalist2, combatNumber)) {
        semiFinalist2.semiFinalPoints++;
    }
    else {
        alert("Manche a egalite")
        storeItems();
        return 0;
    }

    if (semiFinalist1.semiFinalPoints >= 2 || semiFinalist2.semiFinalPoints >= 2) {
        document.getElementById("bouton_aleatoire").value = "Lancer la finale";
    }

    document.getElementById("Score").innerHTML = semiFinalist1.semiFinalPoints + " -  " + semiFinalist2.semiFinalPoints;
    storeItems();
    return 0;
}

function hasFoughtAndSameDistrict(player1, player2, player3) {
    if (player1.isLastWinner && player2.district == player3.district) {
        return true
    }
    else {
        return false
    }
}

function chooseSemiFinalists(demiFinalists) {
    let semiFinalist1 = demiFinalists[0];
    let semiFinalist2 = demiFinalists[1];
    let semiFinalist3 = demiFinalists[2];
    if (semiFinalist1.isLastWinner == true && semiFinalist2.district != semiFinalist3.district) {
        return [semiFinalist2, semiFinalist3];
    }
    else if (semiFinalist2.isLastWinner == true && semiFinalist1.district != semiFinalist3.district) {
        return [semiFinalist1, semiFinalist3];
    }
    else if (semiFinalist3.isLastWinner == true && semiFinalist1.district != semiFinalist2.district) {
        return [semiFinalist1, semiFinalist2];
    }
    else if (semiFinalist1.district == semiFinalist2.district && semiFinalist2.district == semiFinalist3.district) {
        let n = pickRandomNumber(0, 2);
        demiFinalists[n].isEliminated();
        return [demiFinalists[n]];
    }
    else if (hasFoughtAndSameDistrict(semiFinalist1, semiFinalist2, semiFinalist3)) {
        return [semiFinalist1, semiFinalist2, semiFinalist3];
    }
    else if (hasFoughtAndSameDistrict(semiFinalist2, semiFinalist1, semiFinalist3)) {
        return [semiFinalist2, semiFinalist1, semiFinalist3];
    }
    else if (hasFoughtAndSameDistrict(semiFinalist3, semiFinalist1, semiFinalist2)) {
        return [semiFinalist3, semiFinalist1, semiFinalist2];
    }
    else if (semiFinalist1.isLastWinner == false && semiFinalist2.isLastWinner == false && semiFinalist3.isLastWinner == false) {
        let chosenPlayer1 = demiFinalists[pickRandomNumber(0, 2)];
        let chosenPlayer2 = demiFinalists[pickRandomNumber(0, 2)];
        while (chosenPlayer1.district == chosenPlayer2.district) {
            chosenPlayer2 = demiFinalists[pickRandomNumber(0, 2)];
        }
        return [chosenPlayer1, chosenPlayer2];
    }
    else {
        alert("Cette situation n'avait pas été anticipée")
        return [];
    }
}

//#endregion

//#region Final

function addFinalBox1() {
    let numberBox = document.createElement('input');
    numberBox.type = "number";
    numberBox.size = 3;
    numberBox.min = 1;
    numberBox.max = 100;
    numberBox.id = "N11";
    numberBox.name = "nombre";
    numberBox.value = 0;
    numberBox.required = true;
    document.getElementById('Nombre_1').appendChild(numberBox);
}

function addFinalBox2() {
    let numberBox = document.createElement('input');
    numberBox.type = "number";
    numberBox.size = 3;
    numberBox.min = 1;
    numberBox.max = 100;
    numberBox.id = "N22";
    numberBox.name = "nombre";
    numberBox.value = 0;
    numberBox.required = true;
    document.getElementById('Nombre_2').appendChild(numberBox);
}

function deleteFinalBox() {
    if (document.getElementById("Nombre_1").contains(document.getElementById("N11"))) {
        let element = document.getElementById("N11");
        element.remove();
    }
    if (document.getElementById("Nombre_2").contains(document.getElementById("N22"))) {
        let element = document.getElementById("N22");
        element.remove();
    }
}

function chooseFinalists() {
    storeItems();
    getStoredItems();
    if (playersInFight.length == 2 && playersInFight[0].district == playersInFight[1].district) {
        goToIntraDistrictFinal();
        return 0;
    }
    else {
        goToFinal();
        return 0;
    }
    return 0;
}

function belongsTo(player, liste) {
    for (let k = 0; k < liste.length; k++)
    {
        if (liste[k].pseudo == player.pseudo) {
            return true;
        }
    }
    return false;
}

function displayFinaldistricts() {
    let district1Duo = false;
    let district2Duo = false;
    for (let k = 0; k < 2; k++) {
        for (let j = 0; j < district(playersInFight[k]).length; j++) {
            let p = document.createElement("p");
            p.appendChild(document.createTextNode(district(playersInFight[k])[j].pseudo));
            let L = "";
            if (k == 0) {
                L = "A";
            }
            else {
                L = "B";
            }
            document.getElementById(L + j).innerHTML = "";
            document.getElementById(L + j).appendChild(p);
            if (belongsTo(district(playersInFight[k])[j],playersInFight)) {
                document.getElementById(L + j).setAttribute("style", "background-color : " + district(playersInFight[k])[j].districtColor);
                if (k == 0) {
                    if (district1Duo == true) {
                        addFinalBox1();
                    }
                    district1Duo = true;
                }
                else if (k == 1) {
                    if (district2Duo == true) {
                        addFinalBox2();
                    }
                    district2Duo = true;
                }
            }
            else {
                document.getElementById(L + j).setAttribute("style", "background-color : grey");
            }
        }
        document.getElementById("D" + (k+1)).innerHTML = " <strong> District " + playersInFight[k].district + " </strong>";
    }
}


function final() {
    getStoredItems();
    if (document.getElementById("A0").innerHTML == "") {
        displayFinaldistricts();
        document.getElementById("affichage_nombre").innerHTML = "";
        document.getElementById("bouton_aleatoire").value = "Lancer le combat";
        return 0;
    }
    if (playersInFight.length == 2) {
        let finalist1 = playersInFight[0];
        let finalist2 = playersInFight[1];
        if (finalist1.finalPoints >= 3) {
            alert("Le gagnant des Kunger Games est " + finalist1.pseudo + " et le district " + finalist1.district + " !");
            findKillLeader();
            for (let k = 0; k < players.length - 1; k++) {
                if (players[k].isKillLeader) {
                    alert(players[k].pseudo + " est MVP ! Malheur a ceux qui ont croise son chemin...");
                }
            }
            storeItems();
            return 0;
        }
        else if (finalist2.finalPoints >= 3) {
            alert("Le gagnant des Kunger Games est " + finalist2.pseudo + " et le district " + finalist2.district + " !");
            findKillLeader();
            for (let k = 0; k < players.length - 1; k++) {
                if (players[k].isKillLeader) {
                    alert(players[k].pseudo + " est MVP ! Malheur a ceux qui ont croise son chemin...");
                }
            }
            storeItems();
            return 0;
        }
        let combatNumber = pickRandomNumber(1, 100);
        document.getElementById("affichage_nombre").innerHTML = combatNumber;
        finalist1.chosenNumber = document.getElementById("N1").value;
        finalist2.chosenNumber = document.getElementById("N2").value;
        if (getDistance(finalist1, combatNumber) < getDistance(finalist2, combatNumber) && finalist1.finalPoints < 3 && finalist2.finalPoints < 3) {
            finalist1.finalPoints++;
        }
        else if (getDistance(finalist1, combatNumber) > getDistance(finalist2, combatNumber) && finalist2.finalPoints < 3 && finalist1.finalPoints < 3) {
            finalist2.finalPoints++;
        }
        else {
            alert("Manche a egalite")
            storeItems();
            return 0;
        }
        let s = document.createElement("p");
        s.appendChild(document.createTextNode(finalist1.finalPoints + "  -  " + finalist2.finalPoints));
        document.getElementById("Score").innerHTML = "";
        document.getElementById("Score").appendChild(s);
        if (finalist1.finalPoints > 2 || finalist2.finalPoints > 2) { document.getElementById("bouton_aleatoire").value = "Afficher les resultats";}
    }
    else if (playersInFight.length == 3) {
        let finalist1 = playersInFight[0];
        let finalist2 = playersInFight[1];
        let finalist3 = playersInFight[2];
        if (playersInFight[0].district == finalist3.district) {
            finalist1 = playersInFight[1];
            finalist2 = playersInFight[0];
        }
        if (finalist1.finalPoints >= 2) {
            alert("Le gagnant des Kunger Games est " + finalist1.pseudo + " et le district " + finalist1.district + " !");
            findKillLeader();
            for (let k = 0; k < players.length - 1; k++) {
                if (players[k].isKillLeader) {
                    alert(players[k].pseudo + " est MVP ! Malheur a ceux qui ont croise son chemin...");
                }
            }
        }
        else if (finalist2.finalPoints >= 2) {
            alert("C'est l'heure de la finale intra district !");
            playersInFight = takeOutDead(alivePlayers(), finalist1);
            finalist1.isAlive = false;
            storeItems();
            goToIntraDistrictFinal();
            return 0;
        }
        let combatNumber = pickRandomNumber(1, 100);

        document.getElementById("affichage_nombre").innerHTML = combatNumber;

        finalist1.chosenNumber = document.getElementById("N1").value;
        finalist2.chosenNumber = document.getElementById("N2").value;
        if (document.getElementById("Nombre_1").contains(document.getElementById("N11"))) {
            finalist3.chosenNumber = document.getElementById("N11").value;
        }
        else if (document.getElementById("Nombre_2").contains(document.getElementById("N22"))) {
            finalist3.chosenNumber = document.getElementById("N22").value;
        }

        if (getDistance(finalist1, combatNumber) < getDistance(finalist2, combatNumber) && getDistance(finalist1, combatNumber) < getDistance(finalist3, combatNumber)) {
            finalist1.finalPoints++;
        }
        else if (getDistance(finalist1, combatNumber) > getDistance(finalist2, combatNumber) || getDistance(finalist1, combatNumber) > getDistance(finalist3, combatNumber)) {
            finalist2.finalPoints++;
        }
        else {
            alert("Manche a egalite")
            storeItems();
            return 0;
        }

        let s = document.createElement("p");
        s.appendChild(document.createTextNode(finalist1.finalPoints + "  -  " + finalist2.finalPoints));
        document.getElementById("Score").innerHTML = "";
        document.getElementById("Score").appendChild(s);
        if (finalist1.finalPoints > 2 || finalist2.finalPoints > 2 || finalist3.finalPoints > 2) { document.getElementById("bouton_aleatoire").value = "Terminer la game"; }
    }
    else {
        alert("Situation non anticipée");
    }
    storeItems();
    return 0;
}

//#endregion

//#region IntraDistrictFinal

function intraDistrictFinal() {
    getStoredItems();
    let finalist1 = playersInFight[0];
    let finalist2 = playersInFight[1];
    if (document.getElementById("Joueur_1").innerHTML == "") {
        document.getElementById("Joueur_1").innerHTML = finalist1.pseudo;
        document.getElementById("Joueur_2").innerHTML = finalist2.pseudo;
        document.getElementById("Texte_2").innerHTML = "<p> Entre les membres du district " + finalist1.district + " </p>";
        document.getElementById("bouton_aleatoire").value = "Lancer le combat";
        storeItems();
        return 0;
    }

    let combatNumber = pickRandomNumber(1, 100);
    document.getElementById("affichage_nombre").innerHTML = combatNumber;
    finalist1.chosenNumber = document.getElementById("N1").value;
    finalist2.chosenNumber = document.getElementById("N2").value;
    if (getDistance(finalist1, combatNumber) < getDistance(finalist2, combatNumber)) {
        alert("Le gagnant des Kunger Games est " + finalist1.pseudo);
        for (let k = 0; k < players.length - 1; k++) {
            if (players[k].isKillLeader) {
                alert(players[k].pseudo + " est MVP ! Malheur a ceux qui ont croise son chemin...");
            }
        }
        storeItems();
        return 0;
    }
    else if (getDistance(finalist1, combatNumber) > getDistance(finalist2, combatNumber)) {
        alert("Le gagnant des Kunger Games est " + finalist2.pseudo);
        for (let k = 0; k < players.length - 1; k++) {
            if (players[k].isKillLeader) {
                alert(players[k].pseudo + " est MVP ! Malheur a ceux qui ont croise son chemin...");
            }
        }
        storeItems();
        return 0;
    }
    else {
        alert("Les gagnants des Kunger Games sont " + finalist1.pseudo + " et " + finalist2.pseudo);
        for (let k = 0; k < players.length - 1; k++) {
            if (players[k].isKillLeader) {
                alert(players[k].pseudo + " est MVP ! Malheur a ceux qui ont croise son chemin...");
            }
        }
        storeItems();
        return 0;
    }

    storeItems();
    return 0;
}

//#endregion


