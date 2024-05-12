let form = document.querySelector("#form");
let fileInput = document.querySelector("#file");
let passwordInput = document.querySelector("#password");
let originalImagePreview = document.querySelector("#originalImagePreview");
let originalImageSize = document.querySelector("#originalImageSize");
let encryptedImageText = document.querySelector("#encryptedImageText");
let encryptedTextSize = document.querySelector("#encryptedTextSize");
let decryptedImagePreview = document.querySelector("#decryptedImagePreview");
let decryptedImageSize = document.querySelector("#decryptedImageSize");
const encryptionTab = document.getElementById("encryptionTab");
const decryptionTab = document.getElementById("decryptionTab");
const encryptionSection = document.getElementById("encryptionSection");
const decryptionSection = document.getElementById("decryptionSection");

var originalImageString, encryptedImageString, decryptedImageString;

// Add click event listeners to the tabs
encryptionTab.addEventListener("click", () => {
    encryptionSection.style.display = "block";
    decryptionSection.style.display = "none";
});

decryptionTab.addEventListener("click", () => {
    decryptionSection.style.display = "block";
    encryptionSection.style.display = "none";
});

// Add event listener to the Decryption tab
decryptionTab.addEventListener('click',() => {
    // Remove active class from Encryption tab and add it to Decryption tab
    encryptionTab.classList.remove('active');
    decryptionTab.classList.add('active');
});

encryptionTab.addEventListener('click', ()=> {
  toggleActiveClass(encryptionTab, decryptionTab);
});

decryptionTab.addEventListener('click', ()=> {
  toggleActiveClass(decryptionTab, encryptionTab);
});

// Function to toggle active class between two tabs
function toggleActiveClass(activeTab, inactiveTab) {
  activeTab.classList.add('active');
  inactiveTab.classList.remove('active');
}

const indicator = document.getElementById('indicator');

// Add event listeners to the tabs
encryptionTab.addEventListener('click', function() {
    moveIndicator(encryptionTab);
});

decryptionTab.addEventListener('click', function() {
    moveIndicator(decryptionTab);
});

// Function to move the indicator to the clicked tab
function moveIndicator(tab) {
    const tabRect = tab.getBoundingClientRect();
    const navbarRect = tab.parentElement.parentElement.getBoundingClientRect();
    const offsetX = tabRect.left - navbarRect.left;
    indicator.style.transform = `translateX(${offsetX}px)`;
}


// Function to encrypt.
// Pass plaintext and password
// returns cipher text
let encrypt = (plainText, password) => {
  return CryptoJS.AES.encrypt(
    plainText,
    password,
    { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  );
};

// Function to decrypt.
// Pass cipher and password
// returns plain text
let decrypt = (cipherString, password) => {
  return CryptoJS.AES.decrypt(
    cipherString,
    password,
    { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  ).toString(CryptoJS.enc.Utf8);
};

// Function to format file size bytes into human readable format
// Eg, 12000 bytes => 11.7 KiB
// si = base unit 1000 or 1024 , true = 1000, false = 1024
let fileSize = (bytes, si = true, dp = 1) => {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }
  const units = si
    ? ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
};

let encryptImage = (file, passwd) => {
  var reader = new FileReader();
  reader.onload = function () {
    // Get original string
    originalImageString = reader.result
      .replace("data:", "")
      .replace(/^.+,/, "");
    originalImagePreview.src = "data:image/png;base64," + originalImageString;
    originalImageSize.innerHTML = fileSize(
      new TextEncoder().encode(originalImageString).length
    );

    // Encrypt
    encryptedImageString = encrypt(originalImageString, passwd).toString(); // Ensure it's a string
    encryptedImageText.value = "data:image/png;base64," + encryptedImageString;
    encryptedTextSize.innerHTML = fileSize(
      new TextEncoder().encode(encryptedImageString).length
    );

    // Create a Blob from the encrypted string
    var blob = new Blob([encryptedImageString], {
      type: "text/plain;charset=utf-8",
    });

    // Create a link for the Blob
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "encryptedImage.txt"; // You can change the filename and extension
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Decrypt (Removed decryption from here)
  };

  reader.readAsDataURL(file);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const [file] = fileInput.files;
  if (file) originalImagePreview.src = URL.createObjectURL(file);
  let passwd = passwordInput.value;
  encryptImage(file, passwd);
});

// Function to decrypt the encrypted image string from the text file
let decryptFromTextFile = (encryptedImageString, passwd) => {
  // Decrypt the encrypted image string
  let decryptedImageString = decrypt(encryptedImageString, passwd);
  
  // Create an img element to display the decrypted image
  let decryptedImg = new Image();
  decryptedImg.src = "data:image/png;base64," + decryptedImageString;
  
  // Append the decrypted image to the DOM or do whatever you want with it
  // For example:
  decryptedImagePreview.src = decryptedImg.src;
};

// Function to decrypt the encrypted image string from a text file
let decryptFromFile = (file, passwd) => {
  var reader = new FileReader();
  reader.onload = function () {
    // Get the encrypted image string from the text file
    let encryptedImageStringFromFile = reader.result;

    // Decrypt the encrypted image string from the text file
    let decryptedImageString = decrypt(encryptedImageStringFromFile, passwd);

    // Display the decrypted image
    let decryptedImg = new Image();
    decryptedImg.src = "data:image/png;base64," + decryptedImageString;
    decryptedImg.onload = function () {
      decryptedImagePreview.src = decryptedImg.src;
      decryptedImageSize.innerHTML = fileSize(
        decryptedImg.src.length // Assuming this gives the correct size in bytes
      );
    };
  };
  reader.readAsText(file);
};

// Event listener for the "Decrypt Image" button
document.getElementById("decryptButton").addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  const passwordInput = document.getElementById("passwordInput");
  const file = fileInput.files[0];
  const passwd = passwordInput.value;

  if (file) {
    decryptFromFile(file, passwd);
  }
});
