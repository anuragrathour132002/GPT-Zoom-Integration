//handles the coversation
export function speechToText() {
  let isTextToSpeechPlaying = false;

  //checks if the user is speaking
  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    console.log("SPEECH RECOGNITION IS SUPPORTED");

    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new window.SpeechRecognition();

    // Set the language for speech recognition
    recognition.lang = "en-US";

    // Enable continuous speech recognition
    recognition.continuous = true;

    recognition.onstart = function () {
      console.log("Speech recognition started");
    };

    recognition.onresult = async function (event) {
      //if gpt is answering and any noise from user's end is detected
      if (isTextToSpeechPlaying) {
        window.alert(
          "Sorry to interrupt but I'm in middle of answering your previous question"
        );
        return;
      }

      // event.results gives us a list of SpeechRecognitionResult objects
      const numberOfResults = event.results.length;
      const transcript = event.results[numberOfResults - 1][0].transcript;

      console.log(`TRANSCRIPT : ${transcript}`);

      //fetches the gpt response
      const apiResponse = await fetch(`response?message=${transcript}`);

      const responseObject = await apiResponse.json();
      const gptResponse = responseObject.message;

      console.log(`GPT RESPONSE : ${gptResponse}`);

      isTextToSpeechPlaying = true;

      //adding delay before speaking response
      const msg = new SpeechSynthesisUtterance();
      msg.text = gptResponse;
      msg.onend = function () {
        setTimeout(() => {
          isTextToSpeechPlaying = false;
        }, 4000);
      };
      speechSynthesis.speak(msg);
    };

    recognition.onend = function () {
      console.log("ended speech recognition");

      if (!isTextToSpeechPlaying) {
        setTimeout(() => {
          recognition.start();
        }, 1000);
      } else {
        console.log("ENDED BEFORE THE TEXT TO SPEECH ENDS!");
        setTimeout(() => {
          recognition.start();
        }, 4000);
      }
    };

    recognition.start();
  } else {
    console.log("SPEECH RECOGNITION IS NOT SUPPORTED");
  }
}
