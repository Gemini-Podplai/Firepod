import React, { useState } from 'react';
import { Tabs } from 'antd';
import ParametersTab from './ParametersTab';
import { ModelParameters, DEFAULT_PARAMETERS } from '../types/model';

const { TabPane } = Tabs;

interface RightPanelProps {
  onParametersChange?: (parameters: ModelParameters) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ onParametersChange }) => {
  const [parameters, setParameters] = useState<ModelParameters>(DEFAULT_PARAMETERS);
  
  const handleParametersChange = (newParams: ModelParameters) => {
    setParameters(newParams);
    if (onParametersChange) {
      onParametersChange(newParams);
    }
  };

  return (
    <div className="right-panel">
      <Tabs defaultActiveKey="parameters">
        <TabPane tab="Parameters" key="parameters">
          <ParametersTab 
            initialParameters={parameters} 
            onChange={handleParametersChange} 
          />
        </TabPane>
        {/* Add other tabs here as needed */}
      </Tabs>
    </div>
  );
};

export default RightPanel;
