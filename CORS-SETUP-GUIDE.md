# ✅ Configurar CORS en Firebase Storage - Guía Rápida

## Paso 1: Abre Firebase Console
👉 https://console.firebase.google.com/project/antojado-9d910/storage

## Paso 2: Haz clic en "Reglas" (Rules tab)
(Está en la parte superior, junto a "Archivos")

## Paso 3: Borra todo y pega esto:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Paso 4: Haz clic en "Publicar" (Publish button)

---

## ¿Por qué esto soluciona el problema?

El error **CORS** ocurre porque Firebase Storage no sabe si debe permitir acceso desde tu app en `http://localhost:5173`.

Con estas reglas:
- ✅ Cualquiera puede **leer** imágenes (públicas)
- ✅ Solo usuarios **autenticados** pueden **escribir** (subir)
- ✅ **CORS se configura automáticamente**

---

## ¿Todavía hay errores después?

1. **Limpiar caché del navegador**: Ctrl + Shift + Delete
2. **Modo incógnito**: Abre la app en una ventana privada
3. **Esperar 2-5 minutos**: A veces Firebase tarda en propagar
4. **Recargar completamente**: Ctrl + F5

---

## Si nada funciona, usa esta alternativa temporal:

Modifica `src/AuthContext.jsx` para almacenar imágenes como base64 en Firestore 
mientras esperas que funcione CORS.

---

**¿Necesitas ayuda? Dimelo cuando completes los pasos.**
