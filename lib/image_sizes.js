exports.getImageSize = (image_url, image_type, size) => {
    if (!image_url) return image_url;

    const url = String(image_url);

    const folderMap = {
        post: "posts/",     // your real folder name
        post_images: "post_images/",
        category: "categories/",
        carousel: "carousel_images/",
        wallpapers: "wallpapers/",
    };

    const folder = folderMap[image_type];
    if (!folder) return url;

    let newUrl = url;

    // Replace folder with size folder
    if (url.includes(folder)) {
        newUrl = url.replace(folder, `${folder}${size}/`);
    }

    // Change extension to .webp for thumb and medium sizes
    if (size === "thumb" || size === "medium") {
        const lastDotIndex = newUrl.lastIndexOf('.');
        const queryParamIndex = newUrl.indexOf('?', lastDotIndex);

        if (lastDotIndex !== -1) {
            if (queryParamIndex !== -1) {
                // Has query parameters: replace extension before query params
                newUrl = newUrl.substring(0, lastDotIndex) + ".webp" + newUrl.substring(queryParamIndex);
            } else {
                // No query parameters: just replace extension
                newUrl = newUrl.substring(0, lastDotIndex) + ".webp";
            }
        } else if (queryParamIndex !== -1) {
            // No dot, but has query params (e.g., base_url/image?param=value) - append .webp before params
            newUrl = newUrl.substring(0, queryParamIndex) + ".webp" + newUrl.substring(queryParamIndex);
        } else {
            // No dot, no query params - just append .webp
            newUrl = newUrl + ".webp";
        }
    }

    return newUrl;

};