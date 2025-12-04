// Unsplash API Access Key (Make sure to replace it with your actual key)
const UNSPLASH_ACCESS_KEY = "fJ82cwbpklbfnOS_xjoU2K4ZQY-sLG7HH9grwIHg5bE";

// Text-to-Image Function using Unsplash API
document.getElementById("generateImage").addEventListener("click", () => {
    const text = document.getElementById("inputText").value.trim();
    const imageElement = document.getElementById("resultImage");

    if (text) {
        fetch(`https://api.unsplash.com/photos/random?query=${text}&client_id=${UNSPLASH_ACCESS_KEY}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok: " + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.urls && data.urls.regular) {
                    imageElement.src = data.urls.regular;
                    imageElement.style.display = "block"; // Show the image
                } else {
                    alert("No image found for the given text.");
                    imageElement.style.display = "none"; // Hide the image
                }
            })
            .catch(error => {
                console.error("Error fetching image:", error);
                alert("Failed to fetch image. Please try again.");
                imageElement.style.display = "none"; // Hide the image on error
            });
    } else {
        alert("Please enter text to generate an image.");
        imageElement.style.display = "none"; // Hide the image if no text
    }
});

// Text-to-Speech Function
document.getElementById("speakButton").addEventListener("click", () => {
    const text = document.getElementById("inputText").value;
    if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    } else {
        alert("Please enter text to read aloud.");
    }
});

// Stop Reading Function
document.getElementById("stopButton").addEventListener("click", () => {
    speechSynthesis.cancel(); // Stop any ongoing speech
});

// Process Selected Image
document.getElementById("processImageButton").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const selectedImageElement = document.getElementById("selectedImage");

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            selectedImageElement.src = reader.result;
            selectedImageElement.style.display = "block"; // Show the selected image
            processImageForSpeech(selectedImageElement); // Process the image for speech
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please choose an image file.");
    }
});

// Process Selected Image with Tesseract OCR
function processImageForSpeech(imageElement) {
    Tesseract.recognize(imageElement.src, 'eng', { logger: m => console.log(m) })
        .then(result => {
            const extractedText = result.data.text.trim();

            if (extractedText) {
                const utterance = new SpeechSynthesisUtterance(extractedText);
                utterance.onend = () => {
                    console.log("Finished reading the text.");
                };
                speechSynthesis.speak(utterance);
            } else {
                alert("No recognizable text found in the image.");
            }
        })
        .catch(error => {
            console.error("Error with OCR:", error);
            alert("Could not process the image. Please try again.");
        });
}

// Process PDF File for Text Recognition
document.getElementById("processPdfButton").addEventListener("click", () => {
    const pdfInput = document.getElementById("pdfInput");

    if (pdfInput.files.length > 0) {
        const file = pdfInput.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const typedarray = new Uint8Array(event.target.result);
            pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                let textContent = '';

                // Read each page of the PDF
                const readPage = (pageNum) => {
                    pdf.getPage(pageNum).then(page => {
                        return page.getTextContent().then(text => {
                            text.items.forEach(item => {
                                textContent += item.str + ' '; // Append text from each item
                            });
                            // If there are more pages, read the next one
                            if (pageNum < pdf.numPages) {
                                readPage(pageNum + 1);
                            } else {
                                // Once all pages are read, speak the text
                                speakPdfText(textContent);
                            }
                        });
                    });
                };

                // Start reading the first page
                readPage(1);
            }).catch(error => {
                console.error("Error reading PDF:", error);
                alert("Could not process the PDF file. Please try again.");
            });
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Please choose a PDF file.");
    }
});

// Function to speak the extracted PDF text
function speakPdfText(text) {
    if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    } else {
        alert("No recognizable text found in the PDF.");
    }
}

// Dyslexia-Friendly Page - Replace Words for Simplicity
document.getElementById("dyslexiaPageButton").addEventListener("click", () => {
    const textArea = document.getElementById("inputText");
    let text = textArea.value;

    // Extended dictionary for replacement (both ways)
    const replacements = {
        "now": "won", "won": "now", "left": "felt", "felt": "left",
        "see": "sea", "sea": "see", "night": "knight", "knight": "night",
        "bare": "bear", "bear": "bare", "blue": "blew", "blew": "blue",
        "made": "maid", "maid": "made", "grate": "great", "great": "grate",
        "flower": "flour", "flour": "flower", "write": "right", "right": "write",
        "peace": "piece", "piece": "peace", "buy": "by", "by": "buy",
        "here": "hear", "hear": "here", "to": "too", "too": "to",
        "cell": "sell", "sell": "cell", "mail": "male", "male": "mail",
        "scent": "sent", "sent": "scent", "tide": "tied", "tied": "tide",
        "road": "rode", "rode": "road", "so": "sew", "sew": "so",
        "their": "there", "there": "their", "sail": "sale", "sale": "sail",
        "steal": "steel", "steel": "steal", "week": "weak", "weak": "week",
        "meat": "meet", "meet": "meat", "one": "won", "won": "one",
        "stair": "stare", "stare": "stair", "some": "sum", "sum": "some",
        "son": "sun", "sun": "son", "knew": "new", "new": "knew",
        "break": "brake", "brake": "break", "plain": "plane", "plane": "plain",
        "reed": "read", "read": "reed", "dear": "deer", "deer": "dear",
        "hole": "whole", "whole": "hole", "allowed": "aloud", "aloud": "allowed",
        "band": "banned", "banned": "band", "knows": "nose", "nose": "knows",
        "sight": "site", "site": "sight", "past": "passed", "passed": "past",
        "pair": "pare", "pare": "pair", "scene": "seen", "seen": "scene",
        "waist": "waste", "waste": "waist", "raise": "raze", "raze": "raise",
        "ceiling": "sealing", "sealing": "ceiling", "colonel": "kernel", "kernel": "colonel",
        "horse": "hoarse", "hoarse": "horse", "coarse": "course", "course": "coarse"
    };
    

    // Replace words in both directions using a temporary text for replacements
    let tempText = text; // Store original text for the replacement logic

    // First pass: replace key with a temporary placeholder
    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `__${key}__`; // Use a placeholder to avoid conflicts
        tempText = tempText.replace(new RegExp(`\\b${key}\\b`, 'gi'), placeholder);
    }

    // Second pass: replace the placeholders with their corresponding values
    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `__${key}__`; // Use the same placeholder
        tempText = tempText.replace(new RegExp(`\\b${value}\\b`, 'gi'), key);
        tempText = tempText.replace(new RegExp(`\\b${placeholder}\\b`, 'g'), value); // Replace placeholders with values
    }

    textArea.value = tempText;
    alert("Text has been simplified for dyslexia-friendly reading.");
});

// Speech Recognition
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const output = document.getElementById('output');

let recognition;

if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    startButton.disabled = true;
    stopButton.disabled = false;
    output.innerHTML = "<p>Listening...</p>";
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    output.innerHTML = `<p>${transcript}</p>`;
  };

  recognition.onerror = (event) => {
    alert(`Error occurred in recognition: ${event.error}`);
  };

  recognition.onend = () => {
    startButton.disabled = false;
    stopButton.disabled = true;
  };
} else {
  alert('Speech Recognition API not supported in this browser. Use Chrome or Edge.');
}

startButton.addEventListener('click', () => {
  if (recognition) recognition.start();
});

stopButton.addEventListener('click', () => {
  if (recognition) recognition.stop();
});
