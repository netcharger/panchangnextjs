import os
import json
import requests
import shutil
from pathlib import Path

API_BASE = "https://api.dailypanchangam.com"
OUTPUT_DIR = Path("e:/DAILYCALENDAR/panchangweb/public/data")
MEDIA_SRC = Path("e:/DAILYCALENDAR/panchang_api/media")
MEDIA_DEST = Path("e:/DAILYCALENDAR/panchangweb/public/media")

# Create directories
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MEDIA_DEST.mkdir(parents=True, exist_ok=True)

def fetch_and_save(endpoint, filename):
    url = f"{API_BASE}{endpoint}"
    print(f"Fetching {url}...")
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # If it's paginated, fetch all pages
        if isinstance(data, dict) and ("results" in data or "data" in data):
            if "results" in data:
                results = data.get("results", [])
                next_url = data.get("next")
                while next_url:
                    print(f"Fetching next page {next_url}...")
                    resp = requests.get(next_url)
                    resp.raise_for_status()
                    next_data = resp.json()
                    results.extend(next_data.get("results", []))
                    next_url = next_data.get("next")
                data = results
            elif "data" in data:
                data = data.get("data", [])

        with open(OUTPUT_DIR / filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Saved to {OUTPUT_DIR / filename}")
        return data
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def copy_media():
    print(f"Copying media from {MEDIA_SRC} to {MEDIA_DEST}...")
    if MEDIA_SRC.exists():
        if MEDIA_DEST.exists():
            shutil.rmtree(MEDIA_DEST)
        shutil.copytree(MEDIA_SRC, MEDIA_DEST)
        print("Media copied successfully.")
    else:
        print(f"Source media directory {MEDIA_SRC} does not exist!")

def main():
    # 1. Carousel Images
    fetch_and_save("/api/mobile-settings/carousel-images/", "carousel_images.json")

    # 2. Categories
    categories = fetch_and_save("/api/posts/categories/", "categories.json")

    # 3. Posts (fetch for each category and all)
    all_posts = fetch_and_save("/api/posts/posts/", "all_posts.json")
    if categories:
        for cat in categories:
            slug = cat.get("slug")
            if slug:
                fetch_and_save(f"/api/posts/posts/?category={slug}", f"posts_category_{slug}.json")

    # 4. Wallpapers
    wallpaper_cats = fetch_and_save("/api/wallpapers/categories/", "wallpaper_categories.json")
    if wallpaper_cats:
        for cat in wallpaper_cats:
            cat_id = cat.get("id")
            if cat_id:
                # Fetch subcategories (the API seems to return wallpapers/subcats based on main_category_id)
                fetch_and_save(f"/api/wallpapers/wallpapers/?main_category_id={cat_id}", f"wallpaper_subcats_{cat_id}.json")

    # 5. Audio
    audio_cats = fetch_and_save("/api/audio-manager/categories/", "audio_categories.json")
    if audio_cats:
        for cat in audio_cats:
            slug = cat.get("slug")
            if slug:
                fetch_and_save(f"/api/audio-manager/audio-files/?category={slug}", f"audio_files_{slug}.json")

    # 6. Panchangam (Copy existing total files and split into daily files)
    panchang_src = MEDIA_SRC / "panchang_files"
    if panchang_src.exists():
        for f in panchang_src.glob("*.json"):
            # Copy the total file itself
            shutil.copy(f, OUTPUT_DIR / f.name)
            print(f"Copied total panchang file: {f.name}")
            
            # If it's a yearly file, split it into daily files for direct access
            if "_total_panchangam" in f.name:
                try:
                    with open(f, "r", encoding="utf-8") as file:
                        days_data = json.load(file)
                        if isinstance(days_data, list):
                            print(f"Splitting {f.name} into {len(days_data)} daily files...")
                            for day in days_data:
                                date_str = day.get("date")
                                if date_str:
                                    with open(OUTPUT_DIR / f"{date_str}.json", "w", encoding="utf-8") as df:
                                        json.dump(day, df, indent=2, ensure_ascii=False)
                except Exception as e:
                    print(f"Error splitting {f.name}: {e}")

    # 7. Media files
    copy_media()

if __name__ == "__main__":
    main()
