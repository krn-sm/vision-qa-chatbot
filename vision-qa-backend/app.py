from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import Blip2Processor, Blip2ForConditionalGeneration
from PIL import Image
import torch
import io

app = Flask(__name__)
CORS(app)

# Load BLIP-2 model and processor
device = 'cuda' if torch.cuda.is_available() else 'cpu'
processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-2.7b")
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip2-opt-2.7b",
    torch_dtype=torch.float16 if device == 'cuda' else torch.float32
)
model.to(device)

@app.route('/ask', methods=['POST'])
def ask():
    if 'image' not in request.files or 'question' not in request.form:
        return jsonify({'error': 'Image and question are required'}), 400

    image_file = request.files['image']
    question = request.form['question']

    try:
        image = Image.open(io.BytesIO(image_file.read())).convert("RGB")

        inputs = processor(images=image, text=question, return_tensors="pt").to(device, torch.float16 if device == 'cuda' else torch.float32)

        output = model.generate(**inputs, max_new_tokens=100)
        answer = processor.tokenizer.decode(output[0], skip_special_tokens=True)

        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
