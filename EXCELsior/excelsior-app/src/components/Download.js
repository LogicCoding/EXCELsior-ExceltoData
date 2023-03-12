import React, { useState } from "react";
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
  console.log("one");
  console.log(props.user);
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

  const validate = () => {
    if (!info1.url) setError("Database URL Required");
    else {
      setError("");
      props.nextStep();
      props.userCallback(info1);
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
  const [info2, setInfo2] = useState({});
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  //const json = JSON.stringify({endpointUrl: props.user.url})
  //console.log(json)
  axios.get(backend_url + '/classes', {params: {'endpointUrl': props.user.url}})
    .then(res => {
      const classesGet = res.data;
      //console.log("found get")
      //console.log(classesGet)
      setClasses(classesGet)
    })

  
  const onInputChanged = (event) => {
    const targetName = event.target.name;
    const targetValue = event.target.value;

    setInfo2((info2) => ({
      ...info2,
      [targetName]: targetValue
    }));
  };

  const validate2 = () => {
    if (info2.classchoice) setError("Class must be selected.");
    else {
      setError("");
      props.nextStep();
      props.userCallback(info2);
    }
  };

  const handleChange = () => {
    console.log("hell")
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
        <Input type="select" name="selected_class" onChange={handleChange}>
          {classes.map(option => (
            <option key={option.URI} value={option.URI}>
              {option.URI}
            </option>
          ))}
        </Input>
        </FormGroup>
      <br />
      <ActionButtons {...props} nextStep={validate2} />
    </div>
  );
};

const Three = (props) => {
    const [info3, setInfo3] = useState({});
    const [error, setError] = useState("");
  

    axios.get(backend_url + '/properties', {params: {'endpointUrl': props.user.url, 'classURI':props.user.class}})
    .then(res => {
      const attributesGet = res.data;
      this.setState({ attributes: attributesGet });
    })


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
        props.nextStep();
        props.userCallback(info3);
      }
    };
    
    return (
      <div>
        <span style={{ color: "red" }}>{error}</span>
        <h1>ExcelSior: {props.user.path}</h1>
        <h2>Please select the corresponding attribute you would like to query.</h2>
        <FormGroup>
          <Label>
            Provided Database: <b>{props.user.url || ""}</b>
          </Label>
        </FormGroup>
        <FormGroup className="Radio">
          <Label>
            Selected Class: <b>Class 1</b>
          </Label>
        </FormGroup>
        <FormGroup>
        <FormGroup check className="Radio">
            <Label check>
                <Input type="radio" name="radio1" onClick={() => setInfo3('Attribute 1')} /> {' '}
                Attribute 1
            </Label>
        </FormGroup>
        <FormGroup check className="Radio">
            <Label check>
                <Input type="radio" name="radio1" onClick={() => setInfo3('Attribute 2')} />{' '}
                Attribute 2
            </Label>
        </FormGroup>
        <FormGroup check className="Radio">
            <Label check>
                <Input type="radio" name="radio1" onClick={() => setInfo3('Attribute 3')} />{' '}
                Attribute 3
            </Label>
        </FormGroup>
        <FormGroup check className="Radio">
            <Label check>
                <Input type="radio" name="radio1" onClick={() => setInfo3('Attribute 4')} />{' '}
                Attribute 4
            </Label>
        </FormGroup>
      </FormGroup>
        <br />
        <ActionButtons {...props} nextStep={validate3} />
      </div>
    );
  };

const Five = (props) => {
  const [info3, setInfo3] = useState({});
  const [error, setError] = useState("");



  axios.get(backend_url + '/csv', {params: {'endpointUrl': props.user.url, 'classURI':props.user.class, 'properties': props.user.attributes}})
    // .then(res => {
    //   const attributesGet = res.data;
    //   this.setState({ attributes: attributesGet });
    // })

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
};

const Four = (props) => {
    console.log("step4 receive user object");
    console.log(props.user);
  
    const handleLastStep = () => {
      props.lastStep();
      props.completeCallback();
    };
  
    return (
      <div>
        <h2>Summary</h2>
        <p>Action: {props.user.path}</p>
        <p>Provided Database: <b>{props.user.url}</b></p>
        <p>Class: <b>Class 1</b></p>
        <p>Attribute: <b>Attribute 3</b></p>
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
        <Four user={user} completeCallback={handleComplete} />
      </StepWizard>
    </div>
  );
};

export default Download;
