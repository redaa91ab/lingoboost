// Fichier script.js

// Quand on clique sur le bouton "Analyser"
document.getElementById("processBtn").addEventListener("click", function () {

  let niveau = document.getElementById("level").value;

  let fichiersCSV = [];
  if (niveau === "A1") {
    fichiersCSV.push("fichiersCSV/A1.csv");
    fichiersCSV.push("fichiersCSV/A2.csv");
    fichiersCSV.push("fichiersCSV/B1.csv");
    fichiersCSV.push("fichiersCSV/B2.csv");
    fichiersCSV.push("fichiersCSV/C1.csv");
  } else if (niveau === "A2") {
    fichiersCSV.push("fichiersCSV/A2.csv");
    fichiersCSV.push("fichiersCSV/B1.csv");
    fichiersCSV.push("fichiersCSV/B2.csv");
    fichiersCSV.push("fichiersCSV/C1.csv");
  } else if (niveau === "B1") {
    fichiersCSV.push("fichiersCSV/B1.csv");
    fichiersCSV.push("fichiersCSV/B2.csv");
    fichiersCSV.push("fichiersCSV/C1.csv");
  } else if (niveau === "B2") {
    fichiersCSV.push("fichiersCSV/B2.csv");
    fichiersCSV.push("fichiersCSV/C1.csv");
  } else if (niveau === "C1") {
    fichiersCSV.push("fichiersCSV/C1.csv");
  }

  let fichierPDF = document.getElementById("pdfUpload").files[0];
  if (!fichierPDF) {
    alert("Veuillez sélectionner un fichier PDF.");
    return;
  }

  let lecteur = new FileReader();

  lecteur.onload = function () {
    let tableau = new Uint8Array(this.result);

    pdfjsLib.getDocument(tableau).promise.then(function (pdf) {
      let texteComplet = "";
      let pageActuelle = 1;

      function lirePage() {
        if (pageActuelle > pdf.numPages) {
          chargerTousLesCSVEtAnalyserTexte(texteComplet);
          return;
        }

        pdf.getPage(pageActuelle).then(function (page) {
          page.getTextContent().then(function (contenu) {
            let morceaux = contenu.items.map(function (item) {
              return item.str;
            });

            texteComplet += morceaux.join(" ") + " ";
            pageActuelle++;
            lirePage();
          });
        });
      }

      lirePage();
    });
  };

  lecteur.readAsArrayBuffer(fichierPDF);

  function chargerTousLesCSVEtAnalyserTexte(textePDF) {
    let baseDeDonnees = []; // contient tous les mots et traductions
    let fichiersCharges = 0;

    for (let i = 0; i < fichiersCSV.length; i++) {
      fetch(fichiersCSV[i])
        .then(function (reponse) {
          return reponse.text();
        })
        .then(function (texteCSV) {
          let lignes = texteCSV.split("\n");
          for (let j = 0; j < lignes.length; j++) {
            let morceaux = lignes[j].split(",");
            if (morceaux.length >= 2) {
              let mot = morceaux[0].toLowerCase().trim();
              let traduction = morceaux[1].trim();
              baseDeDonnees.push({ mot: mot, traduction: traduction });
            }
          }
          fichiersCharges++;
          if (fichiersCharges === fichiersCSV.length) {
            analyserTexte(textePDF, baseDeDonnees);
          }
        });
    }
  }

  function analyserTexte(texte, baseDeDonnees) {
    let motsPDF = texte.toLowerCase().match(/\b[a-z]+\b/g);
    let resultatFinal = "";
    let motsDejaAffiches = new Set(); // ensemble pour éviter les doublons

    for (let i = 0; i < motsPDF.length; i++) {
      let motDuPDF = motsPDF[i];

      for (let j = 0; j < baseDeDonnees.length; j++) {
        if (baseDeDonnees[j].mot === motDuPDF && !motsDejaAffiches.has(motDuPDF)) {
          resultatFinal += `<li><strong>${baseDeDonnees[j].mot}</strong> → ${baseDeDonnees[j].traduction}</li>`;
          motsDejaAffiches.add(motDuPDF); // on marque ce mot comme déjà affiché
          break; // on passe au mot suivant du PDF dès qu'on trouve un match
        }
      }
    }

    document.getElementById("output").innerHTML = resultatFinal || "Aucun mot trouvé.";
  }
});


function toggleMenu() {
  const menu = document.getElementById("menu");
  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}








