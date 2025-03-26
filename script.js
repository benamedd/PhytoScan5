const fileInput = document.getElementById("file");
const analyzeBtn = document.getElementById("analyze-btn");
const refreshBtn = document.getElementById("refresh-btn");
const resultDiv = document.getElementById("result");
let selectedFile = null;

// Prévisualisation immédiate pour vérifier le fichier sélectionné
fileInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  console.log("Selected File:", selectedFile);
  analyzeBtn.disabled = !selectedFile;

  if (selectedFile) {
    const previewUrl = URL.createObjectURL(selectedFile);
    console.log("Preview URL:", previewUrl);
    resultDiv.innerHTML = `
      <p><span style="font-weight: bold; color: red;">Selected File:</span> ${selectedFile.name}</p>
      <img src="${previewUrl}" alt="Preview" style="max-width: 200px;">
    `;
  } else {
    resultDiv.innerHTML = "";
  }
});

// Gestion du clic sur le bouton d'analyse
analyzeBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  console.log("Analyze Image Button Clicked");

  if (!selectedFile) {
    console.log("No file selected for analysis");
    resultDiv.innerHTML = "<p class='error'>Please select a file</p>";
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);
  resultDiv.innerHTML = "<p>Processing...</p>";

  try {
    console.log("Sending POST request to /upload");
    const response = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    console.log("Response received, status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Server response:", data);

    if (data.error) {
      resultDiv.innerHTML = `<p class="error">${data.error}</p>`;
    } else {
      // Extraction de la valeur numérique seule (ex. "23.09%") sans texte supplémentaire
      const severityValue = data.severity ? data.severity.split(" ")[0] : "Not available";

      // Affichage uniquement de la sévérité
      resultDiv.innerHTML = `
        <h2>Infection Severity: ${severityValue}</h2>
      `;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    console.error("Fetch error:", error);
  }
});

// Gestion du bouton de réinitialisation
refreshBtn.addEventListener("click", () => {
  fileInput.value = "";
  selectedFile = null;
  analyzeBtn.disabled = true;
  resultDiv.innerHTML = "";
  console.log("Results reset");
});

// Enregistrement du service worker (optionnel)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js") // Assurez-vous que ce chemin est correct
      .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });
}
