import "/public/styles/bedtime.css";
import Worker from "./app.worker";

// Instantiating worker for use later.
const worker = new Worker();

// Empty array to populate with stories and keep track of them while app is running.
const stories = [];

// Variables for GPT3 fetch request
const api_key = process.env.API_KEY
const gpt3_url = "https://api.openai.com/v1/chat/completions";

// Getting DOM Elements.
const genStoryBtn = document.querySelector("#gen-story-btn");
const genStoriesBtn = document.querySelector("#num-submit");
const storyList = document.querySelector("#stories-list");

// Default favorite story for promise.Any()
const favoriteStory = new Promise((resolve, reject) => {
    resolve("In a cozy forest, a playful squirrel taught a shy bunny the joy of friendship");
})


//Function for making gpt3 fetch request and getting story.
async function genStory() {
    // Creating the body of the request according to documentation.
    const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant.",
            },
            {
                role: "user",
                // Here is the prompt I thought up to ask chatgpt.
                content: "Generate a one sentence bedtime story that uses no more than 14 words for me to read. Don't start the story with once upon of time.",
            },
        ],
        // Maxing out the tokens I use so that I don't run up a large bill. I did set a limit to 5 dollars.
        max_tokens: 20,
    };

    try {
        // Fetch promise...
        const response = await fetch(gpt3_url, {
            method: "POST",
            // I could have specified this before the try block and just passed in a headers variable.
            headers: {
                "Content-Type": "application/json",
                // Passing in my api_key variable I got with dotenv here.
                "Authorization": `Bearer ${api_key}`,
            },
            // Passing the stringified JSON requestBody variable I specified above.
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        // Json promise...
        const data = await response.json();

        // Returning the message that chatgpt gave me.
        return data.choices[0].message.content;
    
    // Logging and throwing error if try block fails.
    } catch (e) {
        Promise.reject(console.error(`Error making API request:`, e));
    }
};


// Function for generating n stories and using promise.all to ensure all n fetch promises are fulfilled before populating list.
async function genMultStories(num) {
    // Array to populate with promises
    let storyPromises = [];

    // Creating specified number of promises and pushing them to promises array.
    for (let i = 0; i < num; i++ ) {
            storyPromises.push(genStory());
        }
    
    console.log(storyPromises);
    
    // Returning a promise.all with an array of n promises.
    Promise.all(storyPromises)
    .then((stories) => {
        for (let i=0; i < stories.length; i++) {
            storyList.appendChild(createListItem(stories[i]));
        }
    })
    .catch((e) => console.error("Failed to gen stories", e));
}


// Function for streaming audio from openAI tts Using web Worker.
async function genAudio(text) {
    // Trying to generate audio with Promise, eventListener, and web worker.
    try {
        // Getting api key with dotenv
        const apiKey = process.env.API_KEY;

        // Trying to store generated audio in result variable using a promise.
        const result = await new Promise((resolve, reject) => {
            // Using an event listener to listen to worker object's postMessage method.
            worker.addEventListener("message", (event) => {
                // Using Destructuring to pass event.data to web worker on postMessage.
                const {success, audioUrl, error } = event.data;

                // If web worker succeeds saving generated audio to result variable.
                if (success) {
                    resolve(audioUrl);
                // If web worker failed, raising error.
                } else {
                    reject(new Error(error));
                }
            });

            // posting message passing text, and apiKey to web worker script. The eventListener block above runs!
            worker.postMessage({ text, apiKey})
        });

        // If worker saved audio to result, saving that audio to an Audio object instance so that I can use the .play() method.
        const audioElement = new Audio(result);
        // Finally playing the audio.
        audioElement.play();
        
    // Throwing an error if catch block runs.
    } catch (error) {
        console.error(`Error making tts api request:`, error.message);
        throw error;
    }
}


// Function for creating a new list item.
function createListItem(story) {
    // Creating li element
    const listItem = document.createElement("li");

    // Adding classes and id to li element
    listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "mt-4");
    listItem.id = "list-item-" + stories.length;

    // Creating and appending p element to li 
    const storyParagraph = document.createElement("p");
    storyParagraph.classList.add("d-flex", "m-3");
    storyParagraph.innerText = `"${story}"`;
    listItem.appendChild(storyParagraph);

    // Creating Stream Audio button.
    const streamButton = document.createElement("button");
    streamButton.innerText = "Read Story";
    streamButton.value = story;
    streamButton.classList.add("btn", "btn-primary", "m-3");
    listItem.appendChild(streamButton);

    streamButton.addEventListener("click", () => {
        genAudio(streamButton.value);
    })

    return listItem;
}


// Event listener for generating story button click.
genStoryBtn.addEventListener("click", async (event) => {
    event.stopPropagation();

    // Array of promises to populate.
    const promiseArray = [];

    // Generating a "story".
    const story = await genStory();

    // Pushing generated story first, If genStory function succeeded it's already just a string.
    promiseArray.push(story);
    // Pushing favorite story second. genStory fails, favorite story will succeed and be generated instead by promise any.
    promiseArray.push(favoriteStory);

    Promise.any(promiseArray)
    .then((result) => {
        const listItem = createListItem(result);
        storyList.appendChild(listItem);
    }).catch((e) => console.error("Failed to generate Story", e.message));
});


// Event listener for generating multiple stories button click.
genStoriesBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    let numOfStories = document.querySelector("#num-input").value;
    if (numOfStories < 0 || numOfStories > 10 ) {
        alert("Please type a number in the range of 2 to 10");
    } else{
        // Using the genMultStories function which uses a promise.all to ensure all n stories are generated in order to succeed.
        genMultStories(numOfStories);
    }
})