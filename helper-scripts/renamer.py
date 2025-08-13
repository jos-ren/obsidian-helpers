import os
import re
from pathlib import Path

def rename_daily_notes(vault_path, dry_run=True):
    """
    Rename Obsidian daily notes from YYYY-MM-DD.md to YYYYMMDD.md
    
    Args:
        vault_path (str): Path to your Obsidian vault
        dry_run (bool): If True, only shows what would be renamed without actually renaming
    
    Returns:
        dict: Summary of operations performed
    """
    vault_path = Path(vault_path)
    
    if not vault_path.exists():
        raise FileNotFoundError(f"Vault path does not exist: {vault_path}")
    
    # Pattern to match YYYY-MM-DD.md files
    date_pattern = re.compile(r'^(\d{4})-(\d{2})-(\d{2})\.md$')
    
    renamed_files = []
    skipped_files = []
    errors = []
    
    # Find all markdown files in the vault (including subdirectories)
    for file_path in vault_path.rglob("*.md"):
        filename = file_path.name
        match = date_pattern.match(filename)
        
        if match:
            year, month, day = match.groups()
            new_filename = f"{year}{month}{day}.md"
            new_file_path = file_path.parent / new_filename
            
            # Check if target file already exists
            if new_file_path.exists():
                skipped_files.append({
                    'original': str(file_path),
                    'target': str(new_file_path),
                    'reason': 'Target file already exists'
                })
                continue
            
            if dry_run:
                renamed_files.append({
                    'original': str(file_path),
                    'new': str(new_file_path)
                })
            else:
                try:
                    file_path.rename(new_file_path)
                    renamed_files.append({
                        'original': str(file_path),
                        'new': str(new_file_path)
                    })
                except Exception as e:
                    errors.append({
                        'file': str(file_path),
                        'error': str(e)
                    })
    
    # Print summary
    print(f"{'DRY RUN - ' if dry_run else ''}Obsidian Daily Notes Renamer Summary")
    print("=" * 50)
    print(f"Files {'would be ' if dry_run else ''}renamed: {len(renamed_files)}")
    print(f"Files skipped: {len(skipped_files)}")
    print(f"Errors: {len(errors)}")
    print()
    
    if renamed_files:
        print("Files renamed:" if not dry_run else "Files that would be renamed:")
        for item in renamed_files:
            old_name = Path(item['original']).name
            new_name = Path(item['new']).name
            print(f"  {old_name} → {new_name}")
        print()
    
    if skipped_files:
        print("Files skipped:")
        for item in skipped_files:
            print(f"  {Path(item['original']).name} - {item['reason']}")
        print()
    
    if errors:
        print("Errors:")
        for item in errors:
            print(f"  {Path(item['file']).name} - {item['error']}")
        print()
    
    return {
        'renamed': renamed_files,
        'skipped': skipped_files,
        'errors': errors
    }

# Link updating function removed per user request

# Example usage
if __name__ == "__main__":
    # Replace with your actual vault path
    VAULT_PATH = "../../Josh's Vault"
    
    print("Renaming daily notes (DRY RUN)")
    # result = rename_daily_notes(VAULT_PATH, dry_run=True)
    
    # Uncomment this line to actually perform the renaming:
    result = rename_daily_notes(VAULT_PATH, dry_run=False)