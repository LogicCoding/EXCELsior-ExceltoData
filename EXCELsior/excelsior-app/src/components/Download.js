import React, { useState, useEffect } from "react";
import { Stepper, Step } from "react-form-stepper";
import { MdDescription } from "react-icons/md";
import StepWizard from "react-step-wizard";
import { Row, Col, Button, FormGroup, Label, Input } from "reactstrap";
import axios from "axios";

const backend_url = 'http://127.0.0.1:3010'

const ActionButtons = (props) => {
  const handleBack = () => {
    props.previousStep();
  };

  const handleNext = () => {
    props.nextStep();
  };

  const handleFinish = () => {
    props.lastStep();
  };

  return (
    <div>
      <Row>
        {props.currentStep > 1 && (
          <Col>
            <Button className="ActionButtons" onClick={handleBack}>Back</Button>
          </Col>
        )}
        <Col>
          {props.currentStep < props.totalSteps && (
            <Button className="ActionButtons" onClick={handleNext}>Next</Button>
          )}
          {props.currentStep === props.totalSteps && (
            <Button className="ActionButtons" onClick={handleFinish}>Finish</Button>
          )}
        </Col>
      </Row>
    </div>
  );
};

const Base = (props) => {
  const [info0, setInfo0] = useState({});
  const [error, setError] = useState("");

  const onBtnClick = (event) => {
    const targetName = event.target.name;
    const targetValue = event.target.value;

    setInfo0((info0) => ({
      ...info0,
      [targetName]: targetValue
    }));
  };

  const validate = () => {
    if (!info0.path) setError("Upload or Download Required");
    else {
      setError("");
      props.nextStep();
      props.userCallback(info0)

    }
  };

  return (
    <div className="FormGroup">
      <span style={{ color: "red" }}>{error}</span>
      <h1>Welcome to ExcelSior</h1>
      <h2>In order to begin, please choose to Download or Upload</h2>
      <FormGroup>
        <Label></Label>
        <Button className="Buttons" name="path" value="Upload" onClick={onBtnClick}>Upload</Button>{' '}
        <Button className="Buttons" name="path" value="Download" onClick={onBtnClick}>Download</Button>
      </FormGroup>
      <br />
      <ActionButtons {...props} nextStep={validate}/>
    </div>
  );
};

const One = (props) => {
  console.log("ONE: ", props.user);
  const [info1, setInfo1] = useState({});
  const [error, setError] = useState("");

  const onInputChanged = (event) => {
    const targetName = event.target.name;
    const targetValue = event.target.value;

    setInfo1((info1) => ({
      ...info1,
      [targetName]: targetValue
    }));
  };

  const validate = async () => {
    if (!info1.url) setError("Database URL Required");
    else {
      setError("");
      await axios.get(backend_url + '/classes', {params: {'endpointUrl': info1.url}})
      .then(res => {
        const classesGet = res.data;
        //console.log("found get");
        //console.log(classesGet);
        info1["classes"] = classesGet;
        props.nextStep();
        props.userCallback(info1);
        console.log("PostUserCallBack1", info1);
      })
    }
  };

  return (
    <div className="FormGroup">
      <span style={{ color: "red" }}>{error}</span>
      <h1>Welcome to ExcelSior: Download</h1>
      <h2>In order to begin, please enter a valid Database URL.</h2>
      <FormGroup>
        <Label></Label>
        <Input
          type="text"
          name="url"
          placeholder="Enter a URL"
          onChange={onInputChanged}
          className="FormInput"
        />
      </FormGroup>
      <br />
      <ActionButtons {...props} nextStep={validate}/>
    </div>
  );
};

const Two = (props) => {
  console.log("TWO:", props.user);
  const [info2, setInfo2] = useState({});
  const [error, setError] = useState("");
  //const json = JSON.stringify({endpointUrl: props.user.url})
  //console.log(json)

  
  const onInputChanged = (event) => {
    const targetName = event.target.name;
    const targetValue = event.target.value;

    setInfo2((info2) => ({
      ...info2,
      [targetName]: targetValue
    }));
  };

  const validate2 = () => {
    if (info2.class) setError("Class must be selected.");
    else {
      setError("");
      console.log("Props.User at Validate2", props.user);
      axios.get(backend_url + '/properties', {params: {'endpointUrl': props.user.url, 'classURI': props.user.class}})
      .then(res => {
        const attributesGet = res.data;
        console.log("AttributesGet: ", attributesGet)
        info2["attributes"] = attributesGet;
        props.nextStep();
        props.userCallback(info2);
        console.log("PostUserCallBack2", info2);
      })
    }
  };

  const handleChange = (event) => {
    props.user.class = event.target.value
  }

  return (
    <div>
      <span style={{ color: "red" }}>{error}</span>
      <h1>ExcelSior: {props.user.path}</h1>
      <h2>Please select the corresponding class you would like to query.</h2>

      <FormGroup className="FormGroup">
        <Label className="Label">
          Provided Database: <b className="Label">{props.user.url || ""}</b>
        </Label>
      </FormGroup>
      <FormGroup>
      <Label>Select</Label>
        <Input type="select" name="class" onChange={handleChange}>
          {props.user.classes? props.user.classes.map(option => (
            <option key={option.URI} value={option.URI}>
              {option.URI}
            </option>
          )): ""}
        </Input>
        </FormGroup>
      <br />
      <ActionButtons {...props} nextStep={validate2} />
    </div>
  );
};

