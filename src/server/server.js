const express = require('express');
const mysql = require('mysql2'); 
const cors = require("cors");
const app = express();

const shrey11_ = require('./sub_part/other_rout_shrey_11');
const adminRoutes = require('./sub_part/Admin_rout');
const team_members = require('./sub_part/team_members');
const ownerRoutes = require('./sub_part/owner_rout');
const ownerRoutes_v2 = require('./sub_part/owner_rout_v2');
const chartRoutes = require('./sub_part/chart_rout');
const reviews_rout = require('./sub_part/reviews_rout');

const calendarRoutes = require('./sub_part/calendar_rout');

const owner_drive_rout = require('./Google_Drive/owner_drive_rout');

// @shrey11_  start ---- 
// @shrey11_  start ---- 
// @shrey11_  start ---- 
// @shrey11_  start ---- 
// @shrey11_  start ----
app.use(express.json({ limit: '10mb' })); // Adjust limit as per your requirement
app.use(express.urlencoded({ extended: false, limit: '10mb' }))

app.use(express.json()); 
app.use(cors());

const { send_welcome_page, send_otp_page } = require('./modules/send_server_email');
const {server_request_mode, write_log_file, error_message, info_message, success_message,
      normal_message,create_jwt_token,check_jwt_token} = require('./modules/_all_help');

const { generate_otp, get_otp, clear_otp } = require('./modules/OTP_generate');



const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: '*', 
  },
});


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    io.emit('message', msg); 
  });

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

// print data in log
app.use((req, res, next) => {
    server_request_mode(req.method, req.url, req.body);
    next();
});
  
app.get("/",(req,res)=>{
    res.send("hi server user running page will be here '/' ")
});

// @shrey11_ other routes
app.use('/', shrey11_);

// admin routes
app.use('/Admin', adminRoutes);

// owner routes
app.use('/owner', ownerRoutes);
app.use('/owner_v2', ownerRoutes_v2);
app.use('/owner_drive', owner_drive_rout);

// owner routes
app.use('/chart', chartRoutes);

// team members routes
app.use('/team_members', team_members);

// reviews routes
app.use('/reviews', reviews_rout);

// calendar routes
app.use('/calendar', calendarRoutes);




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

