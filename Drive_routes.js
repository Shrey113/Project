// for fetching folders from drive folder root folder
app.post('/drive/root', (req, res) => {
    const { user_email } = req.body;

    if (!user_email) {
        return res.status(400).json({ error: 'user_email is required in the request body' });
    }

    // Queries for root folders and root files
    const folderQuery = 'SELECT * FROM Drive_folder WHERE user_email = ? AND is_root = TRUE';
    const fileQuery = 'SELECT * FROM Drive_files WHERE created_by = ? AND parent_folder_id IS NULL';

    db.query(folderQuery, [user_email], (folderErr, folderResults) => {
        if (folderErr) {
            return res.status(500).json({ error: 'Database error fetching folders', details: folderErr.message });
        }

        db.query(fileQuery, [user_email], (fileErr, fileResults) => {
            if (fileErr) {
                return res.status(500).json({ error: 'Database error fetching files', details: fileErr.message });
            }

            res.json({
                folders: folderResults,
                files: fileResults
            });
        });
    });
});



// fetch folder content (data)

app.post('/drive/folder-content', async (req, res) => {
    const { folder_id } = req.body;

    if (!folder_id) {
        return res.status(400).json({ error: 'Folder ID is required' });
    }

    try {
        // Fetch the folder details
        const folderQuery = 'SELECT folder_data FROM Drive_folder WHERE folder_id = ?';
        db.query(folderQuery, [folder_id], async (err, folderResults) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', details: err.message });
            }

            if (folderResults.length === 0) {
                return res.status(404).json({ error: 'Folder not found' });
            }

            const folderData = JSON.parse(folderResults[0].folder_data);
            const folderIds = folderData.folder_id || [];
            const fileIds = folderData.file_id || [];

            let folderDataResult = [];
            let fileDataResult = [];

            // Fetch folders data
            if (folderIds.length > 0) {
                const folderFetchQuery = `SELECT * FROM Drive_folder WHERE folder_id IN (${folderIds.join(',')})`;
                folderDataResult = await new Promise((resolve, reject) => {
                    db.query(folderFetchQuery, (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });
            }

            // Fetch files data
            if (fileIds.length > 0) {
                const fileFetchQuery = `SELECT * FROM Drive_files WHERE file_id IN (${fileIds.join(',')})`;
                fileDataResult = await new Promise((resolve, reject) => {
                    db.query(fileFetchQuery, (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });
            }

            res.json({ folder_data: folderDataResult, file_data: fileDataResult });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});


// creating new folder 
app.post('/drive/folder/create', (req, res) => {
    const { folder_name, user_email, created_by, parent_folder_id, is_root = false, is_shared = false } = req.body;

    if (!folder_name || !user_email || !created_by) {
        return res.status(400).json({ error: 'Folder name, user email, and created_by are required' });
    }

    // Insert the new folder
    const insertQuery = `
        INSERT INTO Drive_folder (folder_name, user_email, is_root, created_date, modified_date, created_by, modified_by, is_shared)
        VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ?)
    `;

    db.query(insertQuery, [folder_name, user_email, is_root, created_by, created_by, is_shared], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
        }

        const newFolderId = result.insertId;

        if (parent_folder_id) {
            // Fetch parent folder data
            const fetchParentQuery = `SELECT folder_data FROM Drive_folder WHERE folder_id = ?`;

            db.query(fetchParentQuery, [parent_folder_id], (err, parentResults) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error fetching parent folder', details: err.message });
                }

                if (parentResults.length === 0) {
                    return res.status(404).json({ error: 'Parent folder not found' });
                }

                let folderData = parentResults[0].folder_data ? JSON.parse(parentResults[0].folder_data) : { folder_id: [], file_id: [] };

                // Add new folder_id to parent folder_data
                folderData.folder_id.push(newFolderId);

                // Update parent folder with new folder_data
                const updateParentQuery = `UPDATE Drive_folder SET folder_data = ? WHERE folder_id = ?`;

                db.query(updateParentQuery, [JSON.stringify(folderData), parent_folder_id], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error updating parent folder', details: err.message });
                    }
                    res.json({ message: 'Folder created successfully', folder_id: newFolderId });
                });
            });
        } else {
            res.json({ message: 'Folder created successfully', folder_id: newFolderId });
        }
    });
});



// delete folder 
app.delete('/drive/folder/delete', (req, res) => {
    const { folder_id } = req.body;

    if (!folder_id) {
        return res.status(400).json({ error: 'Folder ID is required' });
    }

    const query = 'DELETE FROM Drive_folder WHERE folder_id = ?';

    db.query(query, [folder_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        res.json({ message: 'Folder deleted successfully' });
    });
});


