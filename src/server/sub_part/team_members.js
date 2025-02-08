const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "Trevita_Project_1",
  authPlugins: {
    mysql_native_password: () =>
      require("mysql2/lib/auth_plugins").mysql_native_password,
  },
});

router.post("/get_members", (req, res) => {
  const { user_email } = req.body;
  const query = `
        SELECT owner_email,member_id, member_name, member_profile_img, member_role, member_event_assignment, member_status
        FROM team_member where owner_email = ?
    `;

  // Execute the query to fetch data from the database
  db.query(query, [user_email], (err, results) => {
    if (err) {
      console.error("Error fetching team members:", err);
      res.status(500).send("Database error");
      return;
    }
    res.json(results); // Send the fetched data as a JSON response
  });
});

router.post("/get_inactive_members", (req, res) => {
  const { user_email } = req.body;
  const query = `
        SELECT * FROM team_member where owner_email = ? 
    `;

  // Execute the query to fetch data from the database
  db.query(query, [user_email, "inactive"], (err, results) => {
    if (err) {
      console.error("Error fetching team members:", err);
      res.status(500).send("Database error");
      return;
    }
    res.json(results); // Send the fetched data as a JSON response
  });
});

router.post("/filtered_team_member", (req, res) => {
  const { user_email, start_date, end_date } = req.body;

  const query = `
      SELECT start_date, end_date, assigned_team_member 
      FROM event_request 
      WHERE receiver_email = ? 
      AND start_date >= ? 
      AND end_date <= ?;
    `;

  // Execute the query
  db.query(query, [user_email, start_date, end_date], (err, results) => {
    if (err) {
      console.error("Error fetching team members:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    console.log("Query Params:", user_email, start_date, end_date);

    if (results.length === 0) {
      return res.status(200).json({ message: "No data found", results: [] });
    }

    const assignedTeamMembers = new Set(); // Store unique team members

    // Format results properly
    const formattedResults = results.map((result) => {
      let assignedTeamMember = result.assigned_team_member;

      // Handle possible JSON string stored in DB
      if (typeof assignedTeamMember === "string") {
        try {
          assignedTeamMember = JSON.parse(assignedTeamMember);
        } catch (error) {
          console.error("Error parsing assigned team members:", error);
          assignedTeamMember = [];
        }
      }

      // Ensure it's always an array
      if (!Array.isArray(assignedTeamMember)) {
        assignedTeamMember = [];
      }

      // Add team members to Set
      assignedTeamMember.forEach((member) => assignedTeamMembers.add(member));

      return {
        start_date: result.start_date,
        end_date: result.end_date,
        assigned_team_member: assignedTeamMember,
      };
    });

    // Convert Set to array to remove duplicates
    const response = {
      results: formattedResults,
      assignedTeamMembers: [...assignedTeamMembers],
    };

    console.log("Final Response:", response);
    return res.status(200).json(response);
  });
});

router.post("/add_members", (req, res) => {
  const {
    owner_email,
    member_name,
    member_profile_img,
    member_role,
    member_event_assignment,
    member_status,
  } = req.body;

  // Insert the new team member into the database
  const query = `
        INSERT INTO team_member (owner_email, member_name, member_profile_img, member_role, member_event_assignment, member_status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [
      owner_email,
      member_name,
      member_profile_img,
      member_role,
      member_event_assignment,
      member_status,
    ],
    (err, result) => {
      if (err) {
        console.error("Error adding team member:", err);
        res.status(500).send("Database error");
        return;
      }
      res.status(201).json({ message: "Team member added successfully" });
    }
  );
});

router.delete("/delete_member", (req, res) => {
  const { member_id, owner_email } = req.body; // Expecting both member_id and owner_email in the request body

  // SQL query to delete the team member by member_id and owner_email
  const query = `
        DELETE FROM team_member 
        WHERE member_id = ? AND owner_email = ?
    `;

  db.query(query, [member_id, owner_email], (err, result) => {
    if (err) {
      console.error("Error deleting team member:", err);
      res.status(500).send("Database error");
      return;
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Member not found or you do not have permission to delete this member",
      });
    }

    res.status(200).json({ message: "Team member deleted successfully" });
  });
});

router.put("/update_member/:id", (req, res) => {
  const { id } = req.params; // ID of the member to update
  const {
    member_name,
    member_profile_img,
    member_role,
    member_event_assignment,
    member_status,
  } = req.body;

  const query = `
        UPDATE team_member
        SET member_name = ?, member_profile_img = ?, member_role = ?, member_event_assignment = ?, member_status = ?
        WHERE id = ?
    `;

  db.query(
    query,
    [
      member_name,
      member_profile_img,
      member_role,
      member_event_assignment,
      member_status,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating team member:", err);
        res.status(500).send("Database error");
        return;
      }
      res.status(200).json({ message: "Team member updated successfully" });
    }
  );
});

router.put("/update_member", (req, res) => {
  const {
    member_id,
    owner_email,
    member_name,
    member_profile_img,
    member_role,
    member_event_assignment,
    member_status,
  } = req.body;

  // Ensure the provided owner_email matches the member's owner_email (foreign key validation)
  const query = `
        UPDATE team_member
        SET member_name = ?, member_profile_img = ?, member_role = ?, member_event_assignment = ?, member_status = ?
        WHERE member_id = ? AND owner_email = ?
    `;

  db.query(
    query,
    [
      member_name,
      member_profile_img,
      member_role,
      member_event_assignment,
      member_status,
      member_id,
      owner_email,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating team member:", err);
        res.status(500).send("Database error");
        return;
      }

      if (result.affectedRows === 0) {
        res
          .status(404)
          .json({ message: "Member not found or owner_email mismatch" });
        return;
      }

      res.status(200).json({ message: "Team member updated successfully" });
    }
  );
});

module.exports = router;
