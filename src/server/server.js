const express = require('express');
const mysql = require('mysql2'); 
const cors = require("cors");
const app = express();
const jwt = require('jsonwebtoken');
const adminRoutes = require('./sub_part/Admin_rout');
const ownerRoutes = require('./sub_part/owner_rout');
const ownerRoutes_v2 = require('./sub_part/owner_rout_v2');
const chartRoutes = require('./sub_part/chart_rout');

// import { Server_url } from '../redux/AllData';
app.use(express.json()); 
app.use(cors());

const { send_welcome_page, send_otp_page } = require('./modules/send_server_email');
const {server_request_mode,write_log_file,error_message,info_message,success_message,normal_message} = require('./modules/_all_help');
const { generate_otp, get_otp, clear_otp } = require('./modules/OTP_generate');
const JWT_SECRET_KEY = 'Jwt_key_for_photography_website';


// Socket.IO setup
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: '*', // Allow all HTTP methods
  },
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for custom events
  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    io.emit('message', msg); // Broadcast the message to all clients
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});


const db = mysql.createConnection({
  host: 'localhost', 
  user: 'root',      
  password: '12345',      
  database: 'Trevita_Project_1', 
  authPlugins: {
      mysql_native_password: () => require('mysql2/lib/auth_plugins').mysql_native_password
  }
});

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "u300194546_snap",
//   password: "Snap!@#$1234",
//   database: "u300194546_snap",
//   authPlugins: {
//     mysql_native_password: () =>
//       require("mysql2/lib/auth_plugins").mysql_native_password,
//   },
// });


db.connect(err => {
  if (err) {
      console.error('Error connecting to MySQL:', err.message);
      return;
  }
  console.log('Connected to MySQL database');
});

// @shrey11_  start ---- 
// @shrey11_  start ---- 
// @shrey11_  start ---- 
// @shrey11_  start ---- 
// @shrey11_  start ----

function create_jwt_token(user_email,user_name){
  let data_for_jwt = {user_name,user_email}
  let jwt_token = jwt.sign(data_for_jwt,JWT_SECRET_KEY)
  return jwt_token;
}

// helper -- 2
function check_jwt_token(jwt_token) {
  try {
      const data = jwt.verify(jwt_token, JWT_SECRET_KEY);
      return data;
  } catch (err) {
      console.error(err);
      return null; 
  }
}


// Middleware usage
app.use((req, res, next) => {
    server_request_mode(req.method, req.url, req.body);
    next();
});
  
app.get("/",(req,res)=>{
    res.send("hi server user")
});

