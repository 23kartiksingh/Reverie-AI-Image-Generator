const themeToggle = document.querySelector(".theme-toggle");
// To set the previous theme(by user) or the default one
(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefrence-color-scheme: dark)").matches;

    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();
// toggle between the dark and light theme
const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
}
themeToggle.addEventListener("click", toggleTheme);



// For filling random Input Text
const promptBtn = document.querySelector(".prompt-btn");
const promptInput = document.querySelector(".prompt-input");
const TryPrompt = [
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases"
];
const generateRandomPrompt = () => {
    const prompt = TryPrompt[Math.floor(Math.random() * TryPrompt.length)];
    promptInput.value = prompt;
    promptInput.focus();
};
promptBtn.addEventListener("click", generateRandomPrompt);



// Taking action on Form Submission
const promptForm = document.querySelector(".prompt-form");
const selectCount = document.getElementById("count-select");
const selectRatio = document.getElementById("ratio-select");
const selectModel = document.getElementById("model-select");
const gridGallery = document.querySelector(".gallery-grid");
const generateBtn = document.querySelector(".generate-btn");
const token = "hf_YourToken";
const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const[width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width*height);

    let calcWidth = Math.round(width * scaleFactor);
    let calcHeight = Math.round(height * scaleFactor);

    calcWidth = Math.floor(calcWidth / 16) * 16;
    calcHeight = Math.floor(calcHeight / 16) *16;
    
    return {width: calcWidth, height: calcHeight};
}
// Replacing loading spinner with the actual image
const updateImageCard = (imgIndex, imgURL) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if(!imgCard) return;
    imgCard.classList.remove("loading");
    imgCard.innerHTML = `<img src="${imgURL}" class="result-img" />
                        <div class="img-overlay">
                            <a href="${imgURL}" class="img-download-btn" download="${Date.now()}.png">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </div>`;
}
// Generating Image
// Send request to the AI model Hugging face API
const generateImages = async (selectedModel, selectedCount, selectedRatio, promptText) => {
    const URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
    const {width, height} = getImageDimensions(selectedRatio);
    generateBtn.setAttribute("disabled", "true");
    // Creating array of Images
    const imagePromises = Array.from({length: selectedCount}, async(_,i) => {
        try {
            const response = await fetch(URL,{
                headers: {
				    Authorization: `Bearer ${token}`,
				    "Content-Type": "application/json",
                    "x-use-cache": "false", 
			    },
			    method: "POST",
			    body: JSON.stringify({
                    prompt: `\"${promptText}\"`,
                    parameters: {width,height},
                })
            });

            if(!response.ok) throw new Error((await response.json())?.error);
            // conevrting response to an image URL and update the image card
            const result = await response.blob();
            updateImageCard(i, URL.createObjectURL(result));
        }
        catch(error) {
            console.log(error)
            const imgCard = document.getElementById(`img-card-${i}`);
            imgCard.classList.replace("loading","error");
            imgCard.querySelector("status-text").textContent = "Generation Failed! Check console for more details."
        }
    })
    await Promise.allSettled(imagePromises);
    generateBtn.removeAttribute("disabled");
}
// Creating Image Card
const generateInageCards = (selectedModel, selectedCount, selectedRatio, promptText) => {
    gridGallery.innerHTML= "";
    for(let i=0; i<selectedCount ;i++){
        gridGallery.innerHTML+=`
                    <div class="image-card loading" id="img-card-${i}" style="aspect-ratio: ${selectedRatio}">
                        <div class="status-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p class="status-text">Generating...</p>
                        </div>
                    </div>`
    }

    generateImages(selectedModel, selectedCount, selectedRatio, promptText);
}
// Taking Input 
const handleFormSubmit = (e) => {
    e.preventDefault();
    const selectedCount = parseInt(selectCount.value) || 1;
    const selectedRatio = selectRatio.value || "1/1";
    const selectedModel = selectModel.value;
    const promptText = promptInput.value.trim();

    generateInageCards(selectedModel, selectedCount, selectedRatio, promptText);
}
promptForm.addEventListener("submit", handleFormSubmit);
