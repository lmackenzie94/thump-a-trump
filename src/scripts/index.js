import { randomTime } from './lib';
import { config as fbConfig } from './firebaseConfig';
const trumps = document.querySelectorAll('.trump');
const houses = document.querySelectorAll('.house');
const scoreboard = document.querySelector('.score');
const leaderboard = document.querySelector('.leaderboard');
const leaderboardButton = document.querySelector('.leaderboardButton');
const leaderboardListUser = document.querySelector('.leaderboardListUser');
const leaderboardListScore = document.querySelector('.leaderboardListScore');
const closeButton = document.querySelector('.close');
const startGameButton = document.querySelector('.start');
const clickBlocker = document.querySelector('.blockClicks');
let score;
let lastHouse;
let timeUp = false;
let leaderboardArray = [];

// namespace
const app = {};

app.init = function() {
  firebase.initializeApp(fbConfig);
  app.updateLeaderboard(); // run on page load to immediately populate the leaderboard
  // event listeners
  trumps.forEach(trump => trump.addEventListener('click', app.thump));
  // used to temporarily block clicks after game time runs out so user doesn't accidentally close the alert modal
  // REMINDER: look into SweetAlerts allowEnterKey method
  clickBlocker.addEventListener('click', e => {
    e.stopPropagation();
    e.preventDefault();
  });
  leaderboardButton.addEventListener('click', app.openLeaderboard);
  closeButton.addEventListener('click', app.closeLeaderboard);
  window.addEventListener('click', app.closeLeaderboard);
  startGameButton.addEventListener('click', app.startGame);
};

// function to select one random Trump
app.randomHouse = function(houses) {
  const randomIndex = Math.floor(Math.random() * houses.length);
  const house = houses[randomIndex];
  if (house === lastHouse) {
    return app.randomHouse(houses);
  }
  lastHouse = house;
  return house;
};

// function to make the randomly selected Trump appear for a random amount of time
app.jump = function() {
  const time = randomTime(300, 1000);
  const house = app.randomHouse(houses);
  house.classList.add('up');
  setTimeout(() => {
    house.classList.remove('up');
    if (!timeUp) app.jump();
  }, time);
};

// add to score when user successfully clicks on a visible Trump
app.thump = function(e) {
  if (!e.isTrusted) return;
  score++;
  this.classList.remove('up');
  scoreboard.textContent = score;
};

// TO DO: prevent double clicks

app.handleScoreSubmit = function(score) {
  swal({
    title: `You thumped ${score} ${score === 1 ? 'Trump!' : 'Trumps!'}`,
    content: 'input',
    text: 'Enter your name below to save your score:',
    icon: 'success',
    buttons: {
      cancel: true,
      confirm: 'Post Score'
    }
  })
    .then(val => {
      let userName = val;
      app.addToLeaderboard(userName, score);
      app.openLeaderboard();
    })
    .catch(err => {
      if (err && userName !== null) {
        swal({
          title: 'Oops, something went wrong!',
          text:
            'Please make sure the name you entered does not contain any special characters ( . # $ [ ] etc. )',
          icon: 'error',
          buttons: {
            confirm: 'Try Again'
          }
        })
          // TO FIX: pressing Enter on error message doesn't close the modal (but clicking the button does)
          .then(() => {
            app.handleScoreSubmit(score);
          });
      } else return;
    });
};

// function to start the game
app.startGame = function() {
  timeUp = false;
  scoreboard.textContent = 0;
  score = 0;
  app.jump();
  app.countdown();
  startGameButton.disabled = true;
  setTimeout(() => {
    //quickly block all clicks
    clickBlocker.style.display = 'block';
    setTimeout(() => {
      clickBlocker.style.display = 'none';
    }, 2000);
    timeUp = true;
    startGameButton.disabled = false;
    app.handleScoreSubmit(score);
  }, 10000);
};

// function for the game countdown
app.countdown = function() {
  document.querySelector('.countdown').innerHTML = '10';
  let timeLeft = 9;
  let timer = setInterval(() => {
    document.querySelector('.countdown').innerHTML = `${
      timeLeft < 10 ? '0' : ''
    }${timeLeft}`;
    timeLeft -= 1;
    if (timeLeft < 0) {
      clearInterval(timer);
      document.querySelector('.countdown').innerHTML = '0';
    }
  }, 1000);
};

// function to open leaderboard modal
app.openLeaderboard = function() {
  leaderboard.style.display = 'block';
};

// function to close leaderboard modal
app.closeLeaderboard = function(e) {
  if (e.target === leaderboard || e.target === closeButton) {
    leaderboard.style.display = 'none';
  } else {
    return;
  }
};

// function to add current user's name and most recent score to Firebase
app.addToLeaderboard = function(username, score) {
  const dbRef = firebase
    .database()
    .ref()
    .child(username);
  dbRef.set({
    score
  });
  app.updateLeaderboard();
};

// function to display username and score in descending order on the page
app.displayLeaderboard = function() {
  let finalLeaderboardArray = leaderboardArray.sort((a, b) => {
    return b.score - a.score;
  });

  // limit leaderboard to only show top 10 scores
  if (finalLeaderboardArray.length > 10) {
    finalLeaderboardArray = finalLeaderboardArray.slice(0, 10);
  }

  let i = 1;
  finalLeaderboardArray.forEach(score => {
    leaderboardListUser.innerHTML += `<li><p><span class="listNumber">${i}.</span>${score.user}</p></li>`;
    leaderboardListScore.innerHTML += `<li><p>${score.score}</p></li>`;
    i++;
  });
};

// function to update the leaderboard array
app.updateLeaderboard = function() {
  leaderboardArray = [];
  leaderboardListUser.innerHTML = ''; //find better way to do this
  leaderboardListScore.innerHTML = '';

  firebase
    .database()
    .ref()
    .once('value')
    .then(res => {
      //once returns a promise
      const data = res.val();
      let promises = [];

      for (const entry in data) {
        promises.push(
          firebase
            .database()
            .ref()
            .once('value')
        );
        leaderboardArray.push({
          user: entry,
          score: data[entry].score
        });
      }
      return Promise.all(promises); // wait for all promises to resolve before running displayLeaderboard
    })
    .then(app.displayLeaderboard)
    .catch(err => {
      console.log(err);
    });
};

// FIREBASE CONFIG
var config = {
  apiKey: 'AIzaSyCeR28Xj_mGwhH0PODd3IefDhWbKoG7ggU',
  authDomain: 'thump-a-trump.firebaseapp.com',
  databaseURL: 'https://thump-a-trump.firebaseio.com',
  projectId: 'thump-a-trump',
  storageBucket: '',
  messagingSenderId: '63994682603'
};

app.init();
