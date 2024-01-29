self.addEventListener("message", async (event) => {
    // Destructuring passed data into text and apiKey variables.
    const {text, apiKey } = event.data;

    // Setting up url as per documentation.
    const apiUrl = "https://api.openai.com/v1/audio/speech";

    // Creating a headers variable that I will use in the fetch request. Sets api key and declares content type.
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
    };

    // Creating a requestBody variable I will use in the fetch request. Sets certain parameters.
    const requestBody = {
        model: "tts-1",
        input: text,
        voice: "shimmer",
    };

    try {
        // Fetch request...
        const response = await fetch(apiUrl, {
            method: "POST",
            // passing headers variable to headers param.
            headers: headers,
            // passing stringified requestBody variable to body param.
            body: JSON.stringify(requestBody),
        });
        
        // if the request is not ok throwing error.
        if (!response.ok) {
            throw new Error(`Request failed with status: ${response.status}`);
        }

        // If the request is okay, turning response into blob object using the blob method on it. (Binary Large Object).
        const audioBlob = await response.blob();
        // Creating an object url that references the audioBlob's raw data content.
        const audioUrl = URL.createObjectURL(audioBlob);

        // If succeeding, sending back the reference to the raw data.
        self.postMessage({ success: true, audioUrl })
    } catch (error) {
        // If failed, sending back an error.
        self.postMessage({ success: false, error: error.message });
    }
});