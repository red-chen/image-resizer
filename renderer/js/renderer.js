const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

console.log(versions.node());
console.log(versions.chrome());
console.log(versions.electron());

function loadImage(e) {
    const file = e.target.files[0];
    if (!isImage(file)) {
        alertError('Please select an image.');
        return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = () => {
        widthInput.value = image.width;
        heightInput.value = image.height;
    };

    console.log('success');
    form.style.display = 'block';
    filename.innerText = file.name;

    // outputPath.innerText = os.homedir();
    outputPath.innerText = path.join(os.homedir(), 'image-resizer');
}

function isImage(fileName) {
    const types = ['image/gif', 'image/png', 'image/jpeg'];
    return fileName && types.includes(fileName['type'])
}

function alertError(msg) {
    Toastify.toast({
        text: msg,
        duration: 5000,
        destination: "https://github.com/apvarun/toastify-js",
        newWindow: true,
        close: true,
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#f08585",
          height: "25px",
          textAlign: "center",
        },
    });
}


img.addEventListener('change', loadImage);