const app = {};

app.trumps = document.querySelectorAll(".trump");
app.houses = document.querySelectorAll(".house");
app.scoreboard = document.querySelector(".score");
app.leaderboard = document.querySelector(".leaderboard");
app.leaderboardButton = document.querySelector(".leaderboardButton");
app.leaderboardListUser = document.querySelector(".leaderboardListUser");
app.leaderboardListScore = document.querySelector(".leaderboardListScore");
app.closeButton = document.querySelector(".close");
app.startGameButton = document.querySelector(".start");
app.clickBlocker = document.querySelector(".blockClicks");
app.lastHouse;
app.timeUp = false;
app.leaderboardArray = [];
app.score;

// function to show Trump for random amount of time
app.randomTime = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

// function to select one random Trump
app.randomHouse = houses => {
  const randomIndex = Math.floor(Math.random() * app.houses.length);
  const house = app.houses[randomIndex];
  if (house === app.lastHouse) {
    return app.randomHouse(app.houses);
  }
  app.lastHouse = house;
  return house;
};

// function to make the randomly selected Trump appear for a random amount of time
app.jump = () => {
  const time = app.randomTime(300, 1000);
  const house = app.randomHouse(app.houses);
  house.classList.add("up");
  setTimeout(() => {
    house.classList.remove("up");
    if (!app.timeUp) app.jump();
  }, time);
};

// add to score when user successfully clicks on a visible Trump
app.thump = e => {
  console.log(this);
  if (!e.isTrusted) return;
  app.score++;
  this.classList.remove("up");
  app.scoreboard.textContent = app.score;
};

// TO DO: prevent double clicks

app.handleScoreSubmit = score => {
  swal({
    title: `You thumped ${score} ${score === 1 ? "Trump!" : "Trumps!"}`,
    content: "input",
    text: "Enter your name below to save your score:",
    icon: "success",
    buttons: {
      cancel: true,
      confirm: "Post Score"
    }
  })
    .then(val => {
      app.userName = val;
      app.userScore = score;
      app.addToLeaderboard(app.userName, app.score);
      app.openLeaderboard();
    })
    .catch(err => {
      if (err && app.userName !== null) {
        swal({
          title: "Oops, something went wrong!",
          text:
            "Please make sure the name you entered does not contain any special characters ( . # $ [ ] etc. )",
          icon: "error",
          buttons: {
            confirm: "Try Again"
          }
        })
          // TO FIX: pressing Enter on error message doesn't close the modal (but clicking the button does)
          .then(() => {
            app.handleScoreSubmit(app.score);
          });
      } else return;
    });
};

// function to start the game
app.startGame = () => {
  app.timeUp = false;
  app.scoreboard.textContent = 0;
  app.score = 0;
  app.jump();
  app.countdown();
  app.startGameButton.disabled = true;
  setTimeout(() => {
    //quickly block all clicks
    app.clickBlocker.style.display = "block";
    setTimeout(() => {
      app.clickBlocker.style.display = "none";
    }, 2000);
    app.timeUp = true;
    app.startGameButton.disabled = false;
    app.handleScoreSubmit(app.score);
  }, 10000);
};

// function for the game countdown
app.countdown = () => {
  document.querySelector(".countdown").innerHTML = "10";
  let timeLeft = 9;
  let timer = setInterval(() => {
    document.querySelector(".countdown").innerHTML = `${
      timeLeft < 10 ? "0" : ""
    }${timeLeft}`;
    timeLeft -= 1;
    if (timeLeft < 0) {
      clearInterval(timer);
      document.querySelector(".countdown").innerHTML = "0";
    }
  }, 1000);
};

// function to open leaderboard modal
app.openLeaderboard = () => {
  app.leaderboard.style.display = "block";
};

// function to close leaderboard modal
app.closeLeaderboard = e => {
  if (e.target === app.leaderboard || e.target === app.closeButton) {
    app.leaderboard.style.display = "none";
  } else {
    return;
  }
};

// function to add current user's name and most recent score to Firebase
app.addToLeaderboard = (username, score) => {
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
app.displayLeaderboard = () => {
  let finalLeaderboardArray = app.leaderboardArray.sort((a, b) => {
    return b.score - a.score;
  });

  // limit leaderboard to only show top 10 scores
  if (finalLeaderboardArray.length > 10) {
    finalLeaderboardArray = finalLeaderboardArray.slice(0, 10);
  }

  let i = 1;
  finalLeaderboardArray.forEach(score => {
    app.leaderboardListUser.innerHTML += `<li><p><span class="listNumber">${i}.</span>${
      score.user
    }</p></li>`;
    app.leaderboardListScore.innerHTML += `<li><p>${score.score}</p></li>`;
    i++;
  });
};

// function to update the leaderboard array
app.updateLeaderboard = () => {
  app.leaderboardArray = [];
  app.leaderboardListUser.innerHTML = ""; //find better way to do this
  app.leaderboardListScore.innerHTML = "";

  firebase
    .database()
    .ref()
    .once("value")
    .then(res => {
      //once returns a promise
      const data = res.val();
      let promises = [];

      for (entry in data) {
        promises.push(
          firebase
            .database()
            .ref()
            .once("value")
        );
        app.leaderboardArray.push({
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

app.init = () => {
  // used to temporarily block clicks after game time runs out so user doesn't accidentally close the alert modal
  // REMINDER: look into SweetAlerts allowEnterKey method
  app.clickBlocker.addEventListener("click", e => {
    e.stopPropagation();
    e.preventDefault();
  });

  app.trumps.forEach(trump => trump.addEventListener("click", app.thump));

  app.leaderboardButton.addEventListener("click", app.openLeaderboard);
  app.closeButton.addEventListener("click", app.closeLeaderboard);
  window.addEventListener("click", app.closeLeaderboard);

  app.updateLeaderboard(); // run on page load to immediately populate the leaderboard
};

app.init();
