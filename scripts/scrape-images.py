"""
Script de scraping d'images pour Boutique-Tohin
Récupère les images produits depuis Amazon FR et les ajoute dans Airtable
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import re

# ============================================================
# ⚙️ CONFIGURATION — Remplissez vos clés ici
# ============================================================
AIRTABLE_API_KEY = "VOTRE_CLE_API_AIRTABLE"   # Trouvez-la sur airtable.com/account
AIRTABLE_BASE_ID = "appTfbWbNKaqzbv7c"
AIRTABLE_TABLE_ID = "tblWsmRQR7IswP4mK"

# ============================================================
# 📦 LISTE DES PRODUITS AVEC LEURS LIENS AMAZON
# ============================================================
PRODUITS = [
    # ── CERAVE ──────────────────────────────────────────────
    {
        "sku": "CVE-SPF50-001",
        "nom": "CeraVe Crème Hydratante Visage SPF50 52ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Creme+Hydratante+Visage+SPF50+52ml"
    },
    {
        "sku": "CVE-GOC-001",
        "nom": "CeraVe Gel-Crème Oil Control 52ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Gel+Creme+Oil+Control+52ml"
    },
    {
        "sku": "CVE-GM-001",
        "nom": "CeraVe Gel Moussant 236ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Gel+Moussant+236ml+peaux+normales+grasses"
    },
    {
        "sku": "CVE-GMAI-001",
        "nom": "CeraVe Gel Moussant Anti-Imperfections 236ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Gel+Moussant+Anti+Imperfections+236ml"
    },
    {
        "sku": "CVE-GM88-001",
        "nom": "CeraVe Gel Moussant 88ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Gel+Moussant+88ml"
    },
    {
        "sku": "CVE-LH236-001",
        "nom": "CeraVe Lait Hydratant 236ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Lait+Hydratant+Corps+236ml"
    },
    {
        "sku": "CVE-LOTSA-001",
        "nom": "CeraVe Lotion Hydratante SA 236ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Lotion+SA+anti+rugosites+236ml"
    },
    {
        "sku": "CVE-SVC30-001",
        "nom": "CeraVe Sérum Vitamine C 30ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Serum+Vitamine+C+30ml"
    },
    {
        "sku": "CVE-SRM30-001",
        "nom": "CeraVe Sérum Rétinol Anti-Marques 30ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Serum+Retinol+Anti+Marques"
    },
    {
        "sku": "CVE-SCAI40-001",
        "nom": "CeraVe Soin Concentré Anti-Imperfections 40ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Soin+Concentre+Anti+Imperfections+40ml"
    },
    {
        "sku": "CVE-FTS50-001",
        "nom": "CeraVe Fluide Toucher Sec SPF50+ 50ml",
        "amazon_url": "https://www.amazon.fr/s?k=CeraVe+Fluide+SPF50+Toucher+Sec"
    },

    # ── YVES ROCHER ─────────────────────────────────────────
    {
        "sku": "YR-GNPP-001",
        "nom": "Yves Rocher Gel Nettoyant Purifiant Pure Menthe 125ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Gel+Nettoyant+Purifiant+Pure+Menthe"
    },
    {
        "sku": "YR-GCZD-001",
        "nom": "Yves Rocher Gel-Crème Zéro Défaut 50ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Gel+Creme+Zero+Defaut"
    },
    {
        "sku": "YR-SAI-001",
        "nom": "Yves Rocher Sérum Anti-Imperfections 30ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Serum+Anti+Imperfections"
    },
    {
        "sku": "YR-BDAPR-001",
        "nom": "Yves Rocher Bain Douche Argan & Pétales de Rose 400ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Bain+Douche+Argan+Rose+400ml"
    },
    {
        "sku": "YR-SDMONOI-001",
        "nom": "Yves Rocher Shampoing-Douche Monoï 400ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Shampoing+Douche+Monoi+400ml"
    },
    {
        "sku": "YR-BDVB-001",
        "nom": "Yves Rocher Bain Douche Vanille Bourbon 400ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Bain+Douche+Vanille+Bourbon"
    },
    {
        "sku": "YR-CGLG-001",
        "nom": "Yves Rocher Crème Douceur La Gacilly 125ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Creme+Douceur+La+Gacilly"
    },
    {
        "sku": "YR-LCMONOI-001",
        "nom": "Yves Rocher Lait Corps Monoï 390ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Lait+Corps+Monoi+390ml"
    },
    {
        "sku": "YR-LCNOUR-001",
        "nom": "Yves Rocher Lait Corps Nourrissant 390ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Lait+Corps+Nourrissant+390ml"
    },
    {
        "sku": "YR-NDAI-001",
        "nom": "Yves Rocher Nettoyant Désincrustant Anti-Imperfections 125ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Nettoyant+Desincrustant+Anti+Imperfections"
    },
    {
        "sku": "YR-GP-001",
        "nom": "Yves Rocher Gommage Purifiant 75ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Gommage+Purifiant+visage"
    },
    {
        "sku": "YR-MDC-001",
        "nom": "Yves Rocher Masque Désincrustant au Charbon 75ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Masque+Charbon"
    },
    {
        "sku": "YR-SHCOCO-001",
        "nom": "Yves Rocher Shampoing Doux Noix de Coco 300ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Shampoing+Noix+de+Coco+300ml"
    },
    {
        "sku": "YR-SHJOJOBA-001",
        "nom": "Yves Rocher Shampoing Réparateur Jojoba Bio 300ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Shampoing+Jojoba+Bio"
    },
    {
        "sku": "YR-HUILEARGAN-001",
        "nom": "Yves Rocher Huile Corps & Cheveux Argan & Rose 100ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Huile+Corps+Cheveux+Argan+Rose"
    },
    {
        "sku": "YR-EAUMICELLE-001",
        "nom": "Yves Rocher Eau Micellaire Apaisante Concombre 200ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Eau+Micellaire+Concombre"
    },
    {
        "sku": "YR-LCMAINS-001",
        "nom": "Yves Rocher Crème Mains Nourrissante Karité 75ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Creme+Mains+Karite"
    },
    {
        "sku": "YR-EDTHOMME-001",
        "nom": "Yves Rocher Eau de Toilette Homme Hoggar 75ml",
        "amazon_url": "https://www.amazon.fr/s?k=Yves+Rocher+Hoggar+Eau+de+Toilette"
    },

    # ── VICHY ───────────────────────────────────────────────
    {
        "sku": "VIC-DEOFS-001",
        "nom": "Vichy Déo Bille Anti-Transpirant 48H Peaux Sensibles Femme",
        "amazon_url": "https://www.amazon.fr/s?k=Vichy+Deodorant+Bille+48H+Peaux+Sensibles+Femme"
    },
    {
        "sku": "VIC-DEOFM-001",
        "nom": "Vichy Déo Bille Minéral 48H Femme",
        "amazon_url": "https://www.amazon.fr/s?k=Vichy+Deodorant+Mineral+48H+Bille+Femme"
    },
    {
        "sku": "VIC-DEOHPS-001",
        "nom": "Vichy Homme Déo Bille Anti-Transpirant 48H Peaux Sensibles",
        "amazon_url": "https://www.amazon.fr/s?k=Vichy+Homme+Deodorant+Bille+48H+Peau+Sensible"
    },
    {
        "sku": "VIC-DEOHCE-001",
        "nom": "Vichy Homme Déo Bille Contrôle Extrême 72H",
        "amazon_url": "https://www.amazon.fr/s?k=Vichy+Homme+Deodorant+Controle+Extreme+72H"
    },
    {
        "sku": "VIC-NORMGEL-001",
        "nom": "Vichy Normaderm Gel Purifiant Intense 200ml",
        "amazon_url": "https://www.amazon.fr/s?k=Vichy+Normaderm+Gel+Purifiant+200ml"
    },
    {
        "sku": "VIC-MIN89-001",
        "nom": "Vichy Minéral 89 Booster Quotidien 30ml",
        "amazon_url": "https://www.amazon.fr/s?k=Vichy+Mineral+89+Booster+30ml"
    },
    {
        "sku": "VIC-NORMSOIN-001",
        "nom": "Vichy Normaderm Phytosolution Soin Double Correction 50ml",
        "amazon_url": "https://www.amazon.fr/s?k=Vichy+Normaderm+Phytosolution+Double+Correction"
    },
    {
        "sku": "VIC-CAPSOLEIL-001",
        "nom": "Vichy Capital Soleil UV-Clear SPF50+",
        "amazon_url": "https://www.amazon.fr/s?k=Vichy+Capital+Soleil+UV+Clear+SPF50"
    },
]

# ============================================================
# 🔧 FONCTIONS
# ============================================================

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "fr-FR,fr;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}


def get_images_from_amazon(url, nb_images=3):
    """Scrape les URLs d'images depuis une page Amazon"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        images = []

        # Méthode 1 : balises img dans les résultats de recherche
        img_tags = soup.select("img.s-image")
        for img in img_tags[:nb_images]:
            src = img.get("src", "")
            if src and "amazon" in src:
                # Remplace la résolution basse par haute résolution
                src_hd = re.sub(r'\._.*?_\.', ".", src)
                images.append(src_hd)

        # Méthode 2 : données JSON embarquées dans la page
        if not images:
            scripts = soup.find_all("script", type="text/javascript")
            for script in scripts:
                if script.string and "ImageBlockATF" in str(script.string):
                    matches = re.findall(r'"hiRes":"(https://[^"]+)"', str(script.string))
                    images.extend(matches[:nb_images])

        return images[:nb_images]

    except Exception as e:
        print(f"  ❌ Erreur scraping : {e}")
        return []


