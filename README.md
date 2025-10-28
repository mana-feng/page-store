# 📰 Newsworthy Editor

An immersive long-form multimedia article editor for creating visually rich, scrollable web stories. Design magazine-quality articles with sections, text, images, and videos, then publish directly to GitHub Pages.

---

## ✨ Features

- 🎨 **Section-Based Design** - Build articles with multiple customizable sections
- 📝 **Rich Text Editing** - TipTap editor with advanced formatting (headings, colors, drop caps)
- 🖼️ **Flexible Image Layouts** - Normal, full-width, or floating images with captions
- 🎬 **YouTube Integration** - Embed videos that work in exported HTML files
- 🌄 **Background Images** - Add parallax-like effects with section backgrounds
- 💾 **Dual Storage** - Local SQLite database + GitHub Pages integration
- 👁️ **Live Preview** - See exactly how your article will look
- 🚀 **One-Click Publishing** - Deploy to GitHub Pages instantly
- 🔒 **Secure** - AES-256 encrypted token storage

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20.19.0+ or v22.12.0+
- **npm**: v10.9.2+
- **GitHub Account** (for publishing content)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd capstone-project-25t3-9900-h18e-almond-functions
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd "Newsworthy Editor"
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Starting the Application

#### Windows Users
Double-click the `start-servers.bat` file in the project root to automatically start both services.

#### macOS/Linux Users
```bash
chmod +x start-servers.sh
./start-servers.sh
```

#### Stopping the Servers

If you need to stop all running servers (useful when ports are already in use):

**Windows:**
```batch
# Double-click stop-servers.bat
# Or run in terminal:
stop-servers.bat
```

**macOS/Linux/Git Bash:**
```bash
chmod +x stop-servers.sh
./stop-servers.sh
```

The stop script will automatically find and terminate processes using ports:
- `5173` - Frontend Vite Dev Server
- `5174` - Frontend HMR
- `3001` - Backend API Server

#### Manual Start

**Option 1: Two Terminals (Recommended)**

Terminal 1 - Frontend:
```bash
cd "Newsworthy Editor"
npm run dev
```

Terminal 2 - Backend:
```bash
cd "Newsworthy Editor/backend"
npm start
```

**Option 2: PowerShell (Windows)**
```powershell
# Frontend
cd "Newsworthy Editor"; npm run dev

# In another terminal/window
cd "Newsworthy Editor\backend"; npm start
```

**Option 3: Bash (macOS/Linux)**
```bash
# Frontend
cd "Newsworthy Editor" && npm run dev

# In another terminal
cd "Newsworthy Editor/backend" && npm start
```

Once started successfully:
- **Frontend**: http://localhost:5173 (or 5174 if 5173 is in use)
- **Backend**: http://localhost:3001

---

## ⚙️ Initial Configuration

### Step 1: Configure GitHub Settings

1. **Open Settings Panel**
   - Click the **⚙️ Settings** button in the sidebar

2. **Get GitHub Personal Access Token**
   - Visit https://github.com/settings/tokens
   - Click **Generate new token (classic)**
   - Select permissions:
     - ✅ `repo` (Full repository access)
     - ✅ `workflow` (Optional, for triggering GitHub Actions)
   - Click **Generate token**
   - **Copy the token immediately** (shown only once)

3. **Fill in Settings**
   ```
   GitHub Token: ghp_xxxxxxxxxxxxxxxxxxxx (the token you just copied)
   GitHub Username: your-username
   Repository Name: your-repo-name
   Branch: main (or gh-pages)
   Base URL: https://your-username.github.io/your-repo-name
   ```

4. **Test Connection**
   - Click the **Test Connection** button
   - Confirm "✅ Connection successful" is displayed

5. **Save Configuration**
   - Click **Save Settings**

### Step 2: Enable GitHub Pages

1. Visit your GitHub repository
2. Go to **Settings** → **Pages**
3. Configure:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or your configured branch)
   - **Folder**: `/ (root)`
