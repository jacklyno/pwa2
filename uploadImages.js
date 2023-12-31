const apiUrl = 'https://cqiixj66hi.execute-api.us-west-1.amazonaws.com/dev/mvrs/';

function uploadImages() {
    const request = indexedDB.open(dbName, 1);

    request.onsuccess = function (event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(objectStoreName)) {
            // If the object store doesn't exist, simply continue without attempting uploads.
            db.close();
            return;
        }

        const transaction = db.transaction(objectStoreName, 'readonly');
        const store = transaction.objectStore(objectStoreName);

        store.openCursor().onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
                const timestamp = cursor.key;
                const imageFile = cursor.value.file;

                // Upload the image to the API
                uploadImageToAPI(apiUrl + timestamp + '.jpg', imageFile);

                // Continue iterating through images
                cursor.continue();
            }
        };

        transaction.oncomplete = function () {
            db.close();
        };
    };
}

function uploadImageToAPI(apiUrl, imageFile) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "image/jpg");
    myHeaders.append("Access-Control-Allow-Origin","*");
    myHeaders.append("Access-Control-Allow-Methods","PUT, OPTIONS");

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        mode:'cors',
        body: imageFile,
        redirect: 'follow'
    };

    fetch(apiUrl, requestOptions)
        .then(response => {
            if (response.ok) {
                // Image uploaded successfully, you may want to remove it from IndexedDB
                console.log('Image uploaded successfully');
            } else {
                console.error('Error uploading image:', response.status, response.statusText);
            }
        })
        .catch(error => {
            console.error('Error uploading image:', error);
        });
}

// Set up periodic image upload (adjust the interval as needed)
const uploadInterval = 5000; // Upload every 5 seconds
setInterval(uploadImages, uploadInterval);
