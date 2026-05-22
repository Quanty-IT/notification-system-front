import Select from 'react-select';
import { AppSelectOption, AppSelectProps } from './types';

export const AppSelect = ({ value, options, placeholder, isDisabled, onChange, width = '100%' }: AppSelectProps) => {
  const selectedOption = options.find((option) => option.value === value) ?? null;

  return (
    <Select<AppSelectOption>
      value={selectedOption}
      options={options}
      placeholder={placeholder}
      isDisabled={isDisabled}
      onChange={(option) => onChange(option?.value ?? '')}
      styles={{
        container: (base) => ({
          ...base,
          width,
        }),
        control: (base, state) => ({
          ...base,
          width: '100%',
          minHeight: '52px',
          borderRadius: '12px',
          borderColor: state.isFocused ? '#2f7d32' : '#d6ddd2',
          boxShadow: state.isFocused ? '0 0 0 1px #2f7d32' : '0 6px 18px rgba(15, 23, 42, 0.06)',
          backgroundColor: '#fff',
          padding: '0 6px',
          cursor: 'pointer',
        }),
        valueContainer: (base) => ({
          ...base,
          padding: '0 10px',
        }),
        menu: (base) => ({
          ...base,
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
          zIndex: 30,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected ? '#2f7d32' : state.isFocused ? '#eef8ef' : '#fff',
          color: state.isSelected ? '#fff' : '#1f2933',
          fontWeight: state.isSelected ? 700 : 500,
          cursor: 'pointer',
        }),
        singleValue: (base) => ({
          ...base,
          color: '#111827',
          fontWeight: 600,
        }),
        placeholder: (base) => ({
          ...base,
          color: '#6b7280',
          fontWeight: 500,
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
      }}
    />
  );
};
