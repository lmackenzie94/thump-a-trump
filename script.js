const trumps = document.querySelectorAll('.trump');
const houses = document.querySelectorAll('.house');
const scoreboard = document.querySelector('.score');
const leaderboard = document.querySelector('.leaderboard');
const leaderboardButton = document.querySelector('.leaderboardButton');
const leaderboardListUser = document.querySelector('.leaderboardListUser');
const leaderboardListScore = document.querySelector('.leaderboardListScore');
const closeButton = document.querySelector('.close');
const startGameButton = document.querySelector('.start');
let lastHouse;
let timeUp = false;

// function to show Trump for random amount of time
function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

// function to select one random Trump
function randomHouse(houses) {
    const randomIndex = Math.floor(Math.random() * (houses.length))
    const house = houses[randomIndex];
    if (house === lastHouse) {
        return randomHouse(houses);
    }
    lastHouse = house;
    return house;
}

// function to make the randomly selected Trump appear for a random amount of time
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

// add to score when user successfully clicks on a visible Trump
function thump(e) {
    if(!e.isTrusted) return;
    score++;
    this.classList.remove('up');
    scoreboard.textContent = score;
}

// function to start the game
function startGame() {
    timeUp = false;
    scoreboard.textContent = 0;
    score = 0;
    jump();
    countdown();
    startGameButton.disabled = true;
    setTimeout(() => {
        timeUp = true;
        startGameButton.disabled = false;
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

// function for the game countdown
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

// function to open leaderboard modal
const openLeaderboard = () => {
    leaderboard.style.display = "block";
}

// function to close leaderboard modal
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

// function to add current user's name and most recent score to Firebase
const addToLeaderboard = (username, score) => {
    const dbRef = firebase.database().ref().child(username);
    dbRef.set({
        score
    });
    updateLeaderboard();
}

const leaderboardArray = [];

const updateLeaderboard = () => {
    
    const dbRef = firebase.database().ref();
    
    dbRef.on('value', snapshot => {
        const data = snapshot.val();
        console.log(data);
        for (entry in data) {
            leaderboardArray.push({
                user: entry,
                score: data[entry].score
            })
        }
    })

    test();
}

const test = () => {

    const sortedLeaderboardArray = leaderboardArray.sort((a,b) => {
        return (b.score - a.score);
    })


    sortedLeaderboardArray.forEach(score => {

        leaderboardListUser.innerHTML += `<li>${score.user}</li>`;
        leaderboardListScore.innerHTML += `<li>${score.score}</li>`;



    });
}
