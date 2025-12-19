export const getImageSize = (image_url, image_type, size) => {
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

    const sizedFolder = `${folder}${size}/`;

    // Already thumb? return same
    if (url.includes(sizedFolder)) return url;

    // Replace folder with size folder
    if (url.includes(folder)) {
        return url.replace(folder, sizedFolder);
    }

    return url;


};
