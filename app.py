from flask import Flask, request, jsonify, send_from_directory
from leaf_analysis import analyze_leaf
import os
import time  # Pour le keep-alive

app = Flask(__name__, static_folder='static')

# Route pour servir les fichiers uploadés (nécessaire pour afficher les images)
@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory('uploads', filename)

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Créer un nom de fichier unique pour éviter les conflits
    timestamp = str(int(time.time()))
    safe_filename = f"{timestamp}_{file.filename}"
    filepath = os.path.join('uploads', safe_filename)
    
    os.makedirs('uploads', exist_ok=True)
    file.save(filepath)
    
    try:
        # Limiter le temps d'exécution pour éviter les timeouts
        severity_data = analyze_leaf(filepath)
        return jsonify({
            'severity': f"{severity_data['percentage']:.2f}% ({severity_data['level']})",
            'image_url': f'/uploads/{safe_filename}'  # Utiliser le nom sécurisé
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Solution temporaire pour garder le serveur actif (optionnel)
def keep_alive():
    while True:
        time.sleep(300)  # Ping toutes les 5 minutes
        try:
            import requests
            requests.get("https://votre-nom.onrender.com")
        except:
            pass

if __name__ == '__main__':
    threading.Thread(target=keep_alive, daemon=True).start()
    app.run(debug=True)
