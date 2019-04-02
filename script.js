const trumps = document.querySelectorAll('.trump');
const houses = document.querySelectorAll('.house');
const scoreboard = document.querySelector('.score');
const leaderboard = document.querySelector('.leaderboard');
const leaderboardButton = document.querySelector('.leaderboardButton');
const closeButton = document.querySelector('.close');
let lastHouse;
let timeUp = false;

// function to show Trump for random amount of time
function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

// function to show one random Trump
function randomHouse(houses) {
    const randomIndex = Math.floor(Math.random() * (houses.length))
    const house = houses[randomIndex];
    if (house === lastHouse) {
        return randomHouse(houses);
    }
    lastHouse = house;
    return house;
}

function jump() {
    const time = randomTime(300, 1000);
    const house = randomHouse(houses);
    house.classList.add('up');
    setTimeout(() => {
        house.classList.remove('up');
        if (!timeUp) jump();
    }, time);
}

trumps.forEach(trump => trump.addEventListener('click', thump));

function thump(e) {
    if(!e.isTrusted) return;
    score++;
    this.classList.remove('up');
    scoreboard.textContent = score;
}

function startGame() {
    timeUp = false;
    scoreboard.textContent = 0;
    score = 0;
    jump();
    countdown();
    setTimeout(() => {
        timeUp = true;
        swal({
            title: `You thumped ${score} ${score === 1 ? 'Trump!' : 'Trumps!'}`,
            content: "input",
            text: "Enter your name below to save your score:",
            icon: "success",
            buttons: {
                cancel: true,
                confirm: "Submit"
            }
        }).then(val => {
            userName = val;
            userScore = score;
            addToLeaderboard(userName, score);
        });
    }, 10000);
}

const countdown = () => {
    document.querySelector('.countdown').innerHTML = '10';
    let timeLeft = 9;
    let timer = setInterval(() => {
        document.querySelector('.countdown').innerHTML = `${timeLeft < 10 ? '0' : ''}${timeLeft}`;
        timeLeft -= 1;
        if (timeLeft < 0) {
            clearInterval(timer);
            document.querySelector('.countdown').innerHTML = '0';
        }
    }, 1000) 
}

const openLeaderboard = () => {
    leaderboard.style.display = "block";
}

const closeLeaderboard = (e) => {
    if (e.target === leaderboard || e.target === closeButton){
        leaderboard.style.display = "none";
    } else {
        return;
    }
}

leaderboardButton.addEventListener('click', openLeaderboard);
closeButton.addEventListener('click', closeLeaderboard);
window.addEventListener('click', closeLeaderboard);


const addToLeaderboard = (username, score) => {
    const dbRef = firebase.database().ref().child(username);
    dbRef.set({
        score
    });
    console.log(dbRef);
}
