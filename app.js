// Step 1: Get HTML Elements
const apiKeyInput = document.getElementById("apiKey");
const photoInput = document.getElementById("photoInput");
const generateBtn = document.getElementById("generateBtn");
const result = document.getElementById("result");

// Step 2: Store Photo Data
let photoBase64 = null;

photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            // Extract base64 data by splitting and taking the second part
            photoBase64 = event.target.result.split(",")[1];
        };
        reader.readAsDataURL(file);
    }
});

// Step 3: Button Click Handler
generateBtn.addEventListener("click", async () => {
    // Validation
    if (!apiKeyInput.value) {
        alert("Please enter your API key");
        return;
    }
    if (!photoBase64) {
        alert("Please select a photo");
        return;
    }

    // Show loading
    result.innerHTML = "<p>Generating your cover... please wait...</p>";

    // API URL and Prompt
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKeyInput.value}`;
    const prompt = `Create a TITAN magazine cover featuring this person. 
    Keep their face exactly as it is. 
    Add "TITAN" as the magazine title in red at the top. 
    Make it look like a professional magazine cover.`;

    // Request Body
    const requestBody = {
        contents: [{
            parts: [
                {
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: photoBase64
                    }
                },
                {
                    text: prompt
                }
            ]
        }]
    };

    try {
        // API Call
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // Display Result
        const parts = data.candidates[0].content.parts;
        let imageFound = false;

        for (const part of parts) {
            if (part.inlineData) {
                const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                result.innerHTML = `<img src="${imageUrl}" alt="TITAN Magazine Cover">`;
                imageFound = true;
                break;
            }
        }

        if (!imageFound) {
            result.innerHTML = "No image generated. Try again.";
        }

    } catch (error) {
        // Error Handling
        result.innerHTML = "Error: " + error.message;
    }
});