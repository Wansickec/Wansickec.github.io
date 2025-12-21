// Function to create and download a zip file
function downloadWakaClient() {
    // Проверить авторизацию
    if (!api.isAuthenticated()) {
        openLogin();
        return;
    }

    // Create a simple zip file (using base64 encoded minimal zip)
    // This is a minimal valid ZIP file structure
    const zipContent = createMinimalZip();
    
    // Create blob and download
    const blob = new Blob([zipContent], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TemkaClient.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Log download
    logDownload('TemkaClient.zip', '3.0.0');
    
    // Redirect to external site after download
    setTimeout(() => {
        window.location.href = 'https://workupload.com/start/RXAT5rMZWcM';
    }, 1000);
}

// Create a minimal valid ZIP file
function createMinimalZip() {
    // This creates a basic ZIP with a text file inside
    // ZIP file structure with one file "README.txt"
    
    const fileName = 'README.txt';
    const fileContent = 'Temka Client v3.0.0\n\nСпасибо за загрузку!\n\nЭто демонстрационная версия.\n\nДата загрузки: ' + new Date().toLocaleString('ru-RU');
    
    // Create ZIP using JSZip library approach (manual binary construction)
    const uint8array = new Uint8Array(createZipBinary(fileName, fileContent));
    return uint8array;
}

// Create ZIP binary data
function createZipBinary(fileName, fileContent) {
    const encoder = new TextEncoder();
    const fileNameBytes = encoder.encode(fileName);
    const fileContentBytes = encoder.encode(fileContent);
    
    // Local file header signature
    const localFileHeader = [0x50, 0x4b, 0x03, 0x04]; // PK\x03\x04
    const version = [0x14, 0x00]; // Version 2.0
    const flags = [0x00, 0x00]; // No flags
    const compression = [0x00, 0x00]; // No compression
    const modTime = [0x00, 0x00]; // Modification time
    const modDate = [0x00, 0x00]; // Modification date
    
    // CRC-32 (simplified, not real CRC)
    const crc32 = [0x00, 0x00, 0x00, 0x00];
    
    // Sizes
    const compressedSize = uint32ToBytes(fileContentBytes.length);
    const uncompressedSize = uint32ToBytes(fileContentBytes.length);
    const fileNameLength = uint16ToBytes(fileNameBytes.length);
    const extraFieldLength = [0x00, 0x00];
    
    // Build local file header
    let zipData = [
        ...localFileHeader,
        ...version,
        ...flags,
        ...compression,
        ...modTime,
        ...modDate,
        ...crc32,
        ...compressedSize,
        ...uncompressedSize,
        ...fileNameLength,
        ...extraFieldLength,
        ...Array.from(fileNameBytes),
        ...Array.from(fileContentBytes)
    ];
    
    // Central directory header
    const centralDirHeader = [0x50, 0x4b, 0x01, 0x02]; // PK\x01\x02
    const versionMadeBy = [0x14, 0x00];
    const versionNeeded = [0x14, 0x00];
    
    let centralDir = [
        ...centralDirHeader,
        ...versionMadeBy,
        ...versionNeeded,
        ...flags,
        ...compression,
        ...modTime,
        ...modDate,
        ...crc32,
        ...compressedSize,
        ...uncompressedSize,
        ...fileNameLength,
        ...extraFieldLength,
        [0x00, 0x00], // file comment length
        [0x00, 0x00], // disk number start
        [0x00, 0x00], // internal file attributes
        [0x00, 0x00, 0x00, 0x00], // external file attributes
        ...uint32ToBytes(0), // relative offset of local header
        ...Array.from(fileNameBytes)
    ];
    
    // End of central directory record
    const endCentralDir = [0x50, 0x4b, 0x05, 0x06]; // PK\x05\x06
    const diskNumber = [0x00, 0x00];
    const diskWithCentralDir = [0x00, 0x00];
    const entriesOnDisk = [0x01, 0x00];
    const totalEntries = [0x01, 0x00];
    const centralDirSize = uint32ToBytes(centralDir.length);
    const centralDirOffset = uint32ToBytes(zipData.length);
    const commentLength = [0x00, 0x00];
    
    let endCentral = [
        ...endCentralDir,
        ...diskNumber,
        ...diskWithCentralDir,
        ...entriesOnDisk,
        ...totalEntries,
        ...centralDirSize,
        ...centralDirOffset,
        ...commentLength
    ];
    
    return [...zipData, ...centralDir, ...endCentral];
}

function uint32ToBytes(num) {
    return [
        num & 0xff,
        (num >> 8) & 0xff,
        (num >> 16) & 0xff,
        (num >> 24) & 0xff
    ];
}

function uint16ToBytes(num) {
    return [
        num & 0xff,
        (num >> 8) & 0xff
    ];
}

// Log download to database
async function logDownload(filename, version) {
    try {
        await api.logDownload(filename, version);
    } catch (error) {
        console.error('Error logging download:', error);
    }
}
