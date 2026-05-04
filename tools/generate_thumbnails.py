import os
from pathlib import Path
from PIL import Image

MEDIA_ROOT = Path("e:/DAILYCALENDAR/panchangweb/public/media")

SIZES = {
    "thumb": (150, 150),
    "medium": (400, 400),
    "large": (800, 800)
}

def generate_thumbnails():
    print(f"Generating thumbnails in {MEDIA_ROOT}...")
    
    # Supported extensions
    extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    
    # List of folders to process
    target_folders = ['categories', 'carousel_images', 'post_images', 'wallpapers']
    
    for folder_name in target_folders:
        folder_path = MEDIA_ROOT / folder_name
        if not folder_path.exists():
            continue
            
        print(f"Processing folder: {folder_name}")
        
        # Walk through files in the folder (not recursively into thumb/medium)
        for item in folder_path.iterdir():
            if item.is_file() and item.suffix.lower() in extensions:
                # Skip if it's already in a size folder (though iterdir won't enter them)
                process_image(item, folder_path)

def process_image(img_path, parent_folder):
    try:
        with Image.open(img_path) as img:
            # Original format
            original_stem = img_path.stem
            
            for size_name, dimensions in SIZES.items():
                size_dir = parent_folder / size_name
                size_dir.mkdir(exist_ok=True)
                
                dest_path = size_dir / f"{original_stem}.webp"
                
                # Skip if already exists
                if dest_path.exists():
                    continue
                
                print(f"  Creating {size_name} for {img_path.name}...")
                
                # Calculate aspect ratio
                ratio = min(dimensions[0] / img.width, dimensions[1] / img.height)
                new_size = (int(img.width * ratio), int(img.height * ratio))
                
                resized_img = img.resize(new_size, Image.Resampling.LANCZOS)
                resized_img.save(dest_path, "WEBP", quality=85)
                
    except Exception as e:
        print(f"  Error processing {img_path.name}: {e}")

if __name__ == "__main__":
    generate_thumbnails()
