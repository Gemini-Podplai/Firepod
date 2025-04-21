import React from 'react';
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from 'react-resizable-panels';
import './ResizablePanels.css';

const ResizablePanels = ({ 
  leftPanel, 
  rightPanel,
  defaultLeftSize = 40,
  defaultRightSize = 60
}) => {
  return (
    <div className="resizable-layout">
      <PanelGroup direction="horizontal" className="panel-group">
        <Panel 
          defaultSize={defaultLeftSize} 
          minSize={20} 
          className="panel left-panel"
        >
          {leftPanel}
        </Panel>
        
        <PanelResizeHandle className="resize-handle">
          <div className="handle-bar" />
        </PanelResizeHandle>
        
        <Panel 
          defaultSize={defaultRightSize} 
          minSize={30} 
          className="panel right-panel"
        >
          {rightPanel}
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default ResizablePanels;
