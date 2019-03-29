const trumps = document.querySelectorAll('.trump');
const houses = document.querySelectorAll('.house');
const scoreboard = document.querySelector('.score');
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
    const time = randomTime(400, 1000);
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
    scoreboard.textContent = 0;
    score = 0;
    jump();
    setTimeout(() => {
        timeUp = true;
        swal({
            title: "Game over!",
            text: `You thumped ${score} Trumps!`,
            icon: "success"
        });
    }, 10000);
}