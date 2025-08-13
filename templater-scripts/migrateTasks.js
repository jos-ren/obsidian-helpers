// Clean Bullet Journal Migration Script for Templater
// Save this as migrateTasks.js in your Templater scripts folder

async function migrateTasks() {
    console.log("=== MIGRATION STARTING ===");
    try {
        const app = window.app;
        const vault = app.vault;
        
        // Get today's date in YYYYMMDD format
        function getDateString(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        }

        // Find the most recent daily note (excluding today)
        function findMostRecentDailyNote() {
            const files = vault.getMarkdownFiles();
            const today = getDateString(new Date());
            
            // Filter for daily notes and sort by date (most recent first)
            const dailyNotes = files
                .filter(file => {
                    const is8Digits = /^\d{8}$/.test(file.basename);
                    const notToday = file.basename !== today;
                    return is8Digits && notToday;
                })
                .sort((a, b) => b.basename.localeCompare(a.basename));

            return dailyNotes.length > 0 ? dailyNotes[0] : null;
        }

        // Extract incomplete tasks from Tasks section
        function extractIncompleteTasks(content) {
            if (!content || typeof content !== 'string') {
                return [];
            }
            
            const lines = content.split('\n');
            const tasksSectionStart = lines.findIndex(line => line.trim() === '## Tasks');
            
            if (tasksSectionStart === -1) {
                return [];
            }

            const incompleteTasks = [];
            let inTasksSection = false;
            let baseIndent = null;

            for (let i = tasksSectionStart + 1; i < lines.length; i++) {
                const line = lines[i];
                
                // Stop if we hit another main section (starts with #)
                if (line.trim().match(/^#{1,2}\s+\w/)) {
                    break;
                }

                // Skip empty lines but continue processing if we're in a task section
                if (line.trim() === '') {
                    if (inTasksSection) incompleteTasks.push(line);
                    continue;
                }

                // Check for task line
                const taskMatch = line.match(/^(\s*)- \[(.)\]/);
                if (taskMatch) {
                    const indent = taskMatch[1];
                    const status = taskMatch[2];
                    
                    // Only migrate incomplete tasks (space, /, <) - NOT already forwarded (>)
                    if ([' ', '/', '<'].includes(status)) {
                        incompleteTasks.push(line);
                        inTasksSection = true;
                        if (baseIndent === null) baseIndent = indent.length;
                    } else {
                        // Reset section tracking for completed/cancelled tasks
                        inTasksSection = false;
                        baseIndent = null;
                    }
                } else if (inTasksSection) {
                    // Include related content (sub-bullets, URLs, notes, etc.)
                    const currentIndent = line.match(/^(\s*)/)[1].length;
                    if (currentIndent >= baseIndent || 
                        line.trim().startsWith('- ') || 
                        line.trim().startsWith('http') || 
                        line.trim().startsWith('>')) {
                        incompleteTasks.push(line);
                    } else {
                        inTasksSection = false;
                        baseIndent = null;
                    }
                }
            }

            return incompleteTasks;
        }

        // Mark original tasks as forwarded and add associated docs (runs in background)
        function markTasksAsForwardedAndAddDocs(file, tasksToMark, associatedDocs) {
            setTimeout(async () => {
                try {
                    const content = await vault.read(file);
                    let updatedContent = content;

                    // Mark tasks as forwarded
                    tasksToMark.forEach(taskLine => {
                        if (taskLine.includes('- [')) {
                            const forwardedLine = taskLine.replace(/- \[[ /><]\]/, '- [>]');
                            updatedContent = updatedContent.replace(taskLine, forwardedLine);
                        }
                    });

                    // Add associated docs
                    if (associatedDocs.length > 0) {
                        console.log("Adding associated docs to previous note...");
                        const lines = updatedContent.split('\n');
                        const docsIndex = lines.findIndex(line => line.trim() === '## Associated Docs');
                        console.log("Associated Docs section found at index:", docsIndex);
                        
                        if (docsIndex !== -1) {
                            // Find the end of the Associated Docs section
                            let insertIndex = docsIndex + 1;
                            console.log("Initial insert index:", insertIndex);
                            
                            // Skip to the first non-empty line after the heading
                            while (insertIndex < lines.length && lines[insertIndex].trim() === '') {
                                insertIndex++;
                            }
                            console.log("Final insert index:", insertIndex);
                            
                            // Add the docs
                            const docLinks = associatedDocs.map(doc => `[[${doc}]]`);
                            console.log("Doc links to insert:", docLinks);
                            
                            lines.splice(insertIndex, 0, ...docLinks);
                            updatedContent = lines.join('\n');
                            
                            console.log(`✓ Added ${associatedDocs.length} associated docs to ${file.basename}`);
                        } else {
                            console.log("❌ ## Associated Docs section not found in previous note");
                        }
                    } else {
                        console.log("No associated docs to add");
                    }

                    await vault.modify(file, updatedContent);
                    console.log(`Updated ${file.basename} with forwarded tasks and associated docs`);
                } catch (error) {
                    console.error('Error updating previous note:', error);
                }
            }, 1000);
        }

        // Get notes created on the same day as the given daily note
        function getNotesCreatedOnDay(dailyNote) {
            console.log("=== FINDING ASSOCIATED DOCS ===");
            const noteDate = dailyNote.basename; // YYYYMMDD format
            console.log("Target daily note:", noteDate);
            
            const targetDate = new Date(
                parseInt(noteDate.slice(0, 4)),     // year
                parseInt(noteDate.slice(4, 6)) - 1, // month (0-indexed)
                parseInt(noteDate.slice(6, 8))      // day
            );
            console.log("Target date object:", targetDate);
            console.log("Target date string:", targetDate.toDateString());
            
            const files = vault.getMarkdownFiles();
            console.log("Total markdown files to check:", files.length);
            
            const associatedFiles = [];
            let checkedCount = 0;
            let skippedCount = 0;
            
            files.forEach((file, index) => {
                // Skip daily notes themselves
                if (/^\d{8}$/.test(file.basename)) {
                    skippedCount++;
                    if (index < 5) console.log(`Skipping daily note: ${file.basename}`);
                    return;
                }
                
                // Skip template files and other system files
                if (file.basename.toLowerCase().includes('template') || 
                    file.path.includes('Templates/') ||
                    file.basename.startsWith('.')) {
                    skippedCount++;
                    if (index < 5) console.log(`Skipping template/system file: ${file.basename}`);
                    return;
                }
                
                checkedCount++;
                
                // Check if file was created on the target date
                const fileDate = new Date(file.stat.ctime);
                const fileDateString = fileDate.toDateString();
                
                if (checkedCount <= 5) {
                    console.log(`File: ${file.basename}`);
                    console.log(`  Path: ${file.path}`);
                    console.log(`  Created: ${fileDateString}`);
                    console.log(`  Target:  ${targetDate.toDateString()}`);
                    console.log(`  Match: ${fileDateString === targetDate.toDateString()}`);
                }
                
                if (fileDateString === targetDate.toDateString()) {
                    associatedFiles.push(file.basename);
                    console.log(`✓ MATCH FOUND: ${file.basename} created on ${fileDateString}`);
                }
            });
            
            console.log("=== ASSOCIATED DOCS RESULT ===");
            console.log("Files checked:", checkedCount);
            console.log("Files skipped:", skippedCount);
            console.log("Total associated files found:", associatedFiles.length);
            console.log("Associated files:", associatedFiles);
            return associatedFiles;
        }

        // Main logic
        console.log("Starting main migration logic...");
        const mostRecentNote = findMostRecentDailyNote();
        console.log("Most recent note found:", mostRecentNote?.basename);
        
        if (!mostRecentNote) {
            console.log("No recent note found, returning early");
            return "<!-- No previous daily note found to migrate tasks from -->";
        }

        console.log("Reading content from:", mostRecentNote.path);
        const recentNoteContent = await vault.read(mostRecentNote);
        console.log("Content length:", recentNoteContent?.length);
        
        const incompleteTasks = extractIncompleteTasks(recentNoteContent);
        console.log("Incomplete tasks found:", incompleteTasks.length);

        // Always check for associated docs, even if no tasks to migrate
        const associatedDocs = getNotesCreatedOnDay(mostRecentNote);
        console.log("Associated docs found:", associatedDocs);

        if (incompleteTasks.length === 0 && associatedDocs.length === 0) {
            console.log("No tasks to migrate and no associated docs to add");
            return `<!-- No incomplete tasks or associated docs found in ${mostRecentNote.basename} -->`;
        }

        // Update the previous note with tasks and/or docs
        const taskLinesToMark = incompleteTasks.filter(task => task.includes('- ['));
        console.log("Marking tasks as forwarded and adding associated docs...");
        markTasksAsForwardedAndAddDocs(mostRecentNote, taskLinesToMark, associatedDocs);

        // Return tasks if any, otherwise just a comment about docs
        if (incompleteTasks.length > 0) {
            console.log(`Returning ${incompleteTasks.length} tasks from ${mostRecentNote.basename}`);
            const result = incompleteTasks.join('\n');
            console.log("Final result:", result);
            console.log("=== MIGRATION COMPLETE ===");
            return result;
        } else {
            console.log("No tasks to migrate, but associated docs were processed");
            console.log("=== MIGRATION COMPLETE ===");
            return `<!-- No tasks to migrate from ${mostRecentNote.basename}, but associated docs were added -->`;
        }

    } catch (error) {
        console.error('Error migrating tasks:', error);
        return `<!-- Error migrating tasks: ${error.message} -->`;
    }
}

module.exports = migrateTasks;