def get_airtable_record_id(sku):
    """Récupère l'ID Airtable d'un produit via son SKU"""
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"
    headers = {"Authorization": f"Bearer {AIRTABLE_API_KEY}"}
    params = {"filterByFormula": f"{{fld0ld3G43IlqsrdS}}='{sku}'"}

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    records = data.get("records", [])
    if records:
        return records[0]["id"]
    return None


def update_airtable_images(record_id, image_urls):
    """Met à jour le champ Images dans Airtable"""
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}/{record_id}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    # Airtable attend un tableau d'objets avec url
    attachments = [{"url": img_url} for img_url in image_urls]

    payload = {
        "fields": {
            "fldYaB7pJarJVzMfm": attachments  # Champ Images
        }
    }

    response = requests.patch(url, headers=headers, json=payload)
    return response.status_code == 200


# ============================================================
# 🚀 SCRIPT PRINCIPAL
# ============================================================

def main():
    print("=" * 60)
    print("🛒 Boutique-Tohin — Scraper d'images")
    print("=" * 60)
    print(f"📦 {len(PRODUITS)} produits à traiter\n")

    succes = 0
    echecs = []

    for i, produit in enumerate(PRODUITS, 1):
        sku = produit["sku"]
        nom = produit["nom"]
        print(f"[{i}/{len(PRODUITS)}] {sku} — {nom[:50]}...")

        # 1. Scraper les images
        images = get_images_from_amazon(produit["amazon_url"])

        if not images:
            print(f"  ⚠️  Aucune image trouvée")
            echecs.append(sku)
            time.sleep(2)
            continue

        print(f"  📸 {len(images)} image(s) trouvée(s)")

        # 2. Trouver l'ID Airtable
        record_id = get_airtable_record_id(sku)
        if not record_id:
            print(f"  ⚠️  Produit non trouvé dans Airtable")
            echecs.append(sku)
            continue

        # 3. Mettre à jour Airtable
        ok = update_airtable_images(record_id, images)
        if ok:
            print(f"  ✅ Airtable mis à jour !")
            succes += 1
        else:
            print(f"  ❌ Erreur mise à jour Airtable")
            echecs.append(sku)

        # Pause pour ne pas se faire bloquer
        time.sleep(3)

    # Résumé final
    print("\n" + "=" * 60)
    print(f"✅ Succès : {succes}/{len(PRODUITS)}")
    if echecs:
        print(f"❌ Échecs  : {len(echecs)} produit(s)")
        for sku in echecs:
            print(f"   - {sku}")
    print("=" * 60)


if __name__ == "__main__":
    main()