app.put("/api/update_package", async (req, res) => {
  const {
    id,
    package_name,
    service,
    description,
    price,
    card_color,
    user_email,
  } = req.body;

  // Validate required fields
  if (!id || !user_email) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Extract the updated fields
  const updates = [];
  const values = [];

  if (package_name !== undefined) {
    updates.push("package_name = ?");
    values.push(package_name);
  }
  if (service !== undefined) {
    updates.push("service = ?");
    values.push(service);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (price !== undefined) {
    updates.push("price = ?");
    values.push(price);
  }
  if (card_color !== undefined) {
    updates.push("card_color = ?");
    values.push(card_color);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  const query = `
    UPDATE packages 
    SET ${updates.join(", ")} 
    WHERE id = ? AND user_email = ?
  `;
  values.push(id, user_email);

  try {
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error updating package:", err);
        return res.status(500).json({ error: "Failed to update package." });
      }

      if (result.affectedRows > 0) {
        res.status(200).json({
          message: "Package updated successfully!",
          updatedFields: updates.map((u) => u.split("=")[0].trim()),
        });
      } else {
        res.status(404).json({
          error:
            "Package not found or you do not have permission to update it.",
        });
      }
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Failed to update package." });
  }
});

app.post("/api/fetch_packages", (req, res) => {
  const { user_email } = req.body;
  const fetchQuery = `
    SELECT * FROM packages WHERE user_email = ?
  `;
  db.query(fetchQuery, [user_email], (err, rows) => {
    if (err) {
      console.error("Error fetching packages:", err);
      return res.status(500).json({ error: "Failed to fetch packages" });
    }
    res.json(rows);
  });
});

app.post("/api/packages", (req, res) => {
  const { package_name, service, description, price, user_email, card_color } =
    req.body;

  // Validate if the service field is a valid JSON string
  let servicesJson;
  try {
    servicesJson = JSON.stringify(service); // Convert object/array to JSON string
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON format for services" });
  }

  const insertQuery = `
    INSERT INTO packages (package_name, service, description, price,card_color, user_email)
    VALUES (?, ?, ?, ?, ?,?)
  `;

  db.query(
    insertQuery,
    [package_name, servicesJson, description, price, card_color, user_email],
    (err, result) => {
      if (err) {
        console.error("Error inserting package:", err);
        return res.status(500).json({ error: "Failed to add package" });
      }

      // Fetch the inserted package to confirm
      const fetchQuery = `
        SELECT * FROM packages WHERE id = ?
      `;
      db.query(fetchQuery, [result.insertId], (err, rows) => {
        if (err) {
          console.error("Error fetching inserted package:", err);
          return res.status(500).json({ error: "Failed to retrieve package" });
        }

        res.status(200).json({
          success: true,
          message: "Package added successfully",
          results: rows[0],
        });
      });
    }
  );
});
app.post("/save-draft-invoice", (req, res) => {
  const {
    invoice_id,
    invoice_to,
    invoice_to_address,
    invoice_to_email,
    date,
    sub_total,
    gst,
    total,
    user_email,
    items,
    as_draft,
  } = req.body;

  // Validate required fields
  if (!invoice_id || !user_email || !invoice_to || !as_draft) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Query to update the invoice
  const queryInvoice = `
    UPDATE invoices 
    SET 
      user_email = ?, 
      date = ?, 
      sub_total = ?, 
      gst = ?, 
      total = ?, 
      invoice_to = ?, 
      as_draft = ? 
    WHERE invoice_id = ?;
  `;

  // Update invoice details in the database
  db.query(
    queryInvoice,
    [
      user_email,
      date || null,
      sub_total || null,
      gst || null,
      total || null,
      invoice_to || null,
      as_draft,
      invoice_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: err.message });
      }

      // Handle items if any exist
      if (items && items.length > 0) {
        let totalItems = items.length;
        let completedItems = 0;
        let hasError = false;

        items.forEach((all_items) => {
          const { item, quantity, price, amount } = all_items;

          // Query to check if item already exists in invoice_items
          const queryCheckItemExists = `
            SELECT id FROM invoice_items 
            WHERE item = ? AND invoice_id = ?;
          `;

          // Query to insert a new item into invoice_items
          const queryInsertItem = `
            INSERT INTO invoice_items (
              invoice_id, user_email, item, quantity, price, amount, invoice_to_address, invoice_to_email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
          `;

          // Query to update an existing item in invoice_items
          const queryUpdateItem = `
            UPDATE invoice_items
            SET 
              quantity = ?, 
              price = ?, 
              amount = ?, 
              invoice_to_address = ?, 
              invoice_to_email = ? 
            WHERE id = ?;
          `;

          // Check if item exists
          db.query(queryCheckItemExists, [item, invoice_id], (err, results) => {
            if (err) {
              console.error("Error checking if item exists:", err);
              if (!hasError) {
                hasError = true;
                return res.status(500).json({ error: err.message });
              }
              return;
            }

            if (results.length > 0) {
              const itemId = results[0].id;
              // Update existing item
              db.query(
                queryUpdateItem,
                [
                  quantity,
                  price,
                  amount,
                  invoice_to_address,
                  invoice_to_email,
                  itemId,
                ],
                (err) => {
                  if (err) {
                    console.error("Error updating item:", err);
                    if (!hasError) {
                      hasError = true;
                      return res.status(500).json({ error: err.message });
                    }
                    return;
                  }
                  completedItems++;
                  if (completedItems === totalItems && !hasError) {
                    res.json({
                      message: "Invoice and items updated successfully",
                      invoice_id,
                      date,
                      invoiceResult: result,
                    });
                  }
                }
              );
            } else {
              // Insert new item
              db.query(
                queryInsertItem,
                [
                  invoice_id,
                  user_email,
                  item,
                  quantity,
                  price,
                  amount,
                  invoice_to_address,
                  invoice_to_email,
                ],
                (err) => {
                  if (err) {
                    console.error("Error inserting item:", err);
                    if (!hasError) {
                      hasError = true;
                      return res.status(500).json({ error: err.message });
                    }
                    return;
                  }
                  completedItems++;
                  if (completedItems === totalItems && !hasError) {
                    res.json({
                      message: "Invoice and items added/updated successfully",
                      invoice_id,
                      date,
                      invoiceResult: result,
                    });
                  }
                }
              );
            }
          });
        });
      } else {
        // No items to handle, send response
        res.json({
          message: "Invoice with draft added successfully",
          invoice_id,
          date,
          result,
        });
      }
    }
  );
});


