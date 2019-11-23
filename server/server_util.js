/**
 * Selects a random sentence from a users truths and lies.
 * @param {*} user The subject of the true/lie sentence
 * @param {*} already_seen Sentences to exclude from returning
 * @param {*} success Executes after a sentence is selcted
 * @param {*} failure Executes if selection fails
 */
function getRandomSentence(truths, lies, already_seen=[], success, failure) { 
    if (truths.length >= 1 && lies.length >= 1) {
      let is_true = (Math.random() >= 0.5) ? 1 : 0;
      let arr = [lies, truths][is_true];
      let sentence = arr[Math.floor(Math.random() * arr.length)];
      success({
        is_true: is_true,
        sentence: sentence
      });
    } else {
        failure("not enough sentences")
    }
}

function getRandomSentenceForDuel(game, subject_id, receiver_id, success, failure) {
  console.log(game);
  let already_seen = game.players[receiver_id].seen;
  let truths = game.players[subject_id].truths.filter(x => !already_seen.includes(x));
  let lies = [...game.all_sentences].filter(x => !truths.includes(x)).filter(x => !already_seen.includes(x));

  getRandomSentence(
    truths, 
    lies,
    already_seen,
    (sentencePicked) => {
      if (sentencePicked.is_true) {
        addSeenTruth(game, receiver_id, sentencePicked.sentence, success, failure) // should be implemented, updates the database
      }
      console.log("picked sentence: " + sentencePicked.sentence + " is true: " + sentencePicked.is_true)
      success(sentencePicked)
    },
    (err) => failure(err)
  )
}

function updateGame(game, success, failure) {} // placeholder

function addSeenTruth(game, user_id, sentence, success, failure) {
  game.players[user_id].seen.push(sentence);
  updateGame(game, success, failure);
}

/**
 * Adds a new user to an existing game.
 * @param {*} user
 * @param {*} game 
 * @param {*} truths the list of truths the user would like to use in this game
 * @param {*} lies the list of lies the user would like to use in this game
 */
function addUserToGame(user, game, success, failure, truths=user.truths, lies = user.lies) {
  if (game.players.includes(user._id)) { failure("user already in game"); return}
  game.players.push({
    _id: user._id,
    truths: truths,
    lies: lies,
    seen: [...truths].concat([...lies]),
    score: 0
  })

  game.all_sentences.concat(truths)
  game.all_sentences.concat(lies)

  updateGame(game, () => {}, (err) => failure(err)); // Should be implemented by someone, updates the database
} 

function standardErrorHandling(res, err) {
    console.log(err)
    res.status(500).send(err)
}

function endSession(req, res) {
  req.session.destroy((err) => {standardErrorHandling(res, err)})
  req.session = null
  res.redirect('/')
}

exports.getRandomSentence = getRandomSentence
exports.standardErrorHandling = standardErrorHandling
exports.endSession = endSession
exports.getRandomSentenceForDuel = getRandomSentenceForDuel