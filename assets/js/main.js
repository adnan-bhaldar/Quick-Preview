document.addEventListener('DOMContentLoaded', () => {
            const fileInput = document.getElementById('file-input');
            const dropZone = document.querySelector('.drop-zone');
            const previewContainer = document.getElementById('preview-container');
            const fileInfo = document.getElementById('file-info');
            const fileNameSpan = document.getElementById('file-name');
            const fileTypeSpan = document.getElementById('file-type');
            const fileSizeSpan = document.getElementById('file-size');
            const themeToggleBtn = document.getElementById('theme-toggle');
            const body = document.body;
            const moonIcon = document.getElementById('moon-icon');
            const sunIcon = document.getElementById('sun-icon');

            // Get the new remove button element
            const removeFileBtn = document.getElementById("remove-file-btn");
            // Save the initial placeholder HTML to easily reset the preview area
            const placeholderHTML = previewContainer.innerHTML;
            
            // Check for saved theme preference or system preference on load
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                body.className = savedTheme;
            } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                body.className = 'light-mode';
            }
            updateThemeIcons();
            
            function updateThemeIcons() {
                if (body.classList.contains('light-mode')) {
                    moonIcon.classList.remove('hidden');
                    sunIcon.classList.add('hidden');
                } else {
                    moonIcon.classList.add('hidden');
                    sunIcon.classList.remove('hidden');
                }
            }
            
            themeToggleBtn.addEventListener('click', () => {
                if (body.classList.contains('light-mode')) {
                    body.classList.remove('light-mode');
                    localStorage.setItem('theme', 'dark-mode');
                } else {
                    body.classList.add('light-mode');
                    localStorage.setItem('theme', 'light-mode');
                }
                updateThemeIcons();
            });

            // Show a temporary message to the user
            const showMessage = (message, isError = false) => {
                const existingMessage = document.querySelector('.message-box');
                if (existingMessage) existingMessage.remove();
                
                const messageBox = document.createElement('div');
                messageBox.className = `message-box ${isError ? 'bg-red-400 text-red-900' : 'bg-green-400 text-green-900'}`;
                messageBox.textContent = message;
                document.body.appendChild(messageBox);
                
                setTimeout(() => {
                    messageBox.remove();
                }, 3000);
            };

            // Event listener for file input change
            fileInput.addEventListener('change', (e) => {
                handleFile(e.target.files[0]);
            });

            // Event listeners for drag and drop functionality
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('active');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('active');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('active');
                handleFile(e.dataTransfer.files[0]);
                showMessage('File loaded successfully!');
            });

            // Handle the selected file
            const handleFile = (file) => {
    if (!file) return;

    // Get the file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Display file info
    fileNameSpan.textContent = file.name;
    fileTypeSpan.textContent = file.type || 'Unknown';
    fileSizeSpan.textContent = formatBytes(file.size);
    fileInfo.classList.remove('hidden');

    // Show the remove button once a file is loaded
    removeFileBtn.classList.remove("hidden");

    const reader = new FileReader();
    reader.onload = (e) => {
        const fileContent = e.target.result;
        const fileType = file.type;
        const fileName = file.name;

        previewContainer.innerHTML = ''; // Clear previous preview
        let previewElement;

        if (fileType.startsWith('image/')) {
            previewElement = document.createElement('img');
            previewElement.src = fileContent;
            previewElement.alt = 'Image Preview';
            previewElement.className = 'rounded-lg max-w-full max-h-full object-contain';
        } else if (fileType.startsWith('video/')) {
            previewElement = document.createElement('video');
            previewElement.src = fileContent;
            previewElement.controls = true;
            previewElement.className = 'rounded-lg max-w-full max-h-full object-contain';
        } else if (fileType.startsWith('audio/')) {
            previewElement = document.createElement('audio');
            previewElement.src = fileContent;
            previewElement.controls = true;
            previewElement.className = 'w-full';
        } else if (fileType === 'application/pdf') {
            previewElement = document.createElement('iframe');
            previewElement.src = fileContent;
            previewElement.title = 'PDF Preview';
            previewElement.className = 'w-full h-full';
        } else if (
            // Check file type or a list of specific text file extensions
            fileType.startsWith('text/') || 
            fileType === 'application/json' || 
            fileType === 'application/xml' ||
            ['lrc', 'srt', 'txt'].includes(fileExtension)
        ) {
            // Read as text and display in a <pre> tag
            previewElement = document.createElement('pre');
            previewElement.textContent = fileContent;
            previewElement.className = 'preview-content w-full h-full p-4 overflow-auto rounded-lg bg-gray-800 text-white';
        } else if (
            fileType.includes('octet-stream') || 
            fileType.includes('msdownload') || 
            fileName.endsWith('.exe')) {
            // Handle executable and unknown binary file types
            previewContainer.innerHTML = `<p class="text-red-400">For security, executable files cannot be previewed.</p>`;
            showMessage('Executable files cannot be previewed.', true);
            return;
        } else {
            previewContainer.innerHTML = `<p class="text-red-400">Unsupported file type: <span class="font-bold">${file.type || fileExtension}</span></p>`;
            showMessage('Unsupported file type. Please try another file.', true);
            return;
        }
        
        previewContainer.appendChild(previewElement);
    };

    // Determine how to read the file based on its type or extension
    if (
        file.type.startsWith('text/') || 
        file.type === 'application/json' || 
        file.type === 'application/xml' ||
        ['lrc', 'srt', 'txt'].includes(fileExtension)
    ) {
        reader.readAsText(file);
    } else {
        reader.readAsDataURL(file);
    }
};

            // This event listener is now correctly placed inside the DOMContentLoaded block
            removeFileBtn.addEventListener("click", () => {
                // Restore the preview area to its original state
                previewContainer.innerHTML = placeholderHTML;

                // Hide the file info card
                fileInfo.classList.add("hidden");

                // Hide the remove button itself
                removeFileBtn.classList.add("hidden");
            });

            // Helper function to format file size
            const formatBytes = (bytes, decimals = 2) => {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const dm = decimals < 0 ? 0 : decimals;
                const sizes = [
                    'Bytes', 
                    'KB', 
                    'MB', 
                    'GB', 
                    'TB', 
                    'PB', 
                    'EB', 
                    'ZB', 
                    'YB',
                ];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return (
                    parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
                );
            };
        });