const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");
const { exec } = require("child_process")
var UserDetail = undefined;
var Public_ip = undefined;

app.use(express.static(path.join(__dirname,"Frontend")));

// for parsing application/json
app.use(bodyParser.json()); 
app.use(express.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.urlencoded({ extended: true }));

//database connectivity
mongoose.connect('mongodb://localhost:27017/mydb',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection
db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))

// Route for Homepage 
app.get("/", function (req,res) {   
    console.log("client ask for home page");
    res.sendFile(__dirname+"/HomePage.html");
});


// Route for serving Sign In
app.get("/SignIn", function (req,res) {   
    console.log("client ask for Login page");
    res.sendFile(__dirname+"/Login.html");

});

// Route for serving Sign Up
app.get("/SignUp", function (req,res) {   
    console.log("client ask for SignUp page");
    res.sendFile(__dirname+"/SignUp.html");
});


app.post("/createuser", (req, res) => {
    var UserEmail = req.body.mail;
    var data = {
        "FirstName": req.body.fname,
        "LastName": req.body.lname,
        "Email": req.body.mail,
        "mobile": req.body.mobile,
        "PassWord": req.body.pass
    }
    console.log(data);
    db.collection('users').findOne({ "Email": UserEmail }, (err, collection) => {
        if (err) {
            throw err;
        }
        if (collection == null) {
            db.collection('users').insertOne(data, (err, collection) => {
                if (err) {
                    throw err;
                }
                console.log("User registered Successfully.");
                res.json({ success: true });
            });
        } else {
            console.log("User already exists.");
            res.json({ success: false });
        }
    });
});


app.post("/login", (req, res) => {
    var UserEmail = req.body.mail;
    var Userpass = req.body.pass;
    db.collection('users').findOne({ "Email": UserEmail, "PassWord": Userpass }, (err, collection) => {
        UserDetail = collection;
        if (err) {
            res.status(500).json({ error: true, message: 'Internal Server Error' });
        }
        if (collection === null) {
            res.status(401).json({ error: true, message: 'Invalid email or password' });
        } else {
            res.json({ error: false });
        }
    });
});

app.get("/dashboard", (req, res) => {
    res.sendFile(__dirname + "/UserPortal.html");
});

app.get("/instances",(req,res)=>{
    res.sendFile(__dirname+"/UserInstance.html")
}
)
app.post("/Instanceinfo", (req, res) => {
    db.collection('instancess').find({"Email" : UserDetail.Email}).toArray().then(result => {
      console.log(result);
      res.send(result); // or do something with the result
    });
  });

app.post("/CurrentIp",(req,res)=>{
    res.send(Public_ip)
})


app.post("/consoleupdate", (req, res) => {
    const clientCommand = req.body.name;
    const command = `ssh -i MyKeyPair.pem ec2-user@${Public_ip} "${clientCommand}"`;
    console.log("Command:", command);
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("Error executing command:", err);
        res.send(`${stderr}`);
        return;
      }
      res.send(`${stdout}\n${stderr}`);
    });
  });

app.post("/dashbordinfo",(req,res)=>{
    console.log(UserDetail);
    res.send(UserDetail);
})

app.get("/createinstance",(req,res)=>{
    res.sendFile(__dirname+"/InstanceDetails.html")
}
)

app.post("/launchinstance", (req, res) => {
    const instdetail = req.body;
    exec(
      `aws ec2 run-instances --image-id ${instdetail.os} --count 1 --instance-type ${instdetail.instance_type} --key-name MyKeyPair --security-group-ids ${instdetail.access} --subnet-id ${instdetail.subid}`,
      (err, stdout, stderr) => {
        if (err) {
          console.error("Error launching instance:", err);
          res.status(500).send("Error launching instance");
          return;
        }
  
        let instanceId;
        try {
          const jsonData = JSON.parse(stdout);
          if (jsonData.Instances && jsonData.Instances.length > 0) {
            instanceId = jsonData.Instances[0].InstanceId;
          } else {
            console.log("No instances found in the output");
            res.status(500).send("No instances found in the output");
            return;
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
          res.status(500).send("Error parsing JSON");
          return;
        }
  
        console.log("InstanceId : ", instanceId);
        console.log("User Required Instance launched ");
  
        if (stderr) {
          console.log(stderr);
        }
  
        exec(
          `aws ec2 create-tags --resources ${instanceId} --tags Key=Name,Value=${instdetail.instname.split(' ').join('-')}`,
          (err, stdout, stderr) => {
            if (err) {
              throw err;
            }
  
            if (stdout) {
              console.log(stdout);
            }
  
            if (stderr) {
              console.log(stderr);
            }
  
            console.log("With Name ", instdetail.instname.split(' ').join('-'));
  
            const instancedata = {
              Email: UserDetail.Email,
              InstName: instdetail.instname.split(' ').join('-'),
              OS: instdetail.os,
              InstID: instanceId,
              type: instdetail.instance_type,
              sgid: instdetail.access,
              subnetid: instdetail.subid,
            };
  
            db.collection("instancess")
              .insertOne(instancedata, (err, collection) => {
                if (err) throw err;
                console.log("User Instance Details Saved Succ . . . . ");
                res.sendFile(__dirname + "/UserPortal.html");
              });
          }
        );
      }
    );
  });
    
  app.post("/runinstance", (req, res) => {
    const currentInstanceId = req.body.instanceid;
    exec(`aws ec2 describe-instances --instance-ids ${currentInstanceId} --query Reservations[].Instances[].PublicIpAddress`, (err, stdout, stderr) => {
      if (err) {
        console.error("Error executing command:", err);
        res.status(500).send("Error executing command");
        return;
      }
  
      if (stderr) {
        console.error("Error in executing command:", stderr);
        res.status(500).send("Error in executing command");
        return;
      }
  
      if (stdout) {
        try {
            Public_ip = JSON.parse(stdout)[0];
          console.log("Public IP:", Public_ip);
          res.sendFile(__dirname + "/UserInstance.html");
        } catch (error) {
          console.error("Error parsing JSON:", error);
          res.status(500).send("Error parsing JSON");
        }
      }
    });
  });



app.listen( 4000 ,()=>{
    console.log("server started !!! on port number 4000");
})