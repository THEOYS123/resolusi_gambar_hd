let uploadedImage = null;
let enhancedImage = null;

document.getElementById('imageInput').addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const inputImage = document.getElementById('inputImage');
        inputImage.src = e.target.result;
        inputImage.onload = async function () {
            document.getElementById('progress').textContent = 'Image uploaded. Enhancing...';
            enhancedImage = await enhanceImage(inputImage);
            displayEnhancedImage();
        };
    };
    reader.readAsDataURL(file);
});

async function enhanceImage(imageElement) {
    try {
        const model = await esrgan.load();
        const enhancedTensor = await model.enhance(imageElement);
        const enhancedImage = await tf.browser.toPixels(enhancedTensor);
        return createCanvasFromImageData(enhancedImage, enhancedTensor.shape[1], enhancedTensor.shape[0]);
    } catch (error) {
        document.getElementById('progress').textContent = 'Error enhancing image.';
        console.error(error);
    }
}

function createCanvasFromImageData(imageData, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    imgData.data.set(imageData);
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL();
}

function displayEnhancedImage() {
    const enhancedImageElement = document.getElementById('enhancedImage');
    enhancedImageElement.src = enhancedImage;
    document.getElementById('progress').textContent = 'Image enhanced successfully.';
    document.getElementById('downloadBtn').style.display = 'block';
}

function downloadEnhanced() {
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'enhanced_image.png';
    link.click();
}
