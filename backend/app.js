"use strict";
var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _bodyParser = _interopRequireDefault(require("body-parser"));
var _mongoose = _interopRequireDefault(require("mongoose"));

//var _data = _interopRequireDefault(require("./models/data.js"));

function _interopRequireDefault(obj) { return obj && obj._esModule ? obj : { default: obj }; }
//import data from './models/data.js';

const multipart = require('connect-multiparty');

var mongo = require('mongodb');

var MongoClient = require('mongodb').MongoClient;

//var mongoURL =  process.env["MONGO_URL"]; // || "mongodb://localhost:27017/"

var mongoURL = "mongodb://127.0.0.1:27017/" //Local MongoDB

//var mongoURL = "mongodb://mongo:27017/" //Local MongoDB Docker (mongo)
//set NODE_OPTIONS=--openssl-legacy-provider
//export NODE_OPTIONS=--openssl-legacy-provider
//mhm

//*****For docker****////
//var mongoURL = 

//console.log(mongoURL);

const PORT = process.env.PORT || 3001;
console.log("Port: ");
console.log(PORT)
const BASE_ROUTE = "openlair"; //var url = "mongodb://localhost:27017/";

const app = (0, _express.default)();

const router = _express.default.Router();

app.use((0, _cors.default)());
app.use(_bodyParser.default.json()); // app.use((req, res, next)=>{  
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(  
//     "Access-Control-Allow-Headers",  
//     "Origin, X-Requested-With, Content-Type, Accept");
//     res.setHeader("Access-Control-Allow-Methods",  
//     "GET, POST, PATCH, DELETE, OPTIONS");
//   next();  
// }); 


MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
  if (err) throw err;
  var db = db.db("mydb1");  // database name
  console.log("Mongodb connected successfully");

  ///////////// Authentication /////////////////

  router.route('/login').post((req, res) => {
    console.log('abc')
    var username = req.body.username;
    var password = req.body.password;

    db.collection("login").findOne({
      username: username,
      password: password
    }, function (err, user) {
      if (err) {
        console.log(err);
      }
      if (!user) {
        console.log('User not found');
        return res.send('User not found')
        // return res.status(404).send();
      }
      return res.status(200).send(user);
    })
  })

  /////////////Instruction for data display/////////////////

  router.route('/display/data').get((req, res) => {

    db.collection("treeStructure").find({}).toArray((err, data) => {
      if (err)
        console.log(err);
      else
        res.json(data);
    })

  });

  ////////////////Read text from pdf //////////////

  var fs = require('fs');
 

  /////////////Instruction for search data/////////////////

  router.route('/getsearchmetrics').post((req, res) => {
    const metrics_name = req.body.search;


    db.collection("treeStructure").find({ 'LearningActivities.indicator.metrics': new RegExp(metrics_name) }).toArray(function (error, documents) {
      if (err) throw error;

      res.send(documents);
    });
  });


  router.route('/getsearchindicator').post((req, res) => {
    const search_ind = req.body.search;


    db.collection("treeStructure").find({ 'LearningActivities.indicator.indicatorName': { $regex: new RegExp(search_ind, "i") } }).toArray(function (error, result) {
      if (err) throw error;

      res.send(result);
    });
  });

  router.route('/getsearchcomment').post((req, res) => {
    // Extrahieren Sie den Suchbegriff aus der Anfrage (angenommen, er wird als Query-Parameter übergeben)
    const searchTerm = req.query.term;

    // Führen Sie eine Datenbanksuche durch, um Kommentare basierend auf dem Suchbegriff zu finden
    db.collection("treeStructure").find({ 'LearningActivities.indicator.comment.text': { $regex: searchTerm, $options: 'i' } // Dies sucht nach Kommentaren, die den Suchbegriff enthalten (case-insensitive)
    }).toArray((error, results) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.status(200).send(results);
    });
});

  db.collection("treeStructure").updateMany({ indicator: 'oldValue' }, { $set: { indicator: 'newValue' } }, (err, result) => {
    if (err) throw err;
    console.log("Daten erfolgreich aktualisiert");
    MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }).close();
  });


  /////////////Instruction for data addition/////////////////
  ///////****Add the indicator and metrics to all the similar learning activities AS similar activties can be found in multiple Events ******/
  router.route('/add/data').post((req, res) => {
    let currentEvent = req.body.LearningEvents;
    let currentActivity = req.body.LearningActivities.Name;
    let newIndicatorMetrics = req.body.LearningActivities.indicator;
      db.collection("treeStructure").find({
        'LearningActivities.Name': currentActivity
      }).toArray(function (error, filterAct) {
        if (!error) {
          if (filterAct) {
           // let val = Object.keys(filterAct).length;
           // if(val > 1)
           // {
              let i = 0;
              //let allEvents = ;
              Object.values(filterAct).forEach(val => {
                //console.log("Event: ", val.LearningEvents);
                const eventIndex = i++;
                let position = filterAct[eventIndex].LearningActivities.findIndex(item => item.Name == currentActivity);
                const str1 = 'LearningActivities';
                const learningAct = str1.concat(".", position, ".", "indicator");
                db.collection("treeStructure").updateOne({
                  LearningEvents: val.LearningEvents
                }, {
                  $push: {
                    [learningAct]: {
                      "indicatorName": newIndicatorMetrics[0].indicatorName,
                      "metrics": newIndicatorMetrics[0].metrics
                    }
                  }
                }, {
                  upsert: false,
                  multi: true
                },
                function (err, res) {
                  if (err) throw err;
                });
              });
           // }
            // else {
            // const eventIndex = filterAct.findIndex(element => element.LearningEvents === currentEvent);
            // let position = filterAct[eventIndex].LearningActivities.findIndex(item => item.Name == currentActivity);
            // const str1 = 'LearningActivities';
            // const learningAct = str1.concat(".", position, ".", "indicator");
            // db.collection("treeStructure").updateOne({
            //   LearningEvents: currentEvent
            // }, {
            //   $push: {
            //     [learningAct]: {
            //       "indicatorName": newIndicatorMetrics[0].indicatorName,
            //       "metrics": newIndicatorMetrics[0].metrics
            //     }
            //   }
            // }, {
            //   upsert: false,
            //   multi: true
            // },
            //   function (err, res) {
            //     if (err) throw err;
            //   });
            // }
          }
        }
      });
  });


  //****Add exactly what is selected by user ******/

  // router.route('/add/data').post((req, res) => {
  //   let currentEvent = req.body.LearningEvents;
  //   let currentActivity = req.body.LearningActivities.Name;
  //   let newIndicatorMetrics = req.body.LearningActivities.indicator;
  //     db.collection("treeStructure").find({
  //       'LearningActivities.Name': currentActivity
  //     }).toArray(function (error, filterAct) {
  //       if (!error) {
  //         if (filterAct) {
  //           const eventIndex = filterAct.findIndex(element => element.LearningEvents === currentEvent);
  //           let position = filterAct[eventIndex].LearningActivities.findIndex(item => item.Name == currentActivity);
  //           const str1 = 'LearningActivities';
  //           const learningAct = str1.concat(".", position, ".", "indicator");
  //           db.collection("treeStructure").updateOne({
  //             LearningEvents: currentEvent
  //           }, {
  //             $push: {
  //               [learningAct]: {
  //                 "indicatorName": newIndicatorMetrics[0].indicatorName,
  //                 "metrics": newIndicatorMetrics[0].metrics
  //               }
  //             }
  //           }, {
  //             upsert: false,
  //             multi: true
  //           },
  //             function (err, res) {
  //               if (err) throw err;
  //             });
  //         }
  //       }
  //     });
  // });



});

//////////////Instruction for data editing/////////////////

router.route('/edit/data').post((req, res) => {
  // Ihre Logik zum Bearbeiten von Daten
  
});


router.route('/save-changes', (req, res) => {
  
});




app.get("/" + BASE_ROUTE, (req, res) => res.send('HELLO! From Backend'));
app.use("/" + BASE_ROUTE, router);
app.listen(PORT, () => console.log(`Express server is running on port ${PORT}`)
);