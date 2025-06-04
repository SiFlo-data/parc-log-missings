const map = L.map('map').setView([46.6, 2.2], 6); // Centre de la France

// Fond de carte satellite (Google)
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  attribution: '© Google'
}).addTo(map);

// Variable pour stocker le marqueur temporaire des coordonnées
let tempMarker = null;

// Groupe de couches pour les zones industrielles
let industrialLayer = L.layerGroup().addTo(map);

// Groupe de couches pour les marqueurs verts (coordonnées copiées)
let copiedMarkersLayer = L.layerGroup().addTo(map);

// Variable pour contrôler l'affichage des zones industrielles
let industrialLayerVisible = true;
let industrialAreasLoaded = false; // Variable pour éviter de recharger

// Icône verte pour les marqueurs de coordonnées copiées
const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Fonction pour afficher une notification temporaire
function showNotification(message) {
  const notification = document.createElement('div');
  notification.innerText = message;
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = '#4CAF50';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '1000';
  notification.style.fontSize = '14px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  document.body.appendChild(notification);
  
  // Disparaît après 2 secondes
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 2000);
}

// Fonction pour récupérer les coordonnées via clic droit
map.on('contextmenu', function(e) {
  // e.latlng contient les coordonnées du point cliqué
  const lat = e.latlng.lat.toFixed(6); // Arrondi à 6 décimales
  const lng = e.latlng.lng.toFixed(6);
  
  // Supprime le marqueur temporaire précédent s'il existe
  if (tempMarker) {
    map.removeLayer(tempMarker);
  }
  
  // Crée un marqueur temporaire à l'endroit cliqué
  tempMarker = L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }).addTo(map);
  
  // Crée le contenu de la popup avec les coordonnées, boutons d'action et lien Google Maps
  const googleMapsLink = `https://www.google.com/maps/place/${lat},${lng}`;
  const popupContent = `
    <div style="text-align: center;">
      <strong>Coordonnées GPS</strong><br>
      <strong>Latitude:</strong> ${lat}<br>
      <strong>Longitude:</strong> ${lng}<br><br>
      <button onclick="copyCoordinates('${lat}', '${lng}')" style="margin: 2px; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
        📋 Copier
      </button><br>
      <button onclick="removeTemporaryMarker()" style="margin: 2px; padding: 5px 10px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
        🗑️ Supprimer
      </button><br>
      <a href="${googleMapsLink}" target="_blank" style="display: inline-block; margin: 2px; padding: 5px 10px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 3px;">
        📍 Voir sur Google Maps
      </a>
    </div>
  `;
  
  // Affiche la popup avec les coordonnées
  tempMarker.bindPopup(popupContent).openPopup();
  
  // Affiche aussi les coordonnées dans la console du navigateur
  console.log(`Coordonnées cliquées: Latitude ${lat}, Longitude ${lng}`);
});

// Fonction pour rechercher par coordonnées GPS
function searchByCoordinates() {
  const latInput = document.getElementById('latInput').value;
  const lngInput = document.getElementById('lngInput').value;
  
  // Convertit les entrées en nombres
  const lat = parseFloat(latInput);
  const lng = parseFloat(lngInput);
  
  // Valide les coordonnées
  if (isNaN(lat) || isNaN(lng)) {
    alert('Veuillez entrer des coordonnées valides (nombres).');
    return;
  }
  if (lat < -90 || lat > 90) {
    alert('La latitude doit être comprise entre -90 et 90.');
    return;
  }
  if (lng < -180 || lng > 180) {
    alert('La longitude doit être comprise entre -180 et 180.');
    return;
  }
  
  // Centre la carte sur les coordonnées
  map.setView([lat, lng], 15);
  
  // Supprime le marqueur temporaire précédent s'il existe
  if (tempMarker) {
    map.removeLayer(tempMarker);
  }
  
  // Crée un marqueur temporaire à l'endroit saisi
  tempMarker = L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }).addTo(map);
  
  // Crée le contenu de la popup avec les coordonnées, boutons d'action et lien Google Maps
  const googleMapsLink = `https://www.google.com/maps/place/${lat.toFixed(6)},${lng.toFixed(6)}`;
  const popupContent = `
    <div style="text-align: center;">
      <strong>Coordonnées GPS</strong><br>
      <strong>Latitude:</strong> ${lat.toFixed(6)}<br>
      <strong>Longitude:</strong> ${lng.toFixed(6)}<br><br>
      <button onclick="copyCoordinates('${lat.toFixed(6)}', '${lng.toFixed(6)}')" style="margin: 2px; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
        📋 Copier
      </button><br>
      <button onclick="removeTemporaryMarker()" style="margin: 2px; padding: 5px 10px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
        🗑️ Supprimer
      </button><br>
      <a href="${googleMapsLink}" target="_blank" style="display: inline-block; margin: 2px; padding: 5px 10px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 3px;">
        📍 Voir sur Google Maps
      </a>
    </div>
  `;
  
  // Affiche la popup avec les coordonnées
  tempMarker.bindPopup(popupContent).openPopup();
  
  // Affiche les coordonnées dans la console
  console.log(`Coordonnées recherchées: Latitude ${lat.toFixed(6)}, Longitude ${lng.toFixed(6)}`);
}

