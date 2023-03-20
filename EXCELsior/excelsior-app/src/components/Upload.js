import React, { useState, useEffect } from "react";
import { Stepper, Step } from "react-form-stepper";
import { MdDescription, MdUpload } from "react-icons/md";
import StepWizard from "react-step-wizard";
import { Row, Col, Button, Form, FormGroup, Label, Input, FormText, Table } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";

const backend_url = 'http://127.0.0.1:3010'

const Upload = () => {
  const [state, updateState] = useState({
    form:{}
  })
  const [activeStep, setActiveStep] = useState(0);

  const setInstance = (SW) => updateState({
    ...state,
    SW
  });

  const updateForm = (key, val) => {
    const { form } = state;
    form[key] = val;
    updateState({
      ...state,
      form
    })
  }

  const handleStepChange = (e) => {
    setActiveStep(e.activeStep - 1);
  };

  return (
    <div>
      <Stepper activeStep={activeStep}>
        <Step label="CSV Upload" children={<MdDescription />} />
        <Step label="Attribute Mapping" />
        <Step label="Database Endpoint" />
        <Step label="Execute Update" />
      </Stepper>
      {/* NOTE: IMPORTANT !! StepWizard must contains at least 2 children components, else got error */}
      <StepWizard instance={setInstance} onStepChange={handleStepChange}>
        <One update={updateForm} />
        <Two form={state.form} update={updateForm} />
        <Three form={state.form} update={updateForm} />
        <Four form={state.form} />
      </StepWizard>
    </div>
  );
};


// Buttons to move through steps
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
  const [file, setFile] = useState(null);
  const [attr, setAttr] = useState([]);
  const [error, setError] = useState("");

  useEffect(()=>{
    let fileReader;
    let isCancel = false;
    if(file){
      fileReader = new FileReader();
      fileReader.onload = (e) => {
          const {result} = e.target;
          if(result && !isCancel){
            setAttr(result.split('\n')[0].split(',').slice(1));
          }
      }

      fileReader.readAsText(file)
    }

    return () => {
      isCancel = true;
      if(fileReader && fileReader.readyState === 1){
          fileReader.abort();
      }
    }
  }, [file]);

  if(!props.isActive){
    return; 
  }

  const onInputChanged = (event) => {
      const upFile = event.target.files[0];
      setFile(upFile);
  };

  const validate = () => {
      if (!file) setError("File Required");
      else {
      setError("");
      props.update('file', file);
      props.update('attributes', attr)
      props.nextStep();
      }
  };

  return (
      <div className="FormGroup">
      <span style={{ color: "red" }}>{error}</span>
      <h1>Welcome to EXCELsior: Upload</h1>
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
  const [attrMap, setAttrMap] = useState({});
  const [error, setError] = useState("");

  if(!props.isActive){
    return; 
  }

  const onInputChanged = (event) => {
    const targetName = event.target.name;
    const targetValue = event.target.value;

    setAttrMap((attrMap) => ({
      ...attrMap,
      [targetName]: targetValue
    }));
  };

  const validate = () => {
    setError("");
    props.update('attributesMap', attrMap);
    props.nextStep();
  }

  return (
    <div>
      <span style={{ color: "red" }}>{error}</span>
      <h2>If necessary, provide the correct URI for each field.</h2>
      {<Form>
        {
          props.form.attributes.map(attribute => (
            <FormGroup key={attribute} row>
              <Label for={attribute} sm={2}> {attribute} </Label>
              <Col sm={10}>
                <Input
                  type="text"
                  id={attribute}
                  name={attribute}
                  onChange={onInputChanged} />
              </Col>
            </FormGroup>           
          ))
        }
      </Form>}
      <br />
      <ActionButtons {...props} nextStep={validate} />
    </div>
  );
}

const Three = (props) => {
  const [endpoint, setEndpoint] = useState("");
  const [error, setError] = useState("");

  if(!props.isActive){
    return; 
  }

  const onInputChanged = (event) => {
    const targetValue = event.target.value;
    setEndpoint(targetValue);
  };

  const validate = () => {
    if (endpoint === "") setError("URL for database update endpoint required.");
    else {
      setError("");
      props.update('endpoint', endpoint)
      props.nextStep();
    }
  };

  return (
    <div className="FormGroup">
      <span style={{ color: "red" }}>{error}</span>
      <h2>Enter a valid URL for the database update endpoint.</h2>
      <FormGroup>
        <Label></Label>
        <Input
          type="text"
          name="url"
          placeholder="Enter a URL"
          value={ endpoint ? endpoint : null }
          onChange={onInputChanged}
          className="FormInput"
        />
      </FormGroup>
      <br />
      <ActionButtons {...props} nextStep={validate}/>
    </div>
  );
};

const Four = (props) => {
  const [error, setError] = useState("");

  if(!props.isActive){
    return; 
  }

  const handleLastStep = () => {
    let formData = new FormData();
    formData.append("csv_file", props.form.file);
    formData.append("updateUrl", props.form.endpoint);
    formData.append("propertiesMap", JSON.stringify(props.form.attributesMap));

    axios.post(backend_url + '/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(() => {
      setError("");
      props.lastStep();
    })
    .catch( error => {
      if(error.response){
        setError(error.response.data);
      }
      else if(error.request){
        setError("Request timed out.")
      }
      else{
        setError("Unknown Error")
      }
    })

  };

  return(
    <div>
    <span style={{ color: "red" }}>{error}</span>
    <h2>Summary</h2>
    <p><b>Database Endpoint:</b> {props.form.endpoint}</p>
    <p><b>File:</b> {props.form.file.name}</p>
    <p><b>Attribute Mapping:</b></p>
    <Table>
      <thead>
        <tr>
          <th>Original</th>
          <th>New</th>
        </tr>
      </thead>
      <tbody>
        {
          Object.keys(props.form.attributesMap).map(orig => (
            <tr key={orig}>
              <td>{orig}</td>
              <td>{props.form.attributesMap[orig]}</td>
            </tr>
          ))
        }
      </tbody>
    </Table>
    <br />
    <ActionButtons {...props} lastStep={handleLastStep} />
  </div>
  )
}

export default Upload;