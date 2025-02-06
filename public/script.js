// Register service worker for PWA offline support
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js');
// }

// USB Connection settings
const filters = [
    { vendorId: 0x2fe3, productId: 0x0001 },
    { vendorId: 0x10c4, productId: 0xea60 }, // Silicon Labs CP210x
    { vendorId: 0x0403, productId: 0x6001 }, // FTDI FT232
    { vendorId: 0x1a86, productId: 0x7523 }, // CH340/CH341
    { vendorId: 0x067b, productId: 0x2303 }  // Prolific PL2303
];
let port;
let log = [];
let lastTimestamp = null;
let inEndpoint = null; // Вхідний ендпоінт для читання
let outEndpoint = null; // Вихідний ендпоінт для запису


async function connectUSB() {
    try {
        port = await navigator.usb.requestDevice({
            filters,
            // usbAllowedInterfaces: [0] // Дозволяє інтерфейс 0
        });
        await port.open();
        console.log('USB Device:', port);
        await port.selectConfiguration(1);
        console.log('USB Configuration:', port.configuration);
        // Automatically determine and claim the CDC interface
        const interfaces = port.configuration.interfaces;
        for (const iface of interfaces) {
            if (iface.alternate.endpoints.some(ep => ep.direction === "out")) {
                console.log('Chosed USB Interface:', iface);
                await port.claimInterface(iface.interfaceNumber);
                // Знаходимо вхідний та вихідний ендпоінти
                for (const ep of iface.alternate.endpoints) {
                    if (ep.direction === "in") inEndpoint = ep.endpointNumber;
                    if (ep.direction === "out") outEndpoint = ep.endpointNumber;
                }
                console.log('inEndpoint:', inEndpoint);
                console.log('outEndpoint:', outEndpoint);
                break;
            }
        }
        // console.log('USB Interface:', port.configuration.interfaces[0]);
        // await port.controlTransferOut({ requestType: 'vendor', recipient: 'device', request: 0x22, value: 0x01, index: 0 });
        readLoop();
    } catch (error) {
        console.error('USB Connection Error:', error);
    }
}

async function readLoop() {
    while (port) {
        console.log('Reading data...', [port]);
        const result = await port.transferIn(inEndpoint, 64);
        console.log('Data:', [result]);
        const text = new TextDecoder().decode(result.data);
        processData(text);
    }
}

function processData(data) {
    const lines = data.split('\n');
    const now = new Date();
    
    lines.forEach(line => {
        if (line.trim()) {
            const timestamp = now.toISOString();
            const timeDiff = lastTimestamp ? (now - lastTimestamp) / 1000 : 0;
            log.push(`${timestamp} [${timeDiff.toFixed(3)}s] ${line}`);
            lastTimestamp = now;
        }
    });
    updateUI();
}

function updateUI() {
    const logContainer = document.getElementById('log');
    logContainer.innerHTML = log.join('<br>');
}

function downloadLog() {
    const blob = new Blob([log.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'log.txt';
    link.click();
}

function clearLog() {
    log = [];
    updateUI();
}

document.getElementById('connect-btn').addEventListener('click', connectUSB);
document.getElementById('download-btn').addEventListener('click', downloadLog);
document.getElementById('clear-btn').addEventListener('click', clearLog);
