import re
import cv2
import pytesseract
import numpy as np
from flask import Flask, render_template, request, jsonify
from PIL import Image
from textblob import TextBlob
from spellchecker import SpellChecker
import os

app = Flask(__name__)
UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def preprocess_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Error: Image not found at {image_path}. Check the file path.")
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Increase contrast
    alpha = 1.5  # Contrast control
    beta = 10    # Brightness control
    contrast_img = cv2.convertScaleAbs(gray, alpha=alpha, beta=beta)
    
    # Resize for better OCR
    resized_img = cv2.resize(contrast_img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    
    # Apply adaptive thresholding
    processed_img = cv2.adaptiveThreshold(resized_img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    return Image.fromarray(processed_img)

def extract_text_from_image(image_path):
    processed_pil = preprocess_image(image_path)
    custom_config = r'--oem 3 --psm 4'  # Use sparse text mode for handwriting
    return pytesseract.image_to_string(processed_pil, config=custom_config)

def correct_spelling(text):
    spell = SpellChecker()
    words = text.split()
    corrected_words = [spell.correction(word) if spell.correction(word) else word for word in words]
    return ' '.join(corrected_words)

def normalize_text(text):
    text = text.lower()  # Convert to lowercase
    text = re.sub(r'[^a-zA-Z0-9.,!?\'"\s]', '', text)  # Remove special characters
    text = correct_spelling(text)  # Correct spelling
    text = str(TextBlob(text).correct())  # Additional grammar correction
    return text

@app.route('/')
def index():
    return render_template('index1.html')

@app.route('/next')
def next_page():
    return render_template('index.html')
    
@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)
    
    extracted_text = extract_text_from_image(file_path)
    corrected_text = normalize_text(extracted_text)
    
    return jsonify({'extracted_text': extracted_text, 'corrected_text': corrected_text})

if __name__ == '__main__':
    app.run(debug=True)
