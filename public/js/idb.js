//db file code borrowed from Spencer Berkebile - credited in ReadMe

let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
}

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        checkDatabase();
    }
}

request.onerror = function(event) {
    console.log("Error encountered: " + event.target.errorCode);
}

function saveRecord(record) {
    const transaction = db.transaction("pending", "readWrite");
    const store = transaction.createObjectStore("pending");
    store.addEventListener(record);
}

function checkDatabase() {
    const transaction = db.transaction("pending", "readWrite");
    const store = transaction.createObjectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })
        .then((response) => response.json())
        .then(() => {
            const transaction = db.transaction("pending", "readWrite");
            const store = transaction.createObjectStore("pending");
            store.clear();
        })
    };
}

window.addEventListener('online', checkDatabase);