// Fonction pour coller les coordonnées du presse-papiers dans les champs de recherche
function pasteCoordinates() {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.readText().then(text => {
      // Gère les coordonnées séparées par une tabulation (Excel) ou une virgule
      let coords;
      if (text.includes('\t')) {
        // Format Excel: "latitude\tlongitude"
        coords = text.split('\t').map(coord => coord.trim());
      } else if (text.includes(',')) {
        // Format existant: "latitude, longitude"
        coords = text.split(',').map(coord => coord.trim());
      } else {
        alert('Format incorrect. Veuillez copier des coordonnées au format "latitude, longitude" ou "latitude[tab]longitude".');
        return;
      }
      
      if (coords.length !== 2) {
        alert('Format incorrect. Veuillez copier des coordonnées au format "latitude, longitude" ou "latitude[tab]longitude".');
        return;
      }
      
      const lat = coords[0];
      const lng = coords[1];
      
      // Vérifie que les valeurs sont des nombres valides
      if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        alert('Les coordonnées doivent être des nombres valides.');
        return;
      }
      
      // Remplit les champs de recherche
      document.getElementById('latInput').value = lat;
      document.getElementById('lngInput').value = lng;
    }).catch(err => {
      console.error('Erreur lors de la lecture du presse-papiers:', err);
      alert('Erreur lors de la lecture du presse-papiers.');
    });
  } else {
    alert('La lecture du presse-papiers n\'est pas supportée dans ce navigateur.');
  }
}

// Fonction pour récupérer les zones industrielles via l'API Overpass
function loadIndustrialAreas() {
  // Récupère les limites actuelles de la carte
  const bounds = map.getBounds();
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();
  
  // Requête Overpass pour récupérer les zones industrielles
  const overpassQuery = `[out:json][timeout:25];
  (
    way["landuse"="industrial"](${south},${west},${north},${east});
    relation["landuse"="industrial"](${south},${west},${north},${east});
  );
  out geom;`;
  
  // Encode la requête pour l'URL
  const encodedQuery = encodeURIComponent(overpassQuery);
  
  // URL de l'API Overpass avec méthode GET (évite les problèmes CORS)
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;
  
  // Affiche un indicateur de chargement
  console.log('Chargement des zones industrielles...');
  
  // Essaie plusieurs serveurs Overpass en cas d'échec
  const overpassServers = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/api/interpreter'
  ];
  
  // Fonction pour essayer chaque serveur
  async function tryOverpassServer(serverIndex = 0) {
    if (serverIndex >= overpassServers.length) {
      console.error('Tous les serveurs Overpass ont échoué');
      alert('Impossible de charger les zones industrielles. Serveurs Overpass indisponibles.');
      return;
    }
    
    try {
      const server = overpassServers[serverIndex];
      const url = `${server}?data=${encodedQuery}`;
      
      console.log(`Essai du serveur ${serverIndex + 1}/${overpassServers.length}: ${server}`);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`${data.elements.length} zones industrielles trouvées`);
      
      // Traite chaque élément retourné
      data.elements.forEach(element => {
        if (element.type === 'way' && element.geometry) {
          // Convertit les coordonnées au format Leaflet
          const coordinates = element.geometry.map(coord => [coord.lat, coord.lon]);
          
          // Crée un polygone pour la zone industrielle
          const polygon = L.polygon(coordinates, {
            color: '#ff6600',
            weight: 2,
            opacity: 0.8,
            fillColor: '#ff6600',
            fillOpacity: 0.2
          });
          
          // Ajoute des informations dans la popup
          const popupContent = `
            <strong>Zone Industrielle</strong><br>
            <strong>Type:</strong> ${element.tags?.landuse || 'industrial'}<br>
            <strong>Nom:</strong> ${element.tags?.name || 'Non spécifié'}<br>
            <strong>ID OSM:</strong> ${element.id}
          `;
          
          polygon.bindPopup(popupContent);
          
          // Ajoute le polygone au groupe de couches industrielles
          industrialLayer.addLayer(polygon);
        }
      });
      
      industrialAreasLoaded = true; // Marque les zones comme chargées
      
    } catch (error) {
      console.error(`Erreur avec le serveur ${serverIndex + 1}:`, error);
      // Essaie le serveur suivant
      tryOverpassServer(serverIndex + 1);
    }
  }
  
  // Lance la tentative avec le premier serveur
  tryOverpassServer();
}

