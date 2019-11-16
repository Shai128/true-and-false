function GetRandomSentence(user, already_seen=[], success, failure) { 
    const truths = user.get('truths');
    const lies = user.get('lies');
  //  let saw = found_user.get('sentences_saw') // sentences the user already saw - should not be used
    //saw = (saw == null) ? [] : saw

   // let filtered_lies = lies.filter(x => !saw.includes(x));

    if (truths.length >= 1 && lies.length >= 1) {
      let is_true = (Math.random() >= 0.5) ? 1 : 0;
      let arr = [lies, truths][is_true];
      let sentence = arr[Math.floor(Math.random() * arr.length)];
      success({
        is_true: is_true,
        sentence: sentence
      });
    //  console.log("chosen sentense: " + sentence + ", is_true: " + is_true);
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