// Ensure openTab is defined globally
window.openTab = function(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
};

// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-storage.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCe3jK1jpK0gzVhXWUnQb61nG47yoIT3-g",
    authDomain: "yuvaganesh-youth.firebaseapp.com",
    databaseURL: "https://yuvaganesh-youth-default-rtdb.firebaseio.com",
    projectId: "yuvaganesh-youth",
    storageBucket: "yuvaganesh-youth.appspot.com",
    messagingSenderId: "217524328069",
    appId: "1:217524328069:web:2ef02302ca5579a8cdbbec",
    measurementId: "G-MEE96BCLZW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Constants for password protection
const password = '$Ganesha$'; // Replace with your actual password
const passwordDialog = document.getElementById('passwordDialog');
const passwordInput = document.getElementById('passwordInput');
const passwordSubmit = document.getElementById('passwordSubmit');
const closeModal = document.querySelector('.close');
const uploadVideoBtn = document.getElementById('uploadVideoBtn');
const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
const photoModal = document.getElementById('photoModal');
const modalImage = document.getElementById('modalImage');

let currentUploadType = '';

// Event listeners for file upload buttons and password dialog
uploadVideoBtn.addEventListener('click', () => showPasswordDialog('video'));
uploadPhotoBtn.addEventListener('click', () => showPasswordDialog('photo'));
closeModal.addEventListener('click', closePasswordDialog);

passwordSubmit.addEventListener('click', () => {
    const enteredPassword = passwordInput.value;
    if (enteredPassword === password) {
        handleFileUpload(currentUploadType);
        clearPasswordInput(); // Clear the password field
        closePasswordDialog();
    } else {
        alert('Incorrect password!');
        clearPasswordInput(); // Clear the password field even if the password is incorrect
    }
});

// Show password dialog
function showPasswordDialog(type) {
    currentUploadType = type;
    passwordDialog.style.display = 'flex';
}

// Close password dialog
function closePasswordDialog() {
    passwordDialog.style.display = 'none';
}

// Clear the password input field
function clearPasswordInput() {
    passwordInput.value = '';
}

// Handle file upload with progress bar
async function handleFileUpload(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'video' ? 'video/mp4' : 'image/jpeg,image/png,image/gif';
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (type === 'video' && fileExtension !== 'mp4') {
            alert('Invalid video format. Only MP4 files are allowed.');
            return;
        }
        if (type === 'photo' && !['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            alert('Invalid image format. Only JPG, JPEG, PNG, and GIF files are allowed.');
            return;
        }

        const storageRef = ref(storage, `${type}s/${file.name}`);

        // Show progress bar
        document.getElementById(`${type}UploadProgress`).style.display = 'block';

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                document.getElementById(`${type}ProgressBar`).style.width = progress + '%';
                document.getElementById(`${type}UploadStatus`).textContent = `Uploading: ${Math.round(progress)}%`;
            }, 
            (error) => {
                // Handle unsuccessful uploads
                alert('Upload failed!');
                console.error('Upload error:', error);
                document.getElementById(`${type}UploadProgress`).style.display = 'none';
            }, 
            async () => {
                // Handle successful uploads on complete
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await addDoc(collection(db, type === 'video' ? 'videos' : 'photos'), {
                    url: downloadURL,
                    uploadedAt: serverTimestamp()
                });
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
                document.getElementById(`${type}UploadProgress`).style.display = 'none';
                loadFiles(type === 'video' ? 'videos' : 'photos', type === 'video' ? 'videoGrid' : 'photoGrid');
            }
        );
    };
    input.click();
}

// Load files from Firestore
window.onload = () => {
    document.getElementById('videosTab').click();
    loadFiles('photos', 'photoGrid');
    loadFiles('videos', 'videoGrid');
};

async function loadFiles(collectionName, gridId) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = ''; // Clear existing content

    try {
        const q = query(collection(db, collectionName), orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const message = document.createElement('p');
            message.textContent = 'No files found.';
            grid.appendChild(message);
        } else {
            querySnapshot.forEach((doc) => {
                const fileData = doc.data();
                const fileUrl = fileData.url;
                let element;

                if (collectionName === 'videos') {
                    // Handle video files
                    element = document.createElement('video');
                    element.src = fileUrl;
                    element.controls = true;
                    element.style.width = '100%';
                    element.style.height = 'auto';
                } else if (collectionName === 'photos') {
                    // Handle image files
                    element = document.createElement('img');
                    element.src = fileUrl;
                    element.style.width = '100%';
                    element.style.height = 'auto';

                    // Add click event to open photo modal
                    element.addEventListener('click', () => {
                        modalImage.src = fileUrl;
                        photoModal.style.display = 'flex';
                    });
                } else {
                    // Unsupported collection type
                    console.error('Unsupported collection type:', collectionName);
                    return;
                }

                element.onerror = () => {
                    console.error('Error loading file:', fileUrl);
                    const errorMessage = document.createElement('p');
                    errorMessage.textContent = 'Error loading file.';
                    grid.appendChild(errorMessage);
                };

                grid.appendChild(element);
            });
        }
    } catch (error) {
        console.error('Error loading files:', error);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Error loading files.';
        grid.appendChild(errorMessage);
    }
}

// Add event listener to close the photo modal when the close button is clicked
document.querySelectorAll('#photoModal .close').forEach(closeButton => {
    closeButton.addEventListener('click', () => {
        photoModal.style.display = 'none';
    });
});
