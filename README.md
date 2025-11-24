<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CS2 Binds Creator</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <h1>CS2 Binds Creator</h1>
        <p>Create and manage your CS2 keybinds easily</p>
    </header>

    <main>
        <div class="container">
            <div class="bind-creator">
                <h2>Create New Bind</h2>
                <div class="form-group">
                    <label for="key">Key:</label>
                    <input type="text" id="key" placeholder="e.g., mouse4, f1, kp_enter" required>
                </div>
                <div class="form-group">
                    <label for="command">Command:</label>
                    <input type="text" id="command" placeholder="e.g., buy ak47; buy m4a1" required>
                </div>
                <div class="form-group">
                    <label for="description">Description (optional):</label>
                    <input type="text" id="description" placeholder="What does this bind do?">
                </div>
                <button id="addBind">Add Bind</button>
            </div>

            <div class="binds-list">
                <h2>Your Binds</h2>
                <div id="bindsContainer"></div>
                <button id="copyAll" class="copy-btn">Copy All Binds to Clipboard</button>
            </div>
        </div>
    </main>

    <div class="modal" id="helpModal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>How to Use</h2>
            <p>1. Enter a key (e.g., mouse4, f1, kp_enter)</p>
            <p>2. Enter the console command(s) you want to bind</p>
            <p>3. Add a description (optional)</p>
            <p>4. Click "Add Bind" to add it to your list</p>
            <p>5. Use "Copy All Binds" to copy all commands to your clipboard</p>
            <h3>Common Commands:</h3>
            <ul>
                <li><code>buy ak47; buy m4a1</code> - Buy rifle</li>
                <li><code>buy awp</code> - Buy AWP</li>
                <li><code>buy vesthelm; buy defuser</code> - Buy armor + defuse kit</li>
                <li><code>say_team Enemy spotted at A!</code> - Quick chat message</li>
            </ul>
        </div>
    </div>

    <footer>
        <button id="helpBtn" class="help-btn">Help</button>
        <p>CS2 Binds Creator &copy; 2025</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
