SmartFlow Lima — Prototipo

Contenido:
- index.html — prototipo móvil (visualizado dentro de un mockup de teléfono cuando se abre en escritorio)
- dashboard.html — prototipo web (dashboard ATU)
- assets/style.css — estilos
- assets/app.js — lógica: pestañas, chat simulado, guardar reportes en localStorage
- SmartFlow_Lima_Estructura_Mockups.md — documentos de diseño

Probar localmente:

```powershell
cd "c:\web\ATU PROPUESTA"
python -m http.server 8000
# Abrir en el navegador:
# http://localhost:8000/index.html  # Mockup móvil (desktop muestra teléfono)
# http://localhost:8000/dashboard.html  # Dashboard web (vista de escritorio)
```

Publicar en GitHub:

```powershell
git add .
git commit -m "Add interactive prototype and polish styles"
git push origin main
```

Notas:
- Los reportes se guardan en `localStorage` (demo). Para producción, conéctalos a un backend.
- El prototipo usa Google Fonts y estilos modernos para una apariencia más profesional.
