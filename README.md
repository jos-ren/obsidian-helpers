Custom scripts and CSS snippets for Obsidian

## Scripts

### migrateTasks.js - Bullet Journal Task Migration
Automatically migrates incomplete tasks from your most recent daily note to today's note.

**Features:**
- Finds most recent daily note (YYYYMMDD format)
- Extracts incomplete tasks from Tasks section
- Marks original tasks as forwarded
- Links notes created on same day to Associated Docs section

**Setup:** Place in Templater scripts folder and use `<%* tR += await tp.user.migrateTasks() %>` in daily template.

### renamer.py - Daily Note Format Converter
Converts daily note filenames from YYYY-MM-DD.md to YYYYMMDD.md format.

**Usage:**
```python
# Preview changes
result = rename_daily_notes(VAULT_PATH, dry_run=True)

# Rename files
result = rename_daily_notes(VAULT_PATH, dry_run=False)
```

### tree_indexer.py - Vault Structure Generator
Generates tree-view of vault structure for documentation purposes.

## CSS Snippets

### auto-center-images.css - Image Alignment
Centers all images by default with alignment options.

**Usage:**
```markdown
![[image.png]]           # Centered
![[image.png|left]]      # Left-aligned
![[image.png|right]]     # Right-aligned
```

### coloured-sidebar-images.css - Colored Folder System
Color-codes folders based on numbered prefixes (00-07, 99).

**Usage:** Name folders with prefixes like `00 - Maps`, `01 - Projects`, etc.

### hide-add-property.css - Clean Properties View
Hides the "Add Property" button for cleaner interface.

## Templates

### Daily Template.md - Automated Daily Note
Template with automatic task migration and consistent structure.

**Structure:**
```yaml
---
date: YYYYMMDD
tags:
  - daily
---
## Tasks
## Notes
## Reflections
## Associated Docs
```

## Setup

1. Place .js files in Templater scripts folder
2. Place .css files in vault snippets folder and enable
3. Add template to templates folder
4. Configure Daily Notes plugin to use template

## Workflow

1. Create daily note - loads with previous day's incomplete tasks
2. Work on tasks - mark complete or cancelled
3. Create notes - automatically link to daily note
4. Next day - incomplete tasks migrate forward
