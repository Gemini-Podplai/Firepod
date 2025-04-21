import React, { useState, useEffect } from 'react';
import { Slider, Input, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ModelParameters, PARAMETER_DESCRIPTIONS, DEFAULT_PARAMETERS } from '../types/model';

interface ParametersTabProps {
  initialParameters: ModelParameters;
  onChange: (parameters: ModelParameters) => void;
}

const ParameterFeedback: React.FC<{ paramName: keyof ModelParameters; value: number }> = ({ 
  paramName, 
  value 
}) => {
  let message = '';
  
  if (paramName === 'temperature') {
    if (value < 0.3) message = 'More focused and deterministic responses';
    else if (value < 0.7) message = 'Balanced creativity and coherence';
    else message = 'More creative and diverse responses';
  }
  else if (paramName === 'topP') {
    if (value < 0.5) message = 'Very focused token selection';
    else if (value < 0.9) message = 'Balanced token selection';
    else message = 'Diverse token selection';
  }
  else if (paramName === 'topK') {
    if (value < 20) message = 'Limited to most likely tokens';
    else if (value < 60) message = 'Moderate token variety';
    else message = 'Wide range of possible tokens';
  }
  else if (paramName === 'maxTokens') {
    if (value < 500) message = 'Short responses';
    else if (value < 1500) message = 'Medium-length responses';
    else message = 'Long, detailed responses';
  }

  return <div className="parameter-feedback">{message}</div>;
};

export const ParametersTab: React.FC<ParametersTabProps> = ({ initialParameters, onChange }) => {
  const [parameters, setParameters] = useState<ModelParameters>(initialParameters || DEFAULT_PARAMETERS);
  
  useEffect(() => {
    onChange(parameters);
  }, [parameters, onChange]);

  const handleParameterChange = (
    paramName: keyof ModelParameters, 
    value: number
  ) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const renderParameterControl = (paramName: keyof ModelParameters) => {
    const param = PARAMETER_DESCRIPTIONS[paramName];
    const value = parameters[paramName];
    
    return (
      <div className="parameter-container" key={paramName}>
        <div className="parameter-header">
          <span className="parameter-title">{param.title}</span>
          <Tooltip title={param.description}>
            <InfoCircleOutlined className="parameter-info-icon" />
          </Tooltip>
          <span className="parameter-value">{value}</span>
        </div>
        
        {paramName === 'maxTokens' ? (
          <Input 
            type="number"
            value={value}
            min={param.min}
            max={param.max}
            onChange={(e) => handleParameterChange(paramName, parseInt(e.target.value) || param.min)}
          />
        ) : (
          <Slider 
            value={value}
            min={param.min}
            max={param.max}
            step={param.step}
            onChange={(val) => handleParameterChange(paramName, val)}
          />
        )}
        
        <ParameterFeedback paramName={paramName} value={value} />
      </div>
    );
  };

  return (
    <div className="parameters-tab">
      <h3>Model Parameters</h3>
      <p className="parameters-description">
        Adjust these parameters to control how the AI generates responses
      </p>
      
      {renderParameterControl('temperature')}
      {renderParameterControl('topP')}
      {renderParameterControl('topK')}
      {renderParameterControl('maxTokens')}
      
      <div className="parameters-reset">
        <button 
          className="reset-button" 
          onClick={() => setParameters(DEFAULT_PARAMETERS)}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default ParametersTab;