app.post("/add-draft-as-invoice", (req, res) => {
  const {
    invoice_id,
    invoice_to,
    invoice_to_address,
    invoice_to_email,
    date,
    sub_total,
    gst,
    total,
    user_email,
    items,
    as_draft,
  } = req.body;

  if (!date) {
    return res.status(400).json({ error: "Date is required." });
  }

  // Insert or update the invoice in the invoices table
  const queryInvoice = `
    UPDATE invoices
    SET 
      date = ?, 
      sub_total = ?, 
      gst = ?, 
      total = ?, 
      invoice_to = ?, 
      as_draft = ?
    WHERE invoice_id = ? AND user_email = ?
  `;

  db.query(
    queryInvoice,
    [date, sub_total, gst, total, invoice_to, as_draft, invoice_id, user_email],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: err.message });
      }

      if (items && items.length > 0) {
        const queryCheckItemExists = `
          SELECT id FROM invoice_items 
          WHERE item = ? AND invoice_id = ?;
        `;

        const queryInsertItem = `
          INSERT INTO invoice_items (
            invoice_id, user_email, item, quantity, price, amount, invoice_to_address, invoice_to_email
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const queryUpdateItem = `
          UPDATE invoice_items
          SET 
            quantity = ?, 
            price = ?, 
            amount = ?, 
            invoice_to_address = ?, 
            invoice_to_email = ?
          WHERE id = ?;
        `;

        let completedItems = 0;
        let errorsOccurred = false;

        // Loop through items and insert or update them
        items.forEach((all_items) => {
          const { item, quantity, price, amount } = all_items;

          // Step 1: Check if the item already exists in the invoice_items table
          db.query(queryCheckItemExists, [item, invoice_id], (err, results) => {
            if (err) {
              console.error("Error checking if item exists:", err);
              return res.status(500).json({ error: err.message });
            }

            if (results.length > 0) {
              // Step 2: If the item exists, update it
              const itemId = results[0].id;
              db.query(
                queryUpdateItem,
                [
                  quantity,
                  price,
                  amount,
                  invoice_to_address,
                  invoice_to_email,
                  itemId,
                ],
                (err, updateResult) => {
                  if (err) {
                    console.error("Error updating item:", err);
                    errorsOccurred = true;
                    return res.status(500).json({
                      error: "Error updating item",
                      details: err.message,
                    });
                  }
                  completedItems++;
                  if (completedItems === items.length && !errorsOccurred) {
                    res.json({
                      message: "Draft invoice and items updated successfully",
                      invoice_id,
                      date,
                      invoiceResult: result,
                    });
                  }
                }
              );
            } else {
              // Step 3: If the item doesn't exist, insert it as a new entry
              db.query(
                queryInsertItem,
                [
                  invoice_id,
                  user_email,
                  item,
                  quantity,
                  price,
                  amount,
                  invoice_to_address,
                  invoice_to_email,
                ],
                (err, insertResult) => {
                  if (err) {
                    console.error("Error inserting item:", err);
                    errorsOccurred = true;
                    return res.status(500).json({
                      error: "Error inserting item",
                      details: err.message,
                    });
                  }
                  completedItems++;
                  if (completedItems === items.length && !errorsOccurred) {
                    res.json({
                      message:
                        "Draft invoice and items added or updated successfully",
                      invoice_id,
                      date,
                      invoiceResult: result,
                    });
                  }
                }
              );
            }
          });
        });
      } else {
        // If no items are provided, send response for the invoice
        res.json({
          message: "Draft invoice added successfully",
          invoice_id,
          date,
          result,
        });
      }
    }
  );
});

app.post("/get-invoice-items", (req, res) => {
  const { invoice_id, user_email } = req.body;

  const queryItems =
    "SELECT * FROM trevita_project_1.invoice_items WHERE invoice_id = ? AND user_email = ?";

  db.query(queryItems, [invoice_id, user_email], (err, items) => {
    if (err) {
      return res.status(500).json({
        error: "Database error",
        details: err,
      });
    }

    if (items && items.length > 0) {
      console.log("items", items);
      res.status(200).json({
        success: true,
        items: items,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No items found for this invoice",
      });
    }
  });
});

app.post("/api/delete-invoice", (req, res) => {
  const { invoice_id, user_email } = req.body;

  if (!invoice_id && !user_email) {
    return res
      .status(400)
      .json({ success: false, message: "Invoice ID is required." });
  }

  const deleteQuery =
    "DELETE FROM invoices WHERE invoice_id = ? and user_email = ?";
  console.log("Delete Query", deleteQuery);
  db.query(deleteQuery, [invoice_id, user_email], (err, result) => {
    if (err) {
      console.error("Error deleting invoice:", err);
      return res
        .status(200)
        .json({ success: false, message: "Failed to delete invoice." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found." });
    }

    res.json({ success: true, message: "Invoice deleted successfully." });
  });
});

app.post("/save-draft", (req, res) => {
  const {
    invoice_id,
    invoice_to,
    invoice_to_address,
    invoice_to_email,
    date,
    sub_total,
    gst,
    total,
    user_email,
    items,
    as_draft,
  } = req.body;

  if (!invoice_id || !user_email || !invoice_to || !as_draft) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Insert the invoice into the invoices table
  const queryInvoice = `INSERT INTO invoices (
    invoice_id, user_email, date, sub_total, gst, total, invoice_to,as_draft
  ) VALUES (?, ?, ?, ?, ?, ?, ?,?);`;

  db.query(
    queryInvoice,
    [
      invoice_id,
      user_email,
      date || null,
      sub_total || null,
      gst || null,
      total || null,
      invoice_to || null,
      as_draft,
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: err.message });
      }

      // Once the invoice is inserted, insert the items into the items table
      if (items && items.length > 0) {
        let completedItems = 0;

        items.forEach((all_items) => {
          const { item, quantity, price, amount } = all_items;

          const queryItem = `INSERT INTO invoice_items (
            invoice_id,user_email, item, quantity, price, amount, invoice_to_address, invoice_to_email
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

          db.query(
            queryItem,
            [
              invoice_id,
              user_email,
              item,
              quantity,
              price,
              amount,
              invoice_to_address,
              invoice_to_email,
            ],
            (err, itemResult) => {
              if (err) {
                console.error("Error inserting item:", err);
                return res.status(500).json({
                  error: "Error inserting item",
                  details: err.message,
                });
              }

              completedItems++;

              // Only proceed when all items have been inserted
              if (completedItems === items.length) {
                // Update the invoice ID counter
                db.query(
                  "UPDATE owner_main_invoice SET max_invoice_id = max_invoice_id + 1 WHERE user_email = ?",
                  [user_email],
                  (err, updateResult) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).json({
                        error: "Error updating invoice ID",
                        details: err.message,
                      });
                    }

                    // Send the final response after everything is complete
                    res.json({
                      message: "Invoice items with draft added successfully",
                      invoice_id,
                      date: date,
                      invoiceResult: result,
                    });
                  }
                );
              }
            }
          );
        });
      } else {
        // If no items are provided, just send the invoice response
        res.json({
          message: "Invoice with draft added successfully",
          invoice_id,
          date: date,
          result,
        });
      }
    }
  );
});