app.post("/send_otp_email", async (req, res) => {
  const { email,type } = req.body;
  if (!email || !type) {
    error_message("send_otp_email say : Email and type is required")
    return res.status(400).json({ error: "Email and type is required" });
  }
  try {
    let otp;
    if(type == "owner"){
      otp = generate_otp(email,"owner")
    }else{
      otp = generate_otp(email,"client")
    }
    info_message(`An email has been sent to ${email}.OTP is ${otp}.`);

    await send_otp_page(email, otp);
    res.status(200).json({ message: `OTP email sent to ${email}` ,status:"success"});
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
});

app.post("/get_user_data_from_jwt", async (req, res) => {
  const jwt_token = req.body.jwt_token;

  if (!jwt_token) {
    console.error("get_user_data_from_jwt says: JWT token is required");
    return res.status(400).send("JWT token is required");
  }

  try {
    const userData = check_jwt_token(jwt_token);
    if (!userData || !userData.user_name || !userData.user_email) {
      return res.status(200).json({ error: "Invalid or incomplete JWT token" });
    }
    const find_user = 'SELECT * FROM owner WHERE user_name = ? AND user_email = ?';

    db.query(
      find_user,
      [userData.user_name, userData.user_email],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
          return res.status(200).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User found", user: result[0] });
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function getNotifications(notification_type, notification_message, notification_title, callback) {
  const query = `
      SELECT *, created_at 
      FROM notification
      WHERE notification_type = ? 
      AND notification_message = ? 
      AND notification_title = ? 
      AND DATE(created_at) = CURDATE()`;

  // Execute the query with placeholders for security
  db.query(query, [notification_type, notification_message, notification_title], (err, results) => {
      if (err) {
          console.error('Error executing query:', err);
          return callback(err, null);
      }
      callback(null, results);
  });
}

app.post('/notifications_admin', (req, res) => {
  const { notification_type, notification_message, notification_title } = req.body;

  if (!notification_type || !notification_message || !notification_title) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  // Call the getNotifications function
  getNotifications(notification_type, notification_message, notification_title, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch notifications' });
      }
      
      console.log("sednotification received notification");
      
      io.emit('new_notification',"all ok");

      res.json({message:"all ok", notifications: results });
  });
});

app.get('/notifications_for_test', (req, res) => {
  db.query('SELECT * FROM notification', (err, results) => {
    if (err) {
      console.error('Error fetching data: ', err);
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(results);  // Send the data as JSON
  });
});


// admin routes
app.use('/Admin', adminRoutes);

// owner routes
app.use('/owner', ownerRoutes);
app.use('/owner_v2', ownerRoutes_v2);

// owner routes
app.use('/chart', chartRoutes);



app.get('/team_members/get_members', (req, res) => {
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

app.post('/team_members/add_members', (req, res) => {
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


app.delete('/team_members/delete_member', (req, res) => {
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


// Endpoint to update a team member's details
app.put('/team_members/update_member/:id', (req, res) => {
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


app.put('/team_members/update_member', (req, res) => {
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




app.post('/update-status', (req, res) => {
  const { user_email, user_Status, message, set_status_by_admin } = req.body;

  // Validate required fields
  if (!user_email || !user_Status) {
    return res.status(400).json({ message: 'Missing required fields: user_email or user_Status' });
  }

  // Set default values for optional fields if they're undefined
  const safeMessage = message || null; // If message is undefined, set it as null
  const safeAdminEmail = set_status_by_admin || null; // If admin email is undefined, set it as null

  // Retrieve admin information if an admin email is provided
  if (safeAdminEmail) {
    const getAdminIdQuery = 'SELECT admin_id FROM admins WHERE admin_email = ?';
    db.execute(getAdminIdQuery, [safeAdminEmail], (err, adminResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'Database error when fetching admin' });
      }

      if (adminResult.length === 0) {
        return res.status(400).json({ message: 'Admin not found' });
      }

      const admin_id = adminResult[0].admin_id;

      // Update the user's status in the 'users' table
      const updateStatusQuery = `
        UPDATE owner
        SET user_Status = ?, admin_message = ?, set_status_by_admin = ?
        WHERE user_email = ?
      `;
      db.execute(updateStatusQuery, [user_Status, safeMessage, admin_id, user_email], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: 'Database error while updating user status' });
        }

        return res.json({ message: 'Status updated' });
      });
    });
  } else {
    // If no admin email is provided, update the status without an admin_id
    const updateStatusQuery = `
      UPDATE owner
      SET user_Status = ?, admin_message = ?, set_status_by_admin = NULL
      WHERE user_email = ?
    `;
    db.execute(updateStatusQuery, [user_Status, safeMessage, user_email], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'Database error while updating user status' });
      }

      return res.json({ message: 'Status updated' });
    });
  }
});

// @shrey11_  End ---- 
// @shrey11_  End ---- 
// @shrey11_  End ---- 
// @shrey11_  End ---- 
// @shrey11_  End ----
// praharsh  start ----
// praharsh  start ----
// praharsh  start ----
// praharsh  start ----
// praharsh  start ----
// client paths




app.post("/check-user-jwt", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(200).json({ message: "Token is required" });
  }

  const data = check_jwt_token(token);

  if (!data) {
    return res.status(200).json({ message: "Invalid or expired token" });
  }

  return res.status(200).json({
    message: "Token is valid",
    data: data,
  });
});

app.post("/verify_forget_otp_client", async (req, res) => {
  const { email, type, otp } = req.body;
  if (!email || !type || !otp) {
    return res
      .status(200)
      .json({ success: false, message: "Email and Otp are required" });
  }
  const storedOtp = get_otp(email, type);
  console.log(storedOtp);

  if (storedOtp === otp) {
    res
      .status(200)
      .json({ success: true, message: "otp verified successfully" });
  } else {
    res.status(200).json({ success: false, message: "error in verifying otp" });
  }
});

app.post("/client_password_verify", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(200)
      .json({ success: false, message: "password is required" });
  }

  try {
    const query = "UPDATE clients SET user_password = ? WHERE user_email = ?";
    db.query(query, [password, email], (err, result) => {
      if (err) {
        console.error("Database update error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      // Check if any rows were updated
      if (result.affectedRows > 0) {
        res
          .status(200)
          .json({ success: true, message: "Password updated successfully" });
      } else {
        res.status(404).json({ success: false, message: "Email not found" });
      }
    });
  } catch (error) {
    res.status(200).json({ success: false, message: "Server error" });
  }
});

app.post("/client_email_verify", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(200)
      .json({ success: false, message: "Email is required" });
  }

  const query = "SELECT * FROM clients WHERE user_email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      const otp = generate_otp(email, "client");
      console.log("generated otp ", otp);
      send_otp_page(email, otp);

      return res.status(200).json({ success: true, message: "Email exists" });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Email not found" });
    }
  });
});

