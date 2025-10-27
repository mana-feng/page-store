# 📰 Newsworthy Editor

A simple and easy-to-use web content editor with visual editing and one-click publishing to GitHub Pages.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20.19.0+ or v22.12.0+
- **npm**: v10.9.2+
- **GitHub Account** (for publishing content)

### Starting the Application

#### Windows Users
Double-click the `start-servers.bat` file to automatically start both frontend and backend services.

#### macOS/Linux Users
```bash
chmod +x start-servers.sh
./start-servers.sh
```

Once started successfully:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## ⚙️ Initial Configuration

### Step 1: Configure GitHub Settings

1. **Open Settings Panel**
   - Click the **Settings** button in the top right corner

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

## 📝 Feature Usage

### 1️⃣ Create a New Page

1. Click the **New Page** button in the top left
2. Enter content in the editor
3. Use the toolbar to format text:
   - **Bold/Italic/Underline**
   - **Headings** (H1-H6)
   - **Lists** (Ordered/Unordered)
   - **Links**
   - **Alignment** (Left/Center/Right/Justify)
   - **Add Images**

4. Click **Publish to GitHub** in the top right
5. Enter a filename (e.g., `my-article.html`)
6. Confirm publish

After successful publishing, the page will appear on your GitHub Pages site in 1-2 minutes.

---

### 2️⃣ Manage Published Pages

#### Open Storage Manager
Click the **Storage Manager** button to view all pages.

#### Sync Pages from GitHub
1. Click **Pull from GitHub** in Storage Manager
2. The system will automatically fetch all HTML files from the remote repository
3. Pulled pages will appear in the list

#### Edit Existing Pages
1. Click the **Edit** button for a page in Storage Manager
2. Modify the content
3. Click **Publish to GitHub** again to publish updates

#### Rename Pages
1. Click the **Rename** button in Storage Manager
2. Enter a new filename (e.g., `new-name.html`)
3. Confirm rename (will sync update to GitHub repository)

#### Delete Pages
1. Click the **Delete** button in Storage Manager
2. Confirm deletion (will delete from both local and GitHub)

---

### 3️⃣ Organize Page Groups

#### Create a Group
1. Click the **Create Group** button in Storage Manager
2. Enter a group name (e.g., `Blog Posts`, `Product Docs`)
3. Confirm creation

#### Add Pages to a Group
1. Click the **Add to Group** button for a page
2. Select the target group
3. Confirm addition

#### Manage Groups
- **View Group**: Click the group name to expand and view pages in the group
- **Delete Group**: Click the group's delete button (does not delete pages themselves)

---

### 4️⃣ View and Test

#### Local Preview
The editor displays content in real-time, what you see is what you get.

#### View Published Pages
After publishing, visit:
```
https://your-username.github.io/your-repo-name/your-file.html
```

#### Check Publishing Status
In Storage Manager, view each page's status:
- ✅ **Published**: Published to GitHub
- 📝 **Local Only**: Saved locally only
- 🔄 **Syncing**: Syncing

---

## 🛠️ Editor Toolbar Guide

| Button | Function | Shortcut |
|--------|----------|----------|
| **B** | Bold | `Ctrl+B` |
| **I** | Italic | `Ctrl+I` |
| **U** | Underline | `Ctrl+U` |
| **H1-H6** | Heading Levels | - |
| **List** | Ordered/Unordered Lists | - |
| **🔗** | Insert Link | - |
| **⬅️ ➡️** | Text Alignment | - |
| **🖼️** | Insert Image | - |
| **📄** | Add New Section | - |

---

## 📂 Data Storage

### Local Data
- **Location**: `backend/database.sqlite`
- **Contains**: Page content, group information, metadata
- **Backup**: Regular backups of this file are recommended

### GitHub Data
- **Location**: Your GitHub repository
- **Contains**: Published HTML files
- **Auto Backup**: GitHub has built-in version control

---

## ❓ FAQ

**Q: Page not showing after publishing?**  
A: Wait 1-2 minutes for GitHub Pages to build. Check if GitHub Pages is enabled.

**Q: How to modify a published page?**  
A: Click Edit in Storage Manager, modify, then Publish again.

**Q: What if my token expires?**  
A: Generate a new token on GitHub, then update it in Settings.

**Q: Can I upload images?**  
A: Yes. Use the image button in the editor, supports local upload.

**Q: Port already in use?**  
A: The startup script will automatically detect and ask if you want to terminate the process occupying the port.

**Q: How to backup my content?**  
A: Content is automatically saved in two places: GitHub (online) and local database (offline).

---

## 🔒 Security Tips

- ✅ GitHub Token is stored with encryption
- ✅ All data is saved locally, not sent to third parties
- ✅ Regularly update your GitHub Token
- ⚠️ Never share your Token
- ⚠️ If your Token is leaked, immediately delete it on GitHub and generate a new one

---

## 📞 Technical Support

For issues or suggestions, please visit the project repository to submit an Issue.

**Made with ❤️ for content creators**

---

**Last Updated**: October 27, 2025  
**Version**: 0.0.0
