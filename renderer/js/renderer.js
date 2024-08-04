// 这个内容是跑在浏览器Web的Context中
// 底层API是通过preload生命得到，比如大家看到的os、path等
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

    form.style.display = 'block';
    filename.innerText = file.name;

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
        destination: "https://github.com/red-chen/image-resizer",
        newWindow: true,
        close: true,
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#f08585",
          height: "25px",
          color: "white",
          textAlign: "center",
        },
    });
}

function alertSuucess(msg) {
    Toastify.toast({
        text: msg,
        duration: 5000,
        close: false,
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "green",
          height: "25px",
          color: "white",
          textAlign: "center",
        },
    });
}

// Send image data to main process using ipcRenderer
function sendImage(e) {
    // 阻止表单提交
    e.preventDefault();

    // 前置参数检查
    const width = widthInput.value;
    const height = heightInput.value;
    if (width === '' || height === '') {
        alertError("Please fill the width and height");
        return;
    } 
    
    if (!img.files[0]) {
        alertError("Please upload an image");
        return;
    }
    const filePath = img.files[0].path;

    // send to main process
    ipcRenderer.send('image:resize', {
        filePath,
        width,
        height,
    });
}

// Catch the image:done event
ipcRenderer.on('image:done', () => {
    alertSuucess(`Image resized to ${widthInput.value} and ${heightInput.value}`);
    return;
})

// Entrance
img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);