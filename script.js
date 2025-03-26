// Configuration de base
const fileInput = document.getElementById("file");
const analyzeBtn = document.getElementById("analyze-btn");
const refreshBtn = document.getElementById("refresh-btn");
const resultDiv = document.getElementById("result");
let selectedFile = null;

// URL de base pour l'API - importante pour Render
const API_BASE_URL = window.location.origin; // Utilise l'URL actuelle

// Prévisualisation du fichier
fileInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  console.log("Selected File:", selectedFile);
  analyzeBtn.disabled = !selectedFile;

  if (selectedFile) {
    const previewUrl = URL.createObjectURL(selectedFile);
    console.log("Preview URL:", previewUrl);
    resultDiv.innerHTML = `
      <p><strong>Fichier sélectionné :</strong> ${selectedFile.name}</p>
      <img src="${previewUrl}" alt="Aperçu" style="max-width: 200px; margin-top: 10px;">
      <p style="margin-top: 10px;">Cliquez sur "Analyser" pour commencer</p>
    `;
  } else {
    resultDiv.innerHTML = "";
  }
});

// Analyse du fichier
analyzeBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  
  if (!selectedFile) {
    showError("Veuillez sélectionner un fichier");
    return;
  }

  showLoading();

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur serveur: ${response.status}`);
    }

    const data = await response.json();
    showResults(data);
    
  } catch (error) {
    showError(error.message);
    console.error("Erreur d'analyse:", error);
  }
});

// Réinitialisation
refreshBtn.addEventListener("click", resetForm);

// Fonctions utilitaires
function showLoading() {
  resultDiv.innerHTML = `
    <div class="loading">
      <p>Analyse en cours...</p>
      <div class="spinner"></div>
    </div>
  `;
}

function showError(message) {
  resultDiv.innerHTML = `
    <div class="error">
      <p>❌ Erreur</p>
      <p>${message}</p>
    </div>
  `;
}

function showResults(data) {
  const severityValue = data.severity ? data.severity.split(" ")[0] : "N/A";
  
  resultDiv.innerHTML = `
    <div class="results">
      <h3>Résultats de l'analyse</h3>
      <div class="severity-meter">
        <div class="severity-bar" style="width: ${severityValue}%"></div>
      </div>
      <p>Niveau d'infection : <strong>${severityValue}</strong></p>
      ${data.image_url ? `<img src="${API_BASE_URL}${data.image_url}" alt="Résultat" style="max-width: 300px; margin-top: 15px;">` : ''}
    </div>
  `;
}

function resetForm() {
  fileInput.value = "";
  selectedFile = null;
  analyzeBtn.disabled = true;
  resultDiv.innerHTML = "";
}

// CSS intégré pour le chargement et les erreurs (ajoutez ceci dans votre CSS séparé si possible)
const style = document.createElement('style');
style.textContent = `
  .loading {
    text-align: center;
    padding: 20px;
  }
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 10px auto;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .error {
    color: #d9534f;
    padding: 10px;
    border: 1px solid #d9534f;
    border-radius: 4px;
    background-color: #f8d7da;
  }
  .severity-meter {
    height: 20px;
    background-color: #f3f3f3;
    border-radius: 10px;
    margin: 10px 0;
    overflow: hidden;
  }
  .severity-bar {
    height: 100%;
    background-color: #5cb85c;
    transition: width 0.5s ease;
  }
`;
document.head.appendChild(style);
