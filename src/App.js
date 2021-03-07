import React, { useEffect, useState, useRef } from "react";
import logo from "./logo.svg";
import {
  TextField,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
} from "@material-ui/core";
import './App.css'
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";
import { blue } from "@material-ui/core/colors";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
// import * as tf from "@tensorflow/tfjs-core";
import * as tf from "@tensorflow/tfjs";
// import {loadGraphModel} from '@tensorflow/tfjs-converter';

// import * as posenet from '@tensorflow-models/posenet';
import Webcam from "react-webcam";
import { createWorker,createScheduler  } from 'tesseract.js';
// import * as cvstfjs from '@microsoft/customvision-tfjs';


function App() {
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }));
  const classes = useStyles();

  const url = {
    model:
      // "https://orangerx.b-cdn.net/model/model.json",

      "https://orangerx.b-cdn.net/tfjsModel/model.json",
  };
  const [start, setStart] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const webcamRef = React.useRef(null);

  const [videoWidth, setVideoWidth] = useState(960);
  const [videoHeight, setVideoHeight] = useState(640);
  const [predictionData, setPredictionData] = useState("");
  const [imageData, setImageData] = useState("./photo.jpg");

  const [ocr, setOcr] = useState("Recognizing...");

  const mounted = useRef(false);
  const [model, setModel] = useState();

 

  
  async function loadModel() {
    try {

      const model = await cocoSsd.load();
      setModel(model);
      console.log("setloadedModel")
    } catch (err) {
      console.log(err);
      console.log("failed load model")

    }


  }

  
  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);


  async function predictionFunction() {
    const predictions = await model.detect(
      document.getElementById("img")
    );
 setVideoHeight(webcamRef.current.video.videoHeight);
     setVideoWidth(webcamRef.current.video.videoWidth);
     var cnvs = document.getElementById("myCanvas");

      // cnvs.style.position = "absolute";
 
     var ctx = cnvs.getContext("2d");
     ctx.clearRect(0, 0, webcamRef.current.video.videoWidth, webcamRef.current.video.videoHeight);

    if (predictions.length > 0) {
    
      setPredictionData(predictions);
      console.log(predictions);
        for (let n = 0; n < predictions.length; n++) {
        // Check scores
        console.log(n)
        if (predictions[n].score > 0.8) {
         
          let bboxLeft =
            predictions[n].bbox[0] ;
          let bboxTop =
            predictions[n].bbox[1] ;
          let bboxWidth =
            predictions[n].bbox[2];
          let bboxHeight =
            predictions[n].bbox[3] -
            bboxTop;

          console.log("bboxLeft: " + bboxLeft);
          console.log("bboxTop: " + bboxTop);

          console.log("bboxWidth: " + bboxWidth);

          console.log("bboxHeight: " + bboxHeight);

          ctx.beginPath();
          ctx.font = "28px Arial";
          ctx.fillStyle = "red";

          ctx.fillText(
            predictions[n].class +
              ": " +
              Math.round(parseFloat(predictions[n].score) * 100) +
              "%",
            bboxLeft,
            bboxTop 
          );

          ctx.rect(bboxLeft, bboxTop , bboxWidth, bboxHeight);
          ctx.strokeStyle = "#FF0000";

          ctx.lineWidth = 3;
          ctx.stroke();

          console.log("detected");
        }
      }
  
    }
    
  

    setTimeout(() => predictionFunction(), 500);

  }


  useEffect(() => {
    //prevent initial triggering
    if (mounted.current) {
      predictionFunction();
   
    } else {
      mounted.current = true;
    }
  }, [start]);



  useEffect(()=>{
    //prevent initial triggering
    if (mounted.current) {
      // predictionFunction()
    } else {
      mounted.current = true;
    }
   
  }, [start])
 
  const videoConstraints = {
    height: 1080,
    width: 1920,
    // height: 120,
    facingMode: "environment",
  };


   
 



  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        marginTop: -8,
        backgroundImage:
          "radial-gradient( circle 993px at 0.5% 50.5%,  rgba(137,171,245,0.37) 0%, rgba(245,247,252,1) 100.2% )",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Pill Detection
          </Typography>
        </Toolbar>
      </AppBar>

      <Box mt={1} />
      <Grid
        container
        style={{
          height: "100vh",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          padding: 20,
        }}
      >
        <Grid
          item
          xs={12}
          md={12}
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
        
            <>
              {" "}
              <Typography
                align="center"
                style={{
                  fontSize: "50px",
                  fontWeight: "bold",
                  fontFamily: "Roboto",
                }}
              >
               {ocr}
              </Typography>
             
              <Box mt={2} />
              { (
                <Button
                  variant={"contained"}
                  style={{
                    color: "white",
                    backgroundColor: "blueviolet",
                    width: "50%",
                    maxWidth: "250px",
                  }}
                  onClick={() => {
                    predictionFunction()

                  }}
                >
                  Start Game
                </Button>
              )}
              <Box mt={2} />{" "}
            </>
            <div style={{position:"absolute" ,top: "400px", zIndex:"9999"}}>  

        <canvas
          id="myCanvas"
          width={videoWidth}
          height={videoHeight}
          style={{ backgroundColor: "transparent" }}
        />
        </div>
        <div style={{position:"absolute" ,top: "400px"}}>  
        {/* <img
          style={{ width: videoWidth, objectFit: "fill" }}
          id="img"
          src={imageData}
        ></img>  */}
        <Webcam
        audio={false}
        id="img2"
        ref={webcamRef}
        // width={640}
        screenshotQuality={1}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
              </div>
             
       
        </Grid>
        <Grid item xs={12} md={12}>
         
        </Grid>
      </Grid>
     
      
    </div>
  );
}

export default App;
