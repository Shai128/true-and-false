/**
 * Selects a random sentence from a users truths and lies.
 * @param {*} user The subject of the true/lie sentence
 * @param {*} already_seen Sentences to exclude from returning
 * @param {*} success Executes after a sentence is selcted
 * @param {*} failure Executes if selection fails
 */
function GetRandomSentence(user, already_seen=[], success, failure) { 
    const truths = user.get('truths');
    const lies = user.get('lies').filter(x => !already_seen.includes(x));

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

function StandardErrorHandling(res, err) {
    console.log(err)
    res.send(err)
}

exports.GetRandomSentence = GetRandomSentence
exports.StandardErrorHandling = StandardErrorHandling