// Fonction pour basculer l'affichage des zones industrielles
function toggleIndustrialLayer() {
  if (industrialLayerVisible) {
    map.removeLayer(industrialLayer);
    industrialLayerVisible = false;
    document.getElementById('toggleIndustrial').textContent = '🏭 Afficher zones industrielles';
  } else {
    map.addLayer(industrialLayer);
    industrialLayerVisible = true;
    document.getElementById('toggleIndustrial').textContent = '🏭 Masquer zones industrielles';
  }
}

// Fonction pour recharger les zones industrielles
function refreshIndustrialAreas() {
  // Efface les couches existantes
  industrialLayer.clearLayers();
  industrialAreasLoaded = false;
  loadIndustrialAreas();
}

// Fonction pour copier les coordonnées dans le presse-papiers (avec notification et marqueur vert)
function copyCoordinates(lat, lng) {
  const coordinates = `${lat}, ${lng}`;
  
  // Méthode moderne pour copier dans le presse-papiers
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(coordinates).then(() => {
      console.log(`Coordonnées copiées: ${coordinates}`);
      showNotification('Coordonnées copiées !');
      // Ajoute un marqueur vert permanent
      const copiedMarker = L.marker([lat, lng], { icon: greenIcon }).addTo(copiedMarkersLayer);
      const googleMapsLink = `https://www.google.com/maps/place/${lat},${lng}`;
      copiedMarker.bindPopup(`
        <strong>Coordonnées copiées</strong><br>
        Lat: ${lat}<br>
        Lng: ${lng}<br><br>
        <a href="${googleMapsLink}" target="_blank" style="display: inline-block; margin: 2px; padding: 5px 10px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 3px;">
          📍 Voir sur Google Maps
        </a>
      `);
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
      fallbackCopyTextToClipboard(coordinates);
    });
  } else {
    // Méthode de fallback pour les navigateurs plus anciens
    fallbackCopyTextToClipboard(coordinates);
  }
}

// Fonction de fallback pour copier du texte (navigateurs anciens, avec notification et marqueur vert)
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Évite le scroll sur iOS
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      console.log(`Coordonnées copiées: ${text}`);
      showNotification('Coordonnées copiées !');
      // Extrait lat et lng depuis le texte copié (format: "lat, lng")
      const coords = text.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        const copiedMarker = L.marker([coords[0], coords[1]], { icon: greenIcon }).addTo(copiedMarkersLayer);
        const googleMapsLink = `https://www.google.com/maps/place/${coords[0]},${coords[1]}`;
        copiedMarker.bindPopup(`
          <strong>Coordonnées copiées</strong><br>
          Lat: ${coords[0]}<br>
          Lng: ${coords[1]}<br><br>
          <a href="${googleMapsLink}" target="_blank" style="display: inline-block; margin: 2px; padding: 5px 10px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 3px;">
            📍 Voir sur Google Maps
          </a>
        `);
      }
    } else {
      alert('Impossible de copier les coordonnées');
    }
  } catch (err) {
    console.error('Erreur de copie:', err);
    alert('Erreur lors de la copie');
  }
  
  document.body.removeChild(textArea);
}