app.post("/check_email_owner", (req, res) => {
  const { user_email } = req.body;
  const query =
    "SELECT * FROM trevita_project_1.owner_main_invoice WHERE user_email = ?";

  db.query(query, [user_email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length > 0) {
      return res.json(result);
    } else {
      const insertQuery =
        "INSERT INTO trevita_project_1.owner_main_invoice (user_email, max_invoice_id) VALUES (?, 0)";
      db.query(insertQuery, [user_email], (insertErr, insertResult) => {
        if (insertErr) {
          console.log("insertErr", insertErr);
          return res.status(200).json({ error: insertErr.message });
        }
        console.log("insertResult", insertResult);
        return res.json([
          {
            user_email: user_email,
            max_id: 0,
            message: "new record created",
          },
        ]);
      });
    }
  });
});

app.post("/generate-invoice", (req, res) => {
  const { user_email } = req.body;

  // Query to get the maximum invoice ID
  const query =
    "SELECT  max_invoice_id FROM owner_main_invoice WHERE user_email = ?";

  db.query(query, [user_email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    let maxInvoiceId = results[0]?.max_invoice_id || 0;

    const newInvoiceId = parseInt(maxInvoiceId) + 1;

    // Send the response
    res.json({ invoice_id: newInvoiceId });
  });
});