const Three = (props) => {
    console.log("THREE:", props.user)
    const [info3, setInfo3] = useState({});
    const [error, setError] = useState("");


    const onInputChanged = (event) => {
      const targetName = event.target.name;
      const targetValue = event.target.value;
  
      setInfo3((info3) => ({
        ...info3,
        [targetName]: targetValue
      }));
    };
  
    const validate3 = () => {
      if (info3.age) setError("Attribute must be selected.");
      else {
        setError("");
        console.log("Validate3", props.user.properties);
        axios.get(backend_url + '/csv', {params: {'endpointUrl': props.user.url, 'classURI':props.user.class, 'properties': props.user.properties}})
         .then(res => {
           const itemsGet = res.data;
           console.log("itemsGet", itemsGet);
           info3['results'] = itemsGet;
           props.nextStep();
           props.userCallback(info3);
           console.log("PostUserCallBack3", info3);
        })
      }
    };
    
    const handleChange = (event) => {
      var options = event.target.options;
      var value = []
      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
      props.user.properties = value;
    }

    return (
      <div>
        <span style={{ color: "red" }}>{error}</span>
        <h1>ExcelSior: Download</h1>
        <h2>Please select the corresponding attribute you would like to query.</h2>
        <FormGroup>
          <Label>
            Provided Database: <b>{props.user.url || ""}</b>
          </Label>
        </FormGroup>
        <FormGroup className="Radio">
          <Label>
            Selected Class: <b>{props.user.class || ""}</b>
          </Label>
          <Input multiple type="select" name="properties" onChange={handleChange}>
            {props.user.attributes? props.user.attributes.map(option => (
              <option key={option.URI} value={option.URI}>
                {option.URI}
              </option>
            )): ""}
          </Input> 
        </FormGroup>
        <FormGroup>
      </FormGroup>
        <br />
        <ActionButtons {...props} nextStep={validate3} />
      </div>
    );
  };
/*
const Five = (props) => {
  const [info3, setInfo3] = useState({});
  const [error, setError] = useState("");

  const onInputChanged = (event) => {
    const targetName = event.target.name;
    const targetValue = event.target.value;

    setInfo3((info3) => ({
      ...info3,
      [targetName]: targetValue
    }));
  };

  const validate3 = () => {
    if (!info3.age) setError("Age is mandatory field");
    else {
      setError("");
      props.nextStep();
      props.userCallback(info3);
    }
  };

  return (
    <div>
      <span style={{ color: "red" }}>{error}</span>
      <h1>Please select the corresponding class you would like to query.</h1>
      <FormGroup>
        <Label>
          Welcome <b>{props.user.name || ""}</b>
        </Label>
      </FormGroup>
      <FormGroup check>
        <Label check>
            <Input type="checkbox" />{' '}
            Check
        </Label>
      </FormGroup>
      <br />
      <ActionButtons {...props} nextStep={validate3} />
    </div>
  );
};*/

const Four = (props) => {
    console.log("FOUR: ", props.user);
  
    const handleLastStep = () => {
      props.lastStep();
      props.completeCallback();
    };
  
    const downloadResults = () => {
      const blob = new Blob([props.user.results], {type: 'text/csv'})
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = "downloadtest.csv";
      document.body.appendChild(element);
      element.click();
    }

    return (
      <div>
        <h2>Summary</h2>
        <p>Action: {props.user.path}</p>
        <p>Provided Database: <b>{props.user.url}</b></p>
        <p>Class: <b>{props.user.class || ""}</b></p>
        <p>Attributes: <b>{props.user.properties || ""}</b></p>
        <Button onClick={downloadResults}>Download Results</Button>
        <p>Results: </p><p>{props.user.results || ""}</p>
        <br />
        <ActionButtons {...props} lastStep={handleLastStep} />
      </div>
    );
  };

const Download = () => {
  const [stepWizard, setStepWizard] = useState(null);
  const [user, setUser] = useState({});
  const [activeStep, setActiveStep] = useState(0);

  const assignStepWizard = (instance) => {
    setStepWizard(instance);
  };

  const assignUser = (val) => {
    console.log("parent receive user callback");
    console.log(val);
    setUser((user) => ({
      ...user,
      ...val
    }));
    console.log("here");
    console.log(user);
  };

  const handleStepChange = (e) => {
    console.log("step change");
    console.log(e);
    setActiveStep(e.activeStep - 1);
  };

  const handleComplete = () => {
    alert("You r done. TQ");
  };

  return (
    <div>
      <Stepper activeStep={activeStep}>
        <Step label="Welcome" children={<MdDescription />} />
        <Step label="Class Selection" />
        <Step label="Attribute Selection" />
        <Step label="File Download" />
      </Stepper>
      {/* NOTE: IMPORTANT !! StepWizard must contains at least 2 children components, else got error */}
      <StepWizard instance={assignStepWizard} onStepChange={handleStepChange}>
        <One userCallback={assignUser} />
        <Two user={user} userCallback={assignUser} />
        <Three user={user} userCallback={assignUser} />
        <Four user={user} userCallback={assignUser} />
      </StepWizard>
    </div>
  );
};

export default Download;