4. Click **Save**

Configuration complete! 🎉

---

## 📝 How to Use

### 🏗️ Building Your Article

#### 1. Create Sections
- Click **+ Add New Section** in the sidebar
- Sections are the building blocks of your article
- Each section can have:
  - Custom background (solid color or image)
  - Custom height
  - Multiple content blocks

#### 2. Section Settings
Click on any section to customize:
- **Background Type**: Choose color or image
- **Background Color**: Pick from color palette
- **Background Image**: Upload image for parallax effects
- **Height**: Adjust section height in pixels

#### 3. Add Content Blocks

**Text Block** 📝
- Click **+ Add Text Block**
- Rich text editor with formatting options:
  - Headings (H1-H6)
  - Bold, Italic, alignment
  - Text color and font size
  - Drop cap effects
  - Custom text width (for readability)

**Image Block** 🖼️
- Click **+ Add Image Block**
- Choose image type:
  - **Normal**: Standard image with caption
  - **Full Width**: Spans entire section width
  - **Float & Text**: Image with text wrapping around it
- Add images via URL or upload
- Customize:
  - Width and height
  - Caption position (below/right/bubble)
  - Caption animation
  - Aspect ratio lock

**Video Block** 🎬
- Click **+ Add Video Block**
- Paste YouTube URL (supports multiple formats)
- Video embeds directly in article
- Smart export: works in downloaded HTML files

---

### 🎨 Content Editing

#### Text Formatting
Select text in any text block to access:
- **Font Size**: Change text size
- **Text Color**: Choose from color picker
- **Alignment**: Left/Center alignment
- **Drop Cap**: Create magazine-style first letter
- **Text Width**: Control line length for readability

#### Image Customization
Select any image block to adjust:
- Dimensions (width × height)
- Caption text and position
- Aspect ratio preservation
- Float direction (for float-image type)

#### Video Settings
Select video block to modify:
- Video dimensions
- YouTube video ID

---

### 💾 Saving & Publishing

#### Save to GitHub Pages 🚀
1. Click **🚀 Save to GitHub Pages** in sidebar
2. Enter filename (e.g., `my-article.html`)
3. Confirm to publish
4. Article appears at: `https://[username].github.io/[repo]/[filename].html`

#### Storage Manager 📚
Manage all your articles:
- **View all saved articles**
- **Load** previous work
- **Rename** articles
- **Delete** unwanted articles
- **Pull from GitHub** to sync remote content

---

### 👁️ Preview & Export

#### Live Preview
- Click **Preview** button in header
- See exactly how your article will look
- Press `ESC` to exit preview

#### Export Features
- Articles export as standalone HTML files
- Includes all styling and content
- YouTube videos work offline (smart fallback)
- See `HOW_TO_VIEW_EXPORTED_HTML.md` for details

---

## 🎯 Key Capabilities

### Section Customization
- **Background Type**: Solid colors or images
- **Custom Heights**: Control section dimensions
- **Visual Separation**: Each section is distinct and customizable
- **Unlimited Sections**: Build articles as long as you need

### Advanced Text Features
- **Rich Formatting**: Bold, italic, headings (H1-H6)
- **Typography Control**: Font size, text color, font family
- **Drop Caps**: Magazine-style first letter effects
- **Text Width Control**: Adjust line length (measured in `ch` units)
- **Alignment**: Left and center text alignment

### Image Block Types

**1. Normal Image Block**
- Standard images with flexible sizing
- Multiple caption positions (below/right/bubble)
- Animated caption effects
- Aspect ratio lock option

**2. Full-Width Image Block**
- Spans entire section width
- Two modes: auto-height or fixed-height
- Perfect for hero images and dividers

**3. Float Image Block**
- Text wraps around the image
- Float left or right
- Adjustable width percentage
- Great for magazine-style layouts