// Fonction pour supprimer le marqueur temporaire
function removeTemporaryMarker() {
  if (tempMarker) {
    map.removeLayer(tempMarker);
    tempMarker = null;
  }
}

// Ajout d'un indicateur visuel pour informer l'utilisateur
// Crée un contrôle d'information en haut à droite
const info = L.control({position: 'topright'});
info.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'info-control');
  div.innerHTML = `
    <strong>💡 Astuces:</strong><br>
    • Clic droit sur la carte pour obtenir les coordonnées GPS<br>
    • Zones industrielles chargées une seule fois<br>
    <strong>Rechercher par coordonnées:</strong><br>
    <input id="latInput" type="text" placeholder="Latitude (ex: 48.8566)" style="width: 160px; margin-top: 5px; padding: 3px; font-size: 10px; border: 1px solid #ccc; border-radius: 3px;"><br>
    <input id="lngInput" type="text" placeholder="Longitude (ex: 2.3522)" style="width: 160px; margin-top: 2px; padding: 3px; font-size: 10px; border: 1px solid #ccc; border-radius: 3px;"><br>
    <button onclick="pasteCoordinates()" style="margin-top: 2px; padding: 3px 6px; font-size: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
      📋 Coller
    </button>
    <button onclick="searchByCoordinates()" style="margin-top: 2px; padding: 3px 6px; font-size: 10px; background-color: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">
      🔍 Rechercher
    </button><br>
    <button id="toggleIndustrial" onclick="toggleIndustrialLayer()" style="margin-top: 5px; padding: 3px 6px; font-size: 10px; background-color: #ff6600; color: white; border: none; border-radius: 3px; cursor: pointer;">
      🏭 Masquer zones industrielles
    </button><br>
    <button onclick="refreshIndustrialAreas()" style="margin-top: 2px; padding: 3px 6px; font-size: 10px; background-color: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">
      🔄 Forcer rechargement
    </button>
  `;
  div.style.backgroundColor = 'white';
  div.style.padding = '10px';
  div.style.border = '2px solid #ccc';
  div.style.borderRadius = '5px';
  div.style.fontSize = '12px';
  div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  div.style.maxWidth = '200px';
  return div;
};
info.addTo(map);

// Gestion de l'import du fichier Excel
document.getElementById('fileInput').addEventListener('change', handleFile, false);

function handleFile(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    jsonData.forEach(point => {
      const lat = parseFloat(point.Latitude || point.lat || point.latitude);
      const lon = parseFloat(point.Longitude || point.lon || point.longitude);
      const assetNumber = point["Asset Number"] || 'Inconnu';
      const sqm = point["SURFACE TOTALE"] || 'Inconnu';

      if (!isNaN(lat) && !isNaN(lon)) {
        // Crée une étiquette personnalisée
          const isHighAsset = !isNaN(assetNumber) && Number(assetNumber) > 4023;
          const backgroundColor = isHighAsset ? 'rgba(0, 128, 0, 0.39)' : 'rgba(255, 255, 255, 0.07)'; // vert ou blanc semi-transparent

          const labelIcon = L.divIcon({
            className: 'asset-label',
            html: `<div style="background-color: ${backgroundColor}; padding: 2px 6px; border-radius: 4px;"><strong>${assetNumber}</strong></div>`,
            iconSize: [80, 20],
            iconAnchor: [40, 10]
          });


        // Ajoute le point sur la carte avec l'étiquette
        L.marker([lat, lon], { icon: labelIcon }).addTo(map)
          .bindPopup(`
            <strong>Asset Number :</strong> ${assetNumber}<br>
            <strong>Sqm :</strong> ${sqm}<br>
            <strong>Latitude:</strong> ${lat}<br>
            <strong>Longitude:</strong> ${lon}
          `);
      }
    });
  };

  reader.readAsArrayBuffer(file);

  // Charge les zones industrielles après l'import du fichier seulement si pas déjà fait
  if (!industrialAreasLoaded) {
    setTimeout(() => {
      loadIndustrialAreas();
    }, 1000);
  }
}

// Chargement initial des zones industrielles au démarrage
setTimeout(() => {
  loadIndustrialAreas();
}, 2000);