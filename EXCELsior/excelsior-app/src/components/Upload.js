import React, { useState, useEffect } from "react";
import { Stepper, Step } from "react-form-stepper";
import { MdDescription } from "react-icons/md";
import StepWizard from "react-step-wizard";
import { Row, Col, Button, FormGroup, Label, Input, FormText, Table } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";

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
            <Button onClick={handleBack}>Back</Button>
          </Col>
        )}
        <Col>
          {props.currentStep < props.totalSteps && (
            <Button onClick={handleNext}>Next</Button>
          )}
          {props.currentStep === props.totalSteps && (
            <Button onClick={handleFinish}>Finish</Button>
          )}
        </Col>
      </Row>
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
    if (!info1.file) setError("File Required");
    else {
      setError("");
      props.nextStep();
      props.userCallback(info1);
    }
  };

  return (
    <div className="FormGroup">
      <span style={{ color: "red" }}>{error}</span>
      <h1>Welcome to ExcelSior: Upload</h1>
      <h2>In order to begin, please upload a .csv file.</h2>
      <FormGroup>
          <Input type="file" name="file" accept=".csv" onChange={onInputChanged}/>
          <FormText color="muted">
            Any other file type will not be accepted.
          </FormText>
      </FormGroup>
      <br />
      <ActionButtons {...props} nextStep={validate}/>
    </div>
  );
};

const Two = (props) => {
  const [info2, setInfo2] = useState({});
  const [error, setError] = useState("");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(0);

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

  const handleChange = (event) => {
    setSelected(event.target.value);
  }

  return (
    <div>
      <span style={{ color: "red" }}>{error}</span>
      <h1>ExcelSior: Upload</h1>
      <h2>Please select the corresponding class you would like to query.</h2>
      <FormGroup>
        <Label>
          Provided Database: <b>{props.user.file || ""}</b>
        </Label>
      </FormGroup>
      <FormGroup>
        <Label>Select</Label>
        <Input type="select" name="selected_class" onChange={handleChange}>
          {options.map(option => (
            <option key={option.URI} value={option.URI}>
              {option.URI}
            </option>
          ))}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label>Selected: <b>{selected || "None"}</b></Label>
        <Input type="textarea" name="renamedclass"></Input>
      </FormGroup>
      <Button >Rename</Button><br />
      <Label></Label>
      <ActionButtons {...props} nextStep={validate2} />
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>URI</th>
            <th>Label</th>
          </tr>
        </thead>
      </Table>
      <FormGroup>
      </FormGroup>
      <br />
    </div>
  );
};

const Three = (props) => {
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
        <FormGroup>
          <Label>
            Selected Class: <b>Class 1</b>
          </Label>
        </FormGroup>
        <FormGroup>
        <FormGroup check>
            <Label check>
                <Input type="radio" name="radio1" onClick={() => setInfo3('Attribute 1')} /> {' '}
                Attribute 1
            </Label>
        </FormGroup>
        <FormGroup check>
            <Label check>
                <Input type="radio" name="radio1" onClick={() => setInfo3('Attribute 2')} />{' '}
                Attribute 2
            </Label>
        </FormGroup>
        <FormGroup check>
            <Label check>
                <Input type="radio" name="radio1" onClick={() => setInfo3('Attribute 3')} />{' '}
                Attribute 3
            </Label>
        </FormGroup>
        <FormGroup check>
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

const Upload = () => {
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

export default Upload;
