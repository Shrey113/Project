const express = require('express');
const mysql = require('mysql2'); 
const cors = require("cors");
const app = express();

const shrey11_ = require('./sub_part/other_rout_shrey_11');
const praharsh_routes = require("./sub_part/praharsh_routes");
const adminRoutes = require('./sub_part/Admin_rout');
const team_members = require('./sub_part/team_members');
const ownerRoutes = require('./sub_part/owner_rout');
const ownerRoutes_v2 = require('./sub_part/owner_rout_v2');
const chartRoutes = require('./sub_part/chart_rout');
const reviews_rout = require('./sub_part/reviews_rout');

const calendarRoutes = require('./sub_part/calendar_rout');

// @shrey11_  start ---- 
// @shrey11_  start ---- 
app.use(express.json({ limit: '10mb' })); 
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

// owner routes
app.use('/chart', chartRoutes);

// team members routes
app.use('/team_members', team_members);

// reviews routes
app.use('/reviews', reviews_rout);

// calendar routes
app.use('/calendar', calendarRoutes);


app.post('/add_profile_by_email', (req, res) => {
  const { email,business_profile_base64,user_profile_image_base64 } = req.body;
  console.log(email);
  db.query(`SELECT * FROM owner WHERE user_email = ?`, [email], (err, result) => {
    if (err) {
      console.error('Error fetching photographer data:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Photographer not found' });
    }


    db.query(`Update owner set business_profile_base64 = ?, user_profile_image_base64 = ? where user_email = ?`, [business_profile_base64, user_profile_image_base64, email], (err, result) => {
      if (err) {
        console.error('Error adding photographer profile:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      db.query(`SELECT * FROM owner WHERE user_email = ?`, [email], (err, result) => {
        if (err) {
          console.error('Error fetching photographer data:', err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(result);
      });

    });
  });
});



// @shrey11_  End ---- 
// @shrey11_  End ---- 

// @praharsh  start ----
// @praharsh  start ----
app.use("/", praharsh_routes);
// praharsh  End ----
// praharsh  End ----


const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server is running. .. . . . .`);
});