### Video Integration
- **YouTube Embeds**: Paste any YouTube URL
- **Format Support**: Standard, shorts, live, embed URLs
- **Smart Export**: Videos work in offline HTML files
- **Responsive**: Auto-adjusts to screen size

---

## 📂 Project Structure

```
capstone-project-25t3-9900-h18e-almond-functions/
├── Newsworthy Editor/           # Main application
│   ├── src/                     # Frontend source code
│   │   ├── components/          # Vue components
│   │   ├── stores/              # Pinia state management
│   │   └── utils/               # Utility functions
│   ├── backend/                 # Backend API server
│   │   ├── server.js            # Express server
│   │   ├── database.js          # SQLite operations
│   │   ├── github.js            # GitHub API integration
│   │   ├── config-store.js      # Settings storage
│   │   ├── crypto-utils.js      # Token encryption
│   │   └── database.sqlite      # Local data storage
│   └── public/                  # Static assets
├── start-servers.bat            # Windows startup script
├── start-servers.sh             # macOS/Linux startup script
└── README.md                    # This file
```

---

## 🔧 Technology Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TipTap** - Rich text editor based on ProseMirror
- **Pinia** - State management
- **Vite** - Fast build tool

### Backend
- **Express** - Web framework for Node.js
- **Better-SQLite3** - Fast, synchronous SQLite database
- **Octokit** - GitHub REST API client
- **Multer** - File upload handling

---

## ❓ FAQ

### Publishing & GitHub

**Q: Page not showing after publishing?**  
A: Wait 1-2 minutes for GitHub Pages to build. Check if GitHub Pages is enabled in your repository settings.

**Q: How to modify a published page?**  
A: Click Edit in Storage Manager, make your changes, then click Publish to GitHub again.

**Q: What if my GitHub token expires?**  
A: Generate a new token at https://github.com/settings/tokens, then update it in the Settings panel.

### Content & Media

**Q: Can I upload images?**  
A: Yes. Click the image button in the editor toolbar and select a local file or paste an image URL.

**Q: How do YouTube videos work in exported HTML files?**  
A: The exported HTML includes smart video handling:
- **Direct opening (double-click)**: Click video thumbnail → Opens YouTube in new tab
- **Web server mode**: Click thumbnail → Plays embedded in page

**Q: What video formats are supported?**  
A: Currently only YouTube videos. Supported URL formats:
- Standard: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short link: `https://youtu.be/VIDEO_ID`
- Shorts: `https://www.youtube.com/shorts/VIDEO_ID`
- Live: `https://www.youtube.com/live/VIDEO_ID`
- Embed: `https://www.youtube.com/embed/VIDEO_ID`

### Technical

**Q: Port already in use?**  
A: The startup script will automatically detect port conflicts. You can manually kill the process or let Vite use an alternative port.

**Q: How to backup my content?**  
A: Content is automatically saved in two places:
- **GitHub repository** (online, version controlled)
- **Local database** (`backend/database.sqlite` - backup this file regularly)

**Q: Can I use this without GitHub?**  
A: Yes, you can use the editor and save locally. However, publishing and sharing features require GitHub integration.

---

## 🔒 Security & Privacy

- ✅ **Encrypted Storage**: GitHub tokens are stored with AES-256 encryption
- ✅ **Local-First**: All data is saved locally, nothing sent to third parties
- ✅ **No Tracking**: No analytics or user tracking
- ⚠️ **Token Safety**: Never share your GitHub token with anyone
- ⚠️ **Token Leaked?**: Immediately revoke it on GitHub and generate a new one
- 🔄 **Regular Updates**: Update your GitHub token periodically for security

---

## 📝 License

This project is part of a capstone project for educational purposes.

---

## 🤝 Contributing

This is an academic project. For issues or suggestions:
1. Check existing documentation
2. Review the FAQ section
3. Contact the development team

---

**Last Updated**: October 28, 2025  
**Version**: 0.0.0  
**Course**: COMP9900