// rename the folder 

app.put('/drive/folder/rename', (req, res) => {
    const { folder_id, new_folder_name, modified_by } = req.body;

    if (!folder_id || !new_folder_name || !modified_by) {
        return res.status(400).json({ error: 'Folder ID, new folder name, and modified_by are required' });
    }

    const query = `
        UPDATE Drive_folder 
        SET folder_name = ?, modified_date = NOW(), modified_by = ?
        WHERE folder_id = ?
    `;

    db.query(query, [new_folder_name, modified_by, folder_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        res.json({ message: 'Folder renamed successfully' });
    });
});

// move to another folder 
app.put('/drive/folder/move', (req, res) => {
    const { folder_id, old_parent_folder_id, new_parent_folder_id } = req.body;

    if (!folder_id || !old_parent_folder_id || !new_parent_folder_id) {
        return res.status(400).json({ error: 'folder_id, old_parent_folder_id, and new_parent_folder_id are required' });
    }

    // Function to update folder_data
    const updateFolderData = (parent_folder_id, folder_id, action, callback) => {
        const fetchQuery = `SELECT folder_data FROM Drive_folder WHERE folder_id = ?`;

        db.query(fetchQuery, [parent_folder_id], (err, results) => {
            if (err) return callback(err);

            if (results.length === 0) return callback(new Error('Parent folder not found'));

            let folderData = results[0].folder_data ? JSON.parse(results[0].folder_data) : { folder_id: [], file_id: [] };

            if (action === 'remove') {
                folderData.folder_id = folderData.folder_id.filter(id => id !== folder_id);
            } else if (action === 'add') {
                folderData.folder_id.push(folder_id);
            }

            const updateQuery = `UPDATE Drive_folder SET folder_data = ? WHERE folder_id = ?`;
            db.query(updateQuery, [JSON.stringify(folderData), parent_folder_id], callback);
        });
    };

    // Remove folder_id from old parent
    updateFolderData(old_parent_folder_id, folder_id, 'remove', (err) => {
        if (err) return res.status(500).json({ error: 'Error updating old parent folder', details: err.message });

        // Add folder_id to new parent
        updateFolderData(new_parent_folder_id, folder_id, 'add', (err) => {
            if (err) return res.status(500).json({ error: 'Error updating new parent folder', details: err.message });

            res.json({ message: 'Folder moved successfully' });
        });
    });
});

// file adding 

