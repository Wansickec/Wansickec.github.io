document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addBindBtn = document.getElementById('addBind');
    const copyAllBtn = document.getElementById('copyAll');
    const helpBtn = document.getElementById('helpBtn');
    const modal = document.getElementById('helpModal');
    const closeBtn = document.querySelector('.close');
    const bindsContainer = document.getElementById('bindsContainer');
    
    let binds = JSON.parse(localStorage.getItem('cs2Binds')) || [];

    // Initialize the app
    function init() {
        renderBinds();
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        addBindBtn.addEventListener('click', addBind);
        copyAllBtn.addEventListener('click', copyAllBinds);
        helpBtn.addEventListener('click', () => modal.style.display = 'flex');
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        
        // Close modal when clicking outside of it
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Add a new bind
    function addBind() {
        const keyInput = document.getElementById('key');
        const commandInput = document.getElementById('command');
        const descriptionInput = document.getElementById('description');

        const key = keyInput.value.trim();
        const command = commandInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!key || !command) {
            alert('Please fill in both Key and Command fields');
            return;
        }

        const bind = {
            id: Date.now().toString(),
            key: key.toLowerCase(),
            command,
            description: description || 'No description'
        };

        binds.push(bind);
        saveBinds();
        renderBinds();

        // Clear inputs
        keyInput.value = '';
        commandInput.value = '';
        descriptionInput.value = '';
        keyInput.focus();
    }

    // Render all binds
    function renderBinds() {
        if (binds.length === 0) {
            bindsContainer.innerHTML = '<p>No binds created yet. Add your first bind above!</p>';
            return;
        }

        bindsContainer.innerHTML = '';
        
        binds.forEach((bind, index) => {
            const bindElement = document.createElement('div');
            bindElement.className = 'bind-item';
            bindElement.innerHTML = `
                <h3>Bind #${index + 1}: ${bind.key}</h3>
                <p><strong>Command:</strong> ${bind.command}</p>
                <p><strong>Description:</strong> ${bind.description}</p>
                <div class="bind-actions">
                    <button onclick="editBind('${bind.id}')" class="edit-btn">Edit</button>
                    <button onclick="deleteBind('${bind.id}')" class="delete-btn">Delete</button>
                    <button onclick="copyBind('${bind.id}')" class="copy-btn">Copy</button>
                </div>
                <p class="bind-command">bind "${bind.key}" "${bind.command}"</p>
            `;
            bindsContainer.appendChild(bindElement);
        });
    }

    // Save binds to localStorage
    function saveBinds() {
        localStorage.setItem('cs2Binds', JSON.stringify(binds));
    }

    // Delete a bind
    function deleteBind(id) {
        if (confirm('Are you sure you want to delete this bind?')) {
            binds = binds.filter(bind => bind.id !== id);
            saveBinds();
            renderBinds();
        }
    }

    // Edit a bind
    function editBind(id) {
        const bind = binds.find(b => b.id === id);
        if (!bind) return;

        const newKey = prompt('Enter new key:', bind.key);
        if (newKey === null) return;

        const newCommand = prompt('Enter new command:', bind.command);
        if (newCommand === null) return;

        const newDescription = prompt('Enter new description:', bind.description);
        
        bind.key = newKey.trim().toLowerCase();
        bind.command = newCommand.trim();
        bind.description = newDescription ? newDescription.trim() : 'No description';
        
        saveBinds();
        renderBinds();
    }

    // Copy a single bind to clipboard
    function copyBind(id) {
        const bind = binds.find(b => b.id === id);
        if (!bind) return;

        const command = `bind "${bind.key}" "${bind.command}"`;
        navigator.clipboard.writeText(command).then(() => {
            alert('Bind copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            prompt('Copy this command:', command);
        });
    }

    // Copy all binds to clipboard
    function copyAllBinds() {
        if (binds.length === 0) {
            alert('No binds to copy!');
            return;
        }

        const allBinds = binds.map(bind => `bind "${bind.key}" "${bind.command}"`).join('\n');
        
        navigator.clipboard.writeText(allBinds).then(() => {
            alert('All binds copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            prompt('Copy these commands:', allBinds);
        });
    }

    // Make functions globally available
    window.deleteBind = deleteBind;
    window.editBind = editBind;
    window.copyBind = copyBind;

    // Initialize the app
    init();
});
