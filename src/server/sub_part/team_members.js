const express = require('express');
const router = express.Router();
const mysql = require('mysql2');




const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'Trevita_Project_1',
    authPlugins: {
        mysql_native_password: () => require('mysql2/lib/auth_plugins').mysql_native_password
    }
});


router.get('/get_members', (req, res) => {
    const query = `
        SELECT owner_email,member_id, member_name, member_profile_img, member_role, member_event_assignment, member_status
        FROM team_member
    `;
    
    // Execute the query to fetch data from the database
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching team members:', err);
            res.status(500).send('Database error');
            return;
        }
        res.json(results); // Send the fetched data as a JSON response
    });
  });
  
  router.post('/add_members', (req, res) => {
    const { owner_email, member_name, member_profile_img, member_role, member_event_assignment, member_status } = req.body;
    
    // Insert the new team member into the database
    const query = `
        INSERT INTO team_member (owner_email, member_name, member_profile_img, member_role, member_event_assignment, member_status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [owner_email, member_name, member_profile_img, member_role, member_event_assignment, member_status], (err, result) => {
        if (err) {
            console.error('Error adding team member:', err);
            res.status(500).send('Database error');
            return;
        }
        res.status(201).json({ message: 'Team member added successfully' });
    });
  });
  
  
  router.delete('/delete_member', (req, res) => {
    const { member_id, owner_email } = req.body;  // Expecting both member_id and owner_email in the request body
  
    // SQL query to delete the team member by member_id and owner_email
    const query = `
        DELETE FROM team_member 
        WHERE member_id = ? AND owner_email = ?
    `;
  
    db.query(query, [member_id, owner_email], (err, result) => {
        if (err) {
            console.error('Error deleting team member:', err);
            res.status(500).send('Database error');
            return;
        }
  
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Member not found or you do not have permission to delete this member' });
        }
  
        res.status(200).json({ message: 'Team member deleted successfully' });
    });
  });
  
  router.put('/update_member/:id', (req, res) => {
    const { id } = req.params; // ID of the member to update
    const { member_name, member_profile_img, member_role, member_event_assignment, member_status } = req.body;
    
    const query = `
        UPDATE team_member
        SET member_name = ?, member_profile_img = ?, member_role = ?, member_event_assignment = ?, member_status = ?
        WHERE id = ?
    `;
    
    db.query(query, [member_name, member_profile_img, member_role, member_event_assignment, member_status, id], (err, result) => {
        if (err) {
            console.error('Error updating team member:', err);
            res.status(500).send('Database error');
            return;
        }
        res.status(200).json({ message: 'Team member updated successfully' });
    });
  });
  
  
  router.put('/update_member', (req, res) => {
    const { member_id, owner_email, member_name, member_profile_img, member_role, member_event_assignment, member_status } = req.body;
  
    // Ensure the provided owner_email matches the member's owner_email (foreign key validation)
    const query = `
        UPDATE team_member
        SET member_name = ?, member_profile_img = ?, member_role = ?, member_event_assignment = ?, member_status = ?
        WHERE member_id = ? AND owner_email = ?
    `;
  
    db.query(query, [member_name, member_profile_img, member_role, member_event_assignment, member_status, member_id, owner_email], (err, result) => {
        if (err) {
            console.error('Error updating team member:', err);
            res.status(500).send('Database error');
            return;
        }
  
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Member not found or owner_email mismatch' });
            return;
        }
  
        res.status(200).json({ message: 'Team member updated successfully' });
    });
  });
  

module.exports = router;