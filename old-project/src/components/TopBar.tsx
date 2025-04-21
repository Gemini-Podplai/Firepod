import React from 'react';
import { Layout, Select, Space } from 'antd';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '../types/model';
import ThemeToggle from './ThemeToggle';

const { Header } = Layout;
const { Option } = Select;

interface TopBarProps {
  currentModelId: string;
  onModelSelect: (modelId: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ currentModelId, onModelSelect }) => {
  return (
    <Header className="top-bar">
      <div className="logo">Podplai Studio</div>
      <Space>
        <div className="model-selector-container">
          <label htmlFor="model-selector" className="model-selector-label">Model:</label>
          <Select
            id="model-selector"
            value={currentModelId || DEFAULT_MODEL_ID}
            onChange={onModelSelect}
            className="model-selector"
          >
            {AVAILABLE_MODELS.map((model) => (
              <Option key={model.id} value={model.id}>
                {model.name}
              </Option>
            ))}
          </Select>
        </div>
        <ThemeToggle className="theme-toggle-button" />
      </Space>
    </Header>
  );
};

export default TopBar;
