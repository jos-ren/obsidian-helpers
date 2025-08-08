"""
Obsidian Vault Index Generator
Prints a tree-like structure of all .md files in an Obsidian vault
"""

import os
from pathlib import Path
import sys


def print_vault_structure(vault_path, show_empty_folders=True):
    """
    Print the structure of an Obsidian vault in a tree format
    
    Args:
        vault_path (str): Path to the Obsidian vault
        show_empty_folders (bool): Whether to show folders with no .md files
    """
    vault = Path(vault_path)
    
    if not vault.exists():
        print(f"❌ Error: Vault path '{vault_path}' does not exist")
        return
    
    if not vault.is_dir():
        print(f"❌ Error: '{vault_path}' is not a directory")
        return
    
    print(f"📁 Obsidian Vault Structure: {vault.name}")
    print(f"📍 Path: {vault.absolute()}")
    print("=" * 60)
    
    # Count total files for summary
    total_md_files = len(list(vault.rglob("*.md")))
    total_folders = len([p for p in vault.rglob("*") if p.is_dir()])
    
    print(f"📊 Summary: {total_md_files} markdown files in {total_folders} folders\n")
    
    # Print the tree structure
    _print_tree(vault, "", True, show_empty_folders)


def _print_tree(path, prefix="", is_last=True, show_empty_folders=True):
    """
    Recursively print directory tree structure
    
    Args:
        path (Path): Current path to process
        prefix (str): Prefix for current level
        is_last (bool): Whether this is the last item at current level
        show_empty_folders (bool): Whether to show empty folders
    """
    if path.name.startswith('.'):
        return  # Skip hidden files/folders
    
    # Print current item
    if path != path.parent:  # Don't print root twice
        connector = "└── " if is_last else "├── "
        
        if path.is_dir():
            # Check if folder has any .md files (recursively)
            md_files_in_folder = list(path.rglob("*.md"))
            folder_symbol = "📁"
            
            if md_files_in_folder or show_empty_folders:
                count_info = f" ({len(md_files_in_folder)} files)" if md_files_in_folder else " (empty)"
                print(f"{prefix}{connector}{folder_symbol} {path.name}{count_info}")
        else:
            # Only print .md files, skip all other file types
            if path.suffix == ".md":
                print(f"{prefix}{connector}📄 {path.name}")
                return  # Files don't have children, so return early
    
    # Only process children if this is a directory
    if not path.is_dir():
        return
    
    # Get all items in current directory
    try:
        items = sorted([p for p in path.iterdir() if not p.name.startswith('.')], 
                      key=lambda x: (x.is_file(), x.name.lower()))
    except PermissionError:
        print(f"{prefix}❌ Permission denied")
        return
    except OSError as e:
        print(f"{prefix}❌ Error reading directory: {e}")
        return
    
    # Filter items: only include directories and .md files
    filtered_items = []
    for item in items:
        if item.is_dir():
            # Include directories that contain .md files or if showing empty folders
            if show_empty_folders or list(item.rglob("*.md")):
                filtered_items.append(item)
        elif item.suffix == ".md":
            # Only include .md files, skip images, PDFs, etc.
            filtered_items.append(item)
    
    # Process children
    for i, item in enumerate(filtered_items):
        is_last_item = i == len(filtered_items) - 1
        extension = "    " if is_last else "│   "
        new_prefix = prefix + extension if path != path.parent else ""
        _print_tree(item, new_prefix, is_last_item, show_empty_folders)

# replace with your vault path
VAULT_PATH = "" 

def get_vault_path():
    """Get vault path from configuration or command line argument"""
    if len(sys.argv) > 1:
        return sys.argv[1]
    
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    
    # Resolve the vault path relative to the script location
    vault_path = (script_dir / VAULT_PATH).resolve()
    
    if not vault_path.exists():
        print(f"❌ Error: Configured vault path '{vault_path}' does not exist")
        print(f"💡 Please update the VAULT_PATH variable at the top of this script")
        print(f"📍 Script location: {script_dir}")
        sys.exit(1)
    
    return str(vault_path)


def main():
    """Main function"""
    try:
        vault_path = get_vault_path()
        
        # Ask user preferences
        print("⚙️  Options:")
        show_empty = input("Show empty folders? (y/N): ").lower().startswith('y')
        
        print("\n" + "="*60)
        print_vault_structure(vault_path, show_empty)
        
        print("\n" + "="*60)
        print("✅ Index generation complete!")
        print("💡 Tip: You can copy this output and provide it to Claude as reference")
        
    except KeyboardInterrupt:
        print("\n❌ Operation cancelled by user")
    except Exception as e:
        print(f"❌ An error occurred: {e}")


if __name__ == "__main__":
    main()