app.post("/invoice-items", (req, res) => {
  const { invoice_id, user_email } = req.body;
  const query =
    "SELECT * FROM trevita_project_1.invoice_items WHERE invoice_id = ? AND user_email = ?";
  db.query(query, [invoice_id, user_email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/add-invoice", (req, res) => {
  const {
    invoice_id,
    invoice_to,
    invoice_to_address,
    invoice_to_email,
    date,
    sub_total,
    gst,
    total,
    user_email,
    items,
  } = req.body;

  if (!date) {
    return res.status(400).json({ error: "Date is required." });
  }

  // Insert the invoice into the invoices table
  const queryInvoice = `INSERT INTO invoices (
    invoice_id, user_email, date, sub_total, gst, total, invoice_to,as_draft
  ) VALUES (?, ?, ?, ?, ?, ?, ?,0);`;

  db.query(
    queryInvoice,
    [invoice_id, user_email, date, sub_total, gst, total, invoice_to],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: err.message });
      }

      if (items && items.length > 0) {
        let completedItems = 0;

        items.forEach((all_items) => {
          const { item, quantity, price, amount } = all_items;

          const queryItem = `INSERT INTO invoice_items (
            invoice_id,user_email, item, quantity, price, amount, invoice_to_address, invoice_to_email
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

          db.query(
            queryItem,
            [
              invoice_id,
              user_email,
              item,
              quantity,
              price,
              amount,
              invoice_to_address,
              invoice_to_email,
            ],
            (err, itemResult) => {
              if (err) {
                console.error("Error inserting item:", err);
                return res.status(500).json({
                  error: "Error inserting item",
                  details: err.message,
                });
              }

              completedItems++;

              if (completedItems === items.length) {
                db.query(
                  "UPDATE owner_main_invoice SET max_invoice_id = max_invoice_id + 1 WHERE user_email = ?",
                  [user_email],
                  (err, updateResult) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).json({
                        error: "Error updating invoice ID",
                        details: err.message,
                      });
                    }

                    // Send the final response after everything is complete
                    res.json({
                      message: "Invoice and items added successfully",
                      invoice_id,
                      date: date,
                      invoiceResult: result,
                    });
                  }
                );
              }
            }
          );
        });
      } else {
        // If no items are provided, just send the invoice response
        res.json({
          message: "Invoice added successfully",
          invoice_id,
          date: date,
          result,
        });
      }
    }
  );
});

app.post("/invoices/without-draft", (req, res) => {
  const { user_email } = req.body;

  // Query for invoices without drafts
  const queryWithoutDraft =
    "SELECT * FROM trevita_project_1.invoices WHERE user_email = ? AND as_draft = 0 ORDER BY id";

  // Execute the query
  db.query(queryWithoutDraft, [user_email], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });

    // Send the response with invoices without drafts
    res.status(200).json({ without_draft: result });
  });
});

app.post("/invoices/with-draft", (req, res) => {
  const { user_email } = req.body;

  // Query for invoices with drafts
  const queryWithDraft =
    "SELECT * FROM trevita_project_1.invoices WHERE user_email = ? AND as_draft = 1 ORDER BY id";

  // Execute the query
  db.query(queryWithDraft, [user_email], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });

    // Send the response with invoices with drafts
    res.status(200).json({ with_draft: result });
  });
});

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


app.post("/get-invoice-items", (req, res) => {
  const { invoice_id, user_email } = req.body;

  const queryItems =
    "SELECT * FROM trevita_project_1.invoice_items WHERE invoice_id = ? AND user_email = ?";

  db.query(queryItems, [invoice_id, user_email], (err, items) => {
    if (err) {
      return res.status(500).json({
        error: "Database error",
        details: err,
      });
    }

    if (items && items.length > 0) {
      console.log("items", items);
      res.status(200).json({
        success: true,
        items: items,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No items found for this invoice",
      });
    }
  });
});


// praharsh  End ----
// praharsh  End ----
// praharsh  End ----
// praharsh  End ----

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server is running. .. . . . .`);
});