app.post("/get_client_data_from_jwt", async (req, res) => {
  const jwt_token = req.body.jwt_token;

  if (!jwt_token) {
    console.error("get_user_data_from_jwt says: JWT token is required");
    return res.status(400).send("JWT token is required");
  }

  try {
    const userData = check_jwt_token(jwt_token);

    if (!userData || !userData.user_name || !userData.user_email) {
      return res.status(200).json({ error: "Invalid or incomplete JWT token" });
    }
    const find_user =
      "SELECT * FROM trevita_project_1.clients WHERE user_name = ? AND user_email = ?";

    db.query(
      find_user,
      [userData.user_name, userData.user_email],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User found", user: result[0] });
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/verify_otp_client", async (req, res) => {
  const { type, otp, user_name, email, password } = req.body;

  if (!email || !otp || !type) {
    error_message("verify_otp say : Email and OTP are required");
    return res.status(400).json({ error: "Email and OTP are required" });
  }
  try {
    let storedOtp;
    if (type == "owner") {
      storedOtp = get_otp(email, "owner");
    } else {
      storedOtp = get_otp(email, "client");
    }
    if (storedOtp && storedOtp === otp) {
      const insertQuery =
        "INSERT INTO clients (user_name, user_email, user_password) VALUES ( ?, ?, ?)";
      db.query(insertQuery, [user_name, email, password], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Database error" });
        }
        let token = create_jwt_token(email, user_name);
        res
          .status(200)
          .json({ message: "OTP verified successfully", user_key: token });
      });
    } else {
      res.status(200).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// Route for registration of client
app.post("/client/register_user", async (req, res) => {
  const { user_name, user_email, user_password } = req.body;
  console.log(user_email, user_name, user_password);

  try {
    // Check if the email already exists
    db.query(
      "SELECT * FROM trevita_project_1.clients WHERE user_email = ? OR user_name = ?",
      [user_email, user_name],
      (err, rows) => {
        if (err) {
          console.error("Database error", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (rows.length > 0) {
          if (rows.some((row) => row.user_email === user_email)) {
            return res.status(400).json({ error: "Email already exists" });
          }
          if (rows.some((row) => row.user_name === user_name)) {
            return res.status(400).json({ error: "Username already exists" });
          }
        }
        res.status(200).json({ staus: "user_name and email verified " });
      }
    );
  } catch (e) {
    console.error("Serverside error white registering user", e);
  }
});

// Route for login client
app.post("/client/login", (req, res) => {
  const { user_email, user_password } = req.body;

  if (!user_email || !user_password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const query =
    "SELECT * FROM trevita_project_1.clients WHERE user_email = ? AND user_password = ?";
  db.query(query, [user_email, user_password], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length > 0) {
      const user_name = results[0].user_name;
      const token = create_jwt_token(user_email, user_name);
      return res.status(200).json({
        message: "Login successful",
        user: results[0],
        jwt_token: token,
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  });
});
app.post("/api/get-user-data", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const query = `
    SELECT phone, address, gender
    FROM trevita_project_1.clients
    WHERE user_email = ?
  `;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).json({ message: "Failed to fetch user data." });
    }

    if (results.length > 0) {
      res.status(200).json(results[0]); // Send the first matching result
    } else {
      res.status(404).json({ message: "User data not found." });
    }
  });
});

app.post("/api/update-profile", (req, res) => {
  const { user_email, user_name, phone, address, gender } = req.body;

  if (!user_email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const query = `
    UPDATE trevita_project_1.clients
    SET user_name = ?, phone = ?, address = ?, gender = ?
    WHERE user_email = ?
  `;

    db.query(
      query,
      [user_name, phone, address, gender, user_email],
      (err, results) => {
        if (err) {
          console.error("Error updating profile:", err);
          return res.status(500).json({ message: "Failed to update profile." });
        }
        res
          .status(200)
          .json({ message: "Profile updated successfully!", results });
        console.log(results);
      }
    );
  } catch (err) {
    console.log("error updating data");
    res.status(500).json({ message: "Failed to update data" });
  }
});


// praharsh  End ----
// praharsh  End ----
// praharsh  End ----
// praharsh  End ----

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server is running. .. . . . .`);
});

