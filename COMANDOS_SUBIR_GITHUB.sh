#!/bin/bash
# Script para subir el proyecto a GitHub
# Repositorio: TP_Final_Barrenechea_Julio

echo "🚀 Preparando para subir a GitHub..."
echo ""

# Cambiar el remote al nuevo repositorio
echo "📝 Cambiando remote a: https://github.com/lucianoba77/TP_Final_Barrenechea_Julio.git"
git remote set-url origin https://github.com/lucianoba77/TP_Final_Barrenechea_Julio.git

# Verificar el remote
echo ""
echo "✅ Remote configurado:"
git remote -v

echo ""
echo "📤 Subiendo código a GitHub..."
git push -u origin main

echo ""
echo "✅ ¡Listo! El código ha sido subido a GitHub."
echo "🌐 Repositorio: https://github.com/lucianoba77/TP_Final_Barrenechea_Julio"