app.post('/drive/file/add', (req, res) => {
    const {
        file_name,
        parent_folder_id,
        file_size,
        file_type,
        file_data,
        created_by,
        modified_by,
        is_shared,
        is_root
    } = req.body;

    if (!file_name || !created_by || !modified_by) {
        return res.status(400).json({ error: "file_name, created_by, and modified_by are required" });
    }

    const rootValue = is_root === true; // Default is false unless explicitly set to true

    // Insert file into Drive_files
    const insertFileQuery = `
        INSERT INTO Drive_files 
        (file_name, parent_folder_id, file_size, file_type, file_data, created_by, modified_by, is_shared, is_root) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(insertFileQuery, [
        file_name,
        rootValue ? null : parent_folder_id, // If is_root is true, parent_folder_id is null
        file_size || null,
        file_type || null,
        file_data || null,
        created_by,
        modified_by,
        is_shared || false,
        rootValue
    ], (err, fileResult) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        const newFileId = fileResult.insertId;

        // If file is inside a folder, update that folder's folder_data
        if (!rootValue && parent_folder_id) {
            const getFolderQuery = `SELECT folder_data FROM Drive_folder WHERE folder_id = ?`;

            db.query(getFolderQuery, [parent_folder_id], (err, folderResults) => {
                if (err) {
                    return res.status(500).json({ error: "Database error", details: err.message });
                }

                if (folderResults.length > 0) {
                    let folderData = JSON.parse(folderResults[0].folder_data || '{}');

                    // Ensure file_id array exists
                    folderData.file_id = folderData.file_id ? [...folderData.file_id, newFileId] : [newFileId];

                    // Update the folder_data JSON field
                    const updateFolderQuery = `UPDATE Drive_folder SET folder_data = ? WHERE folder_id = ?`;
                    db.query(updateFolderQuery, [JSON.stringify(folderData), parent_folder_id], (err) => {
                        if (err) {
                            return res.status(500).json({ error: "Database error", details: err.message });
                        }

                        res.status(201).json({ message: "File added successfully", file_id: newFileId });
                    });
                } else {
                    res.status(404).json({ error: "Parent folder not found" });
                }
            });
        } else {
            res.status(201).json({ message: "File added successfully", file_id: newFileId });
        }
    });
});




// file rename 
app.put('/drive/file/rename', (req, res) => {
    const { file_id, new_name, modified_by } = req.body;

    if (!file_id || !new_name || !modified_by) {
        return res.status(400).json({ error: 'file_id, new_name, and modified_by are required' });
    }

    const query = `UPDATE Drive_files SET file_name = ?, modified_by = ?, file_modified_at = NOW() WHERE file_id = ?`;

    db.query(query, [new_name, modified_by, file_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error while renaming file', details: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.json({ message: 'File renamed successfully' });
    });
});


// file delete 

app.delete('/drive/file/delete', (req, res) => {
    const { file_id } = req.body;

    if (!file_id) {
        return res.status(400).json({ error: 'file_id is required' });
    }

    const query = `DELETE FROM Drive_files WHERE file_id = ?`;

    db.query(query, [file_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error while deleting file', details: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.json({ message: 'File deleted successfully' });
    });
});

// move file 
app.put('/drive/file/move', (req, res) => {
    const { file_id, old_parent_folder_id, new_parent_folder_id } = req.body;

    if (!file_id || !old_parent_folder_id || !new_parent_folder_id) {
        return res.status(400).json({ error: 'file_id, old_parent_folder_id, and new_parent_folder_id are required' });
    }

    // Fetch the old and new folder data
    const getFolderQuery = `SELECT folder_data FROM Drive_folder WHERE folder_id IN (?, ?)`;

    db.query(getFolderQuery, [old_parent_folder_id, new_parent_folder_id], (err, folders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error while fetching folder data', details: err.message });
        }

        if (folders.length < 2) {
            return res.status(404).json({ error: 'One or both folders not found' });
        }

        let oldFolderData = JSON.parse(folders[0].folder_data || '{}');
        let newFolderData = JSON.parse(folders[1].folder_data || '{}');

        // Remove file from old folder
        oldFolderData.file_id = oldFolderData.file_id?.filter(id => id !== file_id) || [];

        // Add file to new folder
        newFolderData.file_id = newFolderData.file_id || [];
        newFolderData.file_id.push(file_id);

        // Update both folders
        const updateFolderQuery = `UPDATE Drive_folder SET folder_data = ? WHERE folder_id = ?`;

        db.query(updateFolderQuery, [JSON.stringify(oldFolderData), old_parent_folder_id], (err1) => {
            if (err1) {
                return res.status(500).json({ error: 'Database error updating old folder', details: err1.message });
            }

            db.query(updateFolderQuery, [JSON.stringify(newFolderData), new_parent_folder_id], (err2) => {
                if (err2) {
                    return res.status(500).json({ error: 'Database error updating new folder', details: err2.message });
                }

                // Update file's parent folder
                const updateFileQuery = `UPDATE Drive_files SET parent_folder_id = ? WHERE file_id = ?`;
                db.query(updateFileQuery, [new_parent_folder_id, file_id], (err3) => {
                    if (err3) {
                        return res.status(500).json({ error: 'Database error updating file location', details: err3.message });
                    }

                    res.json({ message: 'File moved successfully' });
                });
            });
        });
    });
});


// fetch starred folder and file of user 

app.post('/drive/starred/fetch', (req, res) => {
    const { user_email } = req.body;

    if (!user_email) {
        return res.status(400).json({ error: 'user_email is required' });
    }

    const query = `
        SELECT s.*, 
               CASE 
                   WHEN s.starred_type = 'folder' THEN f.folder_name 
                   ELSE d.file_name 
               END AS item_name
        FROM starred s
        LEFT JOIN Drive_folder f ON s.starred_type = 'folder' AND s.starred_type_id = f.folder_id
        LEFT JOIN Drive_files d ON s.starred_type = 'file' AND s.starred_type_id = d.file_id
        WHERE s.starred_by = ?`;

    db.query(query, [user_email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error while fetching starred items', details: err.message });
        }

        res.json({ starred_items: results });
    });
});


// starred folder file 

app.post('/drive/starred/add', (req, res) => {
    const { starred_type, starred_type_id, starred_by } = req.body;

    if (!starred_type || !starred_type_id || !starred_by) {
        return res.status(400).json({ error: 'starred_type, starred_type_id, and starred_by are required' });
    }

    const insertQuery = `INSERT INTO starred (starred_type, starred_type_id, starred_by) VALUES (?, ?, ?)`;

    db.query(insertQuery, [starred_type, starred_type_id, starred_by], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error while adding to starred', details: err.message });
        }

        res.json({ message: 'Item starred successfully', starred_id: result.insertId });
    });
});
