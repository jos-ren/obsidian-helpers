# Obsidian Setup Documentation

This repository contains custom scripts and CSS snippets to enhance my Obsidian workflow, particularly focused on bullet journaling and visual improvements.

## 📋 Scripts

### `migrateTasks.js` - Bullet Journal Task Migration
**Purpose**: Automatically migrates incomplete tasks from your most recent daily note to today's note.

**Features**:
- Finds the most recent daily note (YYYYMMDD format)
- Extracts incomplete tasks (`[ ]`, `[/]`, `[<]`) from the `## Tasks` section
- Marks original tasks as forwarded (`[>]`) 
- Links notes created on the same day to the `## Associated Docs` section
- Preserves nested task structure and formatting

**Setup**:
1. Place in your Templater scripts folder
2. Enable in Templater settings
3. Use `<%* tR += await tp.user.migrateTasks() %>` in your daily note template

**How it works**: When creating a new daily note, the script runs automatically and copies unfinished work from your previous day while maintaining bullet journal principles.

### `renamer.py` - Daily Note Format Converter
**Purpose**: Converts daily note filenames from `YYYY-MM-DD.md` to `YYYYMMDD.md` format.

**Features**:
- Bulk renames all daily notes in your vault
- Dry-run mode to preview changes
- Handles subdirectories and existing file conflicts
- Detailed summary reporting

**Usage**:
```python
# Dry run to preview changes
result = rename_daily_notes(VAULT_PATH, dry_run=True)

# Actually rename files
result = rename_daily_notes(VAULT_PATH, dry_run=False)
```

### `tree_indexer.py` - Vault Structure Generator
**Purpose**: Generates a tree-view of your Obsidian vault structure for documentation.

**Features**:
- Shows folder hierarchy with file counts
- Filters to only display `.md` files
- Option to show/hide empty folders
- Clean tree formatting with emojis

**Usage**: Run the script and it will output a formatted tree structure of your vault that you can copy for documentation purposes.

## 🎨 CSS Snippets

### `auto-center-images.css` - Image Alignment
**Purpose**: Automatically centers all images in your notes with options for left/right alignment.

**Features**:
- Default: Centers all images
- `|left` in alt text: Left-aligns image
- `|right` in alt text: Right-aligns image
- Works in both preview and source modes

**Usage**: 
```markdown
![[image.png]]           # Centered
![[image.png|left]]      # Left-aligned
![[image.png|right]]     # Right-aligned
```

### `coloured-sidebar-images.css` - Colored Folder System
**Purpose**: Color-codes folders in the sidebar based on numbered prefixes.

**Features**:
- 8 predefined color schemes (00-07, 99)
- Automatic light/dark theme adaptation
- Colors folder icons, backgrounds, and child files
- Customizable color variables

**Usage**: Name your folders with prefixes like:
- `00 - Maps of Content` (mint color)
- `01 - Projects` (cyan color)
- `02 - Areas` (light blue color)
- etc.

### `hide-add-property.css` - Clean Properties View
**Purpose**: Hides the "Add Property" button in the properties panel for a cleaner interface.

**Features**:
- Removes clutter from properties panel
- Maintains all existing property functionality
- Clean, minimal appearance

## 📝 Templates

### `Daily Template.md` - Automated Daily Note
**Purpose**: Template for daily notes with automatic task migration and consistent structure.

**Features**:
- Auto-populated date property (YYYYMMDD format)
- Automatic `#daily` tag
- Task migration from previous day
- Organized sections: Tasks, Notes, Reflections, Associated Docs

**Structure**:
```yaml
---
date: 20250813
tags:
  - daily
---
## Tasks
[Automatically migrated tasks]

## Notes
## Reflections
## Associated Docs
```

## 🔧 Setup Instructions

1. **Scripts**: Place `.js` files in your Templater scripts folder
2. **CSS**: Place `.css` files in your vault's snippets folder and enable them
3. **Templates**: Add the template to your templates folder and configure Daily Notes plugin
4. **Python Scripts**: Run locally for maintenance tasks

## 🎯 Workflow

This setup creates a seamless bullet journaling workflow:

1. **Create daily note** → Template loads with previous day's incomplete tasks
2. **Work on tasks** → Mark complete (`[x]`) or cancelled (`[-]`) as you go
3. **Create notes** → Any notes created today automatically link to your daily note
4. **Next day** → Incomplete tasks migrate forward, completed ones stay archived

The system maintains bullet journal principles while adding digital conveniences like automatic migration and linking.