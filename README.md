# 🗞️ Newsworthy Editor - Complete Guide

> **Visual content editor with GitHub Pages integration**

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Prerequisites](#-prerequisites)
3. [Installation](#-installation)
4. [Starting the Application](#-starting-the-application)
5. [GitHub Configuration](#-github-configuration)
6. [Backend Setup](#-backend-setup)
7. [Platform-Specific Instructions](#-platform-specific-instructions)
8. [Features](#-features)
9. [Troubleshooting](#-troubleshooting)
10. [API Documentation](#-api-documentation)

---

## 🚀 Quick Start

**The fastest way to get started (Windows):**

1. **Double-click** `start-servers.bat` ⭐
2. Wait 10-15 seconds
3. Open browser to **http://localhost:5173**
4. Configure GitHub settings (see [GitHub Configuration](#-github-configuration))
5. Start creating!

---

## 📦 Prerequisites

Before running the application, ensure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control) - [Download here](https://git-scm.com/)
- **GitHub Account** (for saving and publishing content)

### Check Your Installation

```bash
node --version   # Should show v16 or higher
npm --version    # Should show 8.0 or higher
```

---

## 💿 Installation

The startup scripts will automatically install dependencies, but you can manually install them:

### Backend Dependencies

```bash
cd "Newsworthy Editor/backend"
npm install
cd ../..
```

### Frontend Dependencies

```bash
cd "Newsworthy Editor"
npm install
cd ..
```

---

## 🎯 Starting the Application

### Windows

#### Method 1: Double-Click (Recommended) ⭐

1. Find `start-servers.bat` in the project root
2. **Double-click** it
3. Two terminal windows will open:
   - Backend Server (Port 3001)
   - Frontend Server (Port 5173)
4. Done! ✅

#### Method 2: Command Prompt / PowerShell

```cmd
start-servers.bat
```

### macOS / Linux

```bash
# First time only: Make script executable
chmod +x start-servers.sh

# Run the script
./start-servers.sh
```

### Manual Startup (All Platforms)

If the scripts don't work, start servers manually:

**Terminal 1 - Backend:**
```bash
cd "Newsworthy Editor/backend"
npm start
```

**Terminal 2 - Frontend:**
```bash
cd "Newsworthy Editor"
npm run dev
```

---

## 🔧 GitHub Configuration

The Newsworthy Editor uses GitHub Pages to save and publish your content. You **must** configure GitHub integration to save your work.

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click **+** (top right) → **New repository**
3. Repository settings:
   - **Name**: `my-newsworthy-pages` (or any name)
   - **Visibility**: **Public** (required for GitHub Pages)
   - **Initialize**: No need to add README or .gitignore
4. Click **Create repository**

### Step 2: Enable GitHub Pages

1. Go to repository **Settings**
2. Click **Pages** in the left sidebar
3. Under **Source**:
   - **Branch**: Select `gh-pages` or `main`
   - **Folder**: `/ (root)`
4. Click **Save**
5. **Note your GitHub Pages URL**: 
   - Format: `https://[username].github.io/[repo-name]`
   - Example: `https://johndoe.github.io/my-newsworthy-pages`

### Step 3: Create Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Configuration:
   - **Note**: "Newsworthy Editor"
   - **Expiration**: 90 days or No expiration
   - **Scopes**: Check ✅ **repo** (Full control of private repositories)
     - This includes all sub-scopes: `repo:status`, `repo_deployment`, `public_repo`, etc.
4. Click **Generate token**
5. **⚠️ CRITICAL**: Copy the token immediately (starts with `ghp_...`)
   - You won't be able to see it again!
   - Save it in a secure location

### Step 4: Configure in Newsworthy Editor

1. Open **http://localhost:5173** in your browser
2. Click **⚙️ Settings** button in the sidebar
3. Fill in the configuration form:
   
   ```
   GitHub Personal Access Token: ghp_xxxxxxxxxxxxxxxxxxxx
   Repository Owner: your-github-username
   Repository Name: my-newsworthy-pages
   Branch: gh-pages (or main)
   Base URL: https://your-username.github.io/my-newsworthy-pages
   ```

4. Click **🧪 Test Connection** to verify settings
5. If successful, click **💾 Save Settings**

### GitHub Configuration Example

```yaml
GitHub Token: ghp_1234567890abcdefghijklmnopqrstuvwxyz
Owner: johndoe
Repository: my-newsworthy-pages
Branch: gh-pages
Base URL: https://johndoe.github.io/my-newsworthy-pages
```

Your published pages will be available at:
- `https://johndoe.github.io/my-newsworthy-pages/page1.html`
- `https://johndoe.github.io/my-newsworthy-pages/page2.html`

---

## 🖥️ Backend Setup

The backend server is automatically started by the startup scripts. Here's what it does:

### Backend Components

- **Server**: Node.js/Express server on port 3001
- **Database**: SQLite database (`database.sqlite`)
- **GitHub Integration**: API for GitHub Pages publishing
- **Configuration Storage**: Secure storage for GitHub credentials

### Backend Endpoints

Once the backend is running, the following API endpoints are available:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/config` | GET | Retrieve GitHub configuration |
| `/api/config` | POST | Save GitHub configuration |
| `/api/config/test` | POST | Test GitHub connection |
| `/api/github/upload` | POST | Upload content to GitHub |
| `/api/github/pages` | GET | List saved pages |
| `/api/github/page/:path` | GET | Retrieve specific page |
| `/api/github/page/:path` | DELETE | Delete page |

### Backend Configuration

The backend uses the following default settings:

```javascript
PORT: 3001 (can be changed via environment variable)
DATABASE: database.sqlite
CORS: Enabled for localhost:5173
```

### Environment Variables (Optional)

Create `.env` file in `Newsworthy Editor/backend/` if you need custom settings:

```bash
PORT=3001
NODE_ENV=development
```

### Database Schema

The backend automatically creates these tables:

**config_store**: Stores GitHub configuration
```sql
- id (INTEGER PRIMARY KEY)
- key (TEXT UNIQUE)
- value (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

---

## 🌍 Platform-Specific Instructions

### Windows

#### Requirements
- Windows 10 or later
- Node.js 16+ installed
- PowerShell 5.1+ (included with Windows)

#### Starting
```cmd
start-servers.bat
```

#### Stopping
- Close terminal windows, OR
- Press `Ctrl+C` in each terminal

#### Creating Desktop Shortcut
1. Right-click `start-servers.bat`
2. Select **Create shortcut**
3. Drag shortcut to Desktop
4. Rename to "🚀 Newsworthy Editor"

#### Troubleshooting Windows
- If `.bat` won't run: Right-click → Open with → Command Prompt
- If port in use: Script will automatically prompt to kill process
- If Node.js not found: Install from [nodejs.org](https://nodejs.org/)

---

### macOS

#### Requirements
- macOS 10.14 (Mojave) or later
- Node.js 16+ installed
- Terminal (included with macOS)

#### Starting
```bash
chmod +x start-servers.sh  # First time only
./start-servers.sh
```

#### Stopping
- Press `Ctrl+C` in the terminal
- Or close the terminal window

#### Creating Alias (Optional)
Add to `~/.zshrc` or `~/.bash_profile`:
```bash
alias newsworthy='cd /path/to/project && ./start-servers.sh'
```

#### Troubleshooting macOS
- If permission denied: Run `chmod +x start-servers.sh`
- If port in use: `lsof -ti:3001 | xargs kill -9`
- Check Node.js: `brew install node` (if using Homebrew)

---

### Linux

#### Requirements
- Linux (Ubuntu 20.04+, Debian, Fedora, etc.)
- Node.js 16+ installed
- Bash shell

#### Starting
```bash
chmod +x start-servers.sh  # First time only
./start-servers.sh
```

#### Stopping
- Press `Ctrl+C` in the terminal
- Or: `killall node`

#### Installing Node.js (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Troubleshooting Linux
- If permission denied: `chmod +x start-servers.sh`
- If port in use: `sudo lsof -ti:3001 | xargs kill -9`
- Check firewall: Ensure ports 3001 and 5173 are open

---

## ✨ Features

### Content Creation
- 📝 **Visual Editor**: Rich text editing with formatting
- 🎨 **Styling**: Customizable colors, fonts, and layouts
- 📱 **Responsive**: Mobile-friendly design
- 👁️ **Preview**: Real-time preview of your content

### Storage & Publishing
- 💾 **Save Locally**: Auto-save drafts
- 🔄 **GitHub Sync**: Sync with GitHub repository
- 🌐 **GitHub Pages**: Publish directly to GitHub Pages
- 📊 **Storage Manager**: View and manage all saved pages

### Additional Features
- 🔍 **Search**: Find saved pages quickly
- 📁 **Organization**: Group pages into categories
- 🔒 **Secure**: GitHub token stored securely
- ⚡ **Fast**: Optimized performance

---

## 🛑 Stopping the Application

### Easy Method
Close the two terminal windows that were opened

### Keyboard Method
Press `Ctrl+C` in each terminal window

### Force Stop (Windows)
```powershell
# Kill backend
netstat -ano | findstr :3001
taskkill /F /PID <PID>

# Kill frontend
netstat -ano | findstr :5173
taskkill /F /PID <PID>
```

### Force Stop (macOS/Linux)
```bash
# Kill backend
lsof -ti:3001 | xargs kill -9

# Kill frontend
lsof -ti:5173 | xargs kill -9
```

---

## ❗ Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem**: Error says port 3001 or 5173 is already in use

**Solution**:
- The startup script will detect this and ask if you want to kill the process
- Choose **Yes** to automatically resolve it
- Or manually kill the process (see [Force Stop](#force-stop-windows) above)

#### 2. Node.js Not Found

**Problem**: Error says "Node.js is not installed"

**Solution**:
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install it (LTS version recommended)
3. Restart your computer
4. Verify: `node --version`

#### 3. Dependencies Not Installing

**Problem**: `npm install` fails or hangs

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

#### 4. Backend Won't Start

**Problem**: Backend server fails to start

**Possible causes**:
- Port 3001 in use → Kill the process
- Database file locked → Delete `database.sqlite` and restart
- Missing dependencies → Run `npm install` in backend folder
- Permission issues → Check folder write permissions

#### 5. Frontend Can't Connect to Backend

**Problem**: Frontend shows connection errors

**Solution**:
1. Verify backend is running: Visit `http://localhost:3001/api/health`
2. Check console for errors
3. Restart both servers
4. Check firewall settings

#### 6. GitHub Connection Failed

**Problem**: Can't connect to GitHub or save pages

**Possible causes**:
- Invalid token → Generate a new token
- Wrong repository name → Verify spelling
- Missing `repo` permission → Recreate token with correct scope
- Repository doesn't exist → Create it first
- Branch doesn't exist → Create branch or use `main`

#### 7. GitHub Pages Not Working

**Problem**: Pages not appearing on GitHub Pages

**Solution**:
1. Wait 1-2 minutes for GitHub to build pages
2. Check GitHub Pages is enabled in repository settings
3. Verify branch matches your configuration
4. Ensure repository is public
5. Check GitHub Pages URL is correct

#### 8. Slow First Startup

**Problem**: Application takes 1-2 minutes to start first time

**Explanation**: This is normal! Dependencies are being installed.
- First startup: 1-2 minutes (installing dependencies)
- Subsequent startups: 10-15 seconds

#### 9. Script Won't Run (Windows)

**Problem**: Double-clicking `.bat` does nothing

**Solution**:
1. Right-click `start-servers.bat`
2. Select **Open with** → **Command Prompt**
3. If still fails, try running from PowerShell: `.\start-servers.bat`

#### 10. Permission Denied (macOS/Linux)

**Problem**: `./start-servers.sh` shows permission denied

**Solution**:
```bash
chmod +x start-servers.sh
./start-servers.sh
```

---

## 🧪 Testing Your Setup

The startup scripts automatically verify your environment before starting the servers.

### What They Check
- ✅ Node.js installation (v16 or higher)
- ✅ npm installation
- ✅ Project directories exist
- ✅ package.json files present
- ✅ Ports 3001 and 5173 available
- ✅ Dependencies installed

### Expected Output
```
✅ [OK] Node.js installed (v18.x.x)
✅ PASS: npm installed (9.x.x)
✅ PASS: Frontend directory exists
✅ PASS: Backend directory exists
✅ PASS: Frontend package.json found
✅ PASS: Backend package.json found
✅ PASS: Port 3001 is available
✅ PASS: Port 5173 is available
✅ PASS: Write permissions OK

🎉 All tests passed! You're ready to start.
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T10:30:00.000Z"
}
```

#### Get Configuration
```http
GET /api/config
```

**Response:**
```json
{
  "githubToken": "ghp_***",
  "owner": "johndoe",
  "repo": "my-newsworthy-pages",
  "branch": "gh-pages",
  "baseUrl": "https://johndoe.github.io/my-newsworthy-pages"
}
```

#### Save Configuration
```http
POST /api/config
Content-Type: application/json

{
  "githubToken": "ghp_xxxxxxxxxxxx",
  "owner": "johndoe",
  "repo": "my-newsworthy-pages",
  "branch": "gh-pages",
  "baseUrl": "https://johndoe.github.io/my-newsworthy-pages"
}
```

#### Test GitHub Connection
```http
POST /api/config/test
Content-Type: application/json

{
  "githubToken": "ghp_xxxxxxxxxxxx",
  "owner": "johndoe",
  "repo": "my-newsworthy-pages"
}
```

#### Upload to GitHub Pages
```http
POST /api/github/upload
Content-Type: application/json

{
  "filename": "my-article.html",
  "content": "<html>...</html>",
  "title": "My Article"
}
```

#### List Saved Pages
```http
GET /api/github/pages
```

**Response:**
```json
[
  {
    "name": "article1.html",
    "path": "article1.html",
    "url": "https://username.github.io/repo/article1.html",
    "sha": "abc123...",
    "size": 1024
  }
]
```

---

## 📖 Usage Guide

### Creating Your First Page

1. **Start the application** (double-click `start-servers.bat`)
2. **Open browser** to http://localhost:5173
3. **Configure GitHub** (Settings → Enter GitHub details → Test → Save)
4. **Create content**:
   - Use the visual editor to write content
   - Add text, images, and formatting
   - Preview your work in real-time
5. **Save to GitHub Pages**:
   - Click **🚀 Save to GitHub Pages**
   - Enter page title and filename
   - Click **Save**
   - URL is automatically copied to clipboard
6. **View published page**:
   - Paste URL in browser
   - Wait 1-2 minutes for GitHub Pages to build
   - Your page is live!

### Managing Pages

1. Click **📚 Storage Manager** in sidebar
2. View all your saved pages
3. Actions available:
   - **View**: Open page in editor
   - **Edit**: Modify existing page
   - **Delete**: Remove page from GitHub
   - **Copy URL**: Copy page URL to clipboard

---

## 🔒 Security Notes

- **GitHub Token**: Stored securely in local SQLite database
- **Token Privacy**: Token never sent to frontend or exposed in logs
- **HTTPS**: All GitHub API calls use HTTPS encryption
- **Token Revocation**: You can revoke tokens anytime from GitHub settings
- **Local Only**: Backend database stays on your machine

### Best Practices

1. **Never share** your GitHub token with anyone
2. **Set expiration** on tokens (90 days recommended)
3. **Use dedicated repositories** for Newsworthy content
4. **Revoke tokens** when no longer needed
5. **Keep backups** of important content

---

## 📊 Server Information

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Frontend** | 5173 | http://localhost:5173 | Main application UI |
| **Backend API** | 3001 | http://localhost:3001 | REST API server |
| **API Health** | 3001 | http://localhost:3001/api/health | Health check endpoint |
| **Vue DevTools** | 5173 | http://localhost:5173/__devtools__/ | Vue debugging tools |

---

## 🎓 Tips & Best Practices

### Performance
- Keep terminal windows open between sessions for faster restart
- Use `Ctrl+C` then restart instead of closing terminals
- Clear browser cache if pages don't update

### Workflow
1. Start servers once per work session
2. Configure GitHub once (settings persist)
3. Create and save multiple pages in one session
4. Stop servers when done working

### Content Management
- Use descriptive filenames (`article-2025-10-27.html`)
- Save drafts frequently
- Preview before publishing
- Test on mobile devices

### Troubleshooting
- Check backend health: http://localhost:3001/api/health
- Check browser console for frontend errors
- Check terminal output for backend errors
- Restart both servers to diagnose issues

---

## 🔄 Updating the Application

To update to the latest version:

```bash
# Update frontend dependencies
cd "Newsworthy Editor"
npm update
cd ..

# Update backend dependencies
cd "Newsworthy Editor/backend"
npm update
cd ../..
```

---

## 🆘 Getting Help

### Documentation
- **This file**: Complete reference guide
- **Quick Start**: See [Quick Start](#-quick-start) section above
- **API Docs**: See [API Documentation](#-api-documentation) section above

### Common Commands
```bash
# Start (Windows)
start-servers.bat

# Start (macOS/Linux)
./start-servers.sh

# Stop
[Ctrl+C in terminal windows]
```

---

## 📝 Project Structure

```
capstone-project-25t3-9900-h18e-almond-main/
│
├── 🚀 Startup Scripts
│   ├── start-servers.bat        # Windows (double-click this!)
│   └── start-servers.sh         # macOS/Linux
│
├── 📖 Documentation
│   └── README.md                # This file
│
└── 📁 Newsworthy Editor/
    │
    ├── 🎨 Frontend
    │   ├── src/
    │   │   ├── components/      # Vue components
    │   │   ├── stores/          # State management
    │   │   ├── assets/          # Styles
    │   │   ├── App.vue          # Main app
    │   │   └── main.js          # Entry point
    │   ├── public/
    │   ├── index.html
    │   ├── package.json
    │   └── vite.config.js
    │
    └── 🖥️ Backend
        ├── server.js            # Express server
        ├── database.js          # SQLite database
        ├── github.js            # GitHub API integration
        ├── config-store.js      # Configuration management
        ├── database.sqlite      # SQLite database file
        └── package.json
```

---

## 🎉 You're Ready!

Everything you need to know is in this guide. Here's your next step:

### Quick Start Reminder
1. **Double-click** `start-servers.bat` (Windows) or run `./start-servers.sh` (macOS/Linux)
2. **Open** http://localhost:5173
3. **Configure** GitHub settings
4. **Start creating!**

---

## 📜 Version Information

- **Version**: 1.0.0
- **Last Updated**: 2025-10-27
- **Status**: Production Ready
- **Platform Support**: Windows, macOS, Linux
- **Node.js**: 16+ required
- **License**: MIT (if applicable)

---

**Made with ❤️ for content creators**

*For issues, questions, or contributions, please refer to the project repository.*
