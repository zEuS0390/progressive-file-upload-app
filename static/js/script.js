// Select relevant DOM elements
const fileInput = document.querySelector("#fileInput");
const button = document.querySelector("#upload-btn");
const downloadFilesContainer = document.querySelector(
  "#download-files-container"
);

// Event listener for the upload button
button.addEventListener("click", async () => {
  // Iterate through each selected file
  for (const theFile of fileInput.files) {
    // Generate a unique ID and create a unique filename
    const uniqueID = Math.floor(Math.random() * 1024);
    const fileName = theFile.name;

    // Create and append the upload progress element to the container
    const uploadProgressElement = createUploadProgressElement(
      uniqueID,
      fileName
    );
    downloadFilesContainer.append(uploadProgressElement);

    // Use FileReader to read the file content as an ArrayBuffer
    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      // Split the file content into chunks and upload each chunk
      const CHUNK_SIZE = 25000;
      const chunkCount = event.target.result.byteLength / CHUNK_SIZE;

      for (let chunkId = 0; chunkId < chunkCount + 1; chunkId++) {
        const chunk = event.target.result.slice(
          chunkId * CHUNK_SIZE,
          (chunkId + 1) * CHUNK_SIZE
        );

        // Upload the chunk and update progress labels
        await uploadChunk("/upload", fileName, chunk);
        updateProgressLabels(
          uniqueID,
          Math.round((chunkId * 100) / chunkCount)
        );

        // Remove the progress element after completion
        if (chunkId === chunkCount) {
          setTimeout(
            () => downloadFilesContainer.removeChild(uploadProgressElement),
            2000
          );
        }
      }
    };

    // Read the file as an ArrayBuffer
    fileReader.readAsArrayBuffer(theFile);
  }
});

// Function to create the HTML element for upload progress
function createUploadProgressElement(uniqueID, fileName) {
  const uploadProgressElement = document.createElement("div");
  uploadProgressElement.id = `upload-progress-container-${uniqueID}`;
  uploadProgressElement.innerHTML = `
  <div class="row" style="background-color: greenyellow">
    <div class="col-4 d-flex justify-content-center align-items-center">
      <p style="margin: 0">${fileName}</p>
    </div>
    <div class="col-8 d-flex justify-content-center align-items-center">
      <label id="upload-progress-label-${uniqueID}" class="me-3" for="upload-progress">0%</label>
      <progress
        id="upload-progress-${uniqueID}"
        max="100"
        value="0"
        style="height: 50px; width: 100%"
      ></progress>
    </div>
  </div>
`;
  return uploadProgressElement;
}

// Function to upload a chunk of the file
async function uploadChunk(url, fileName, chunk) {
  const data = new FormData();
  data.append("file-name", fileName);
  data.append("chunk-length", chunk.length);
  data.append("chunk", new Blob([chunk], { type: "application/octet-stream" }));

  await fetch(url, {
    method: "POST",
    body: data,
  });
}

// Function to update progress labels
function updateProgressLabels(uniqueID, progressValue) {
  const uploadProgressLabel = document.querySelector(
    `#upload-progress-label-${uniqueID}`
  );
  const uploadProgress = document.querySelector(`#upload-progress-${uniqueID}`);

  // Ensure progress values do not exceed 100%
  uploadProgressLabel.innerHTML = `${Math.min(progressValue, 100)}%`;
  uploadProgress.value = Math.min(progressValue, 100